import { GameState, User, GameEvent } from '@/types';
import { v4 as uuidv4 } from 'uuid';


// import { processGameTick as originalProcessGameTick } from './gameLogic'; // Removed circular dependency
import { EVENT_TEMPLATES } from './eventData';

export function processGameTick(state: GameState): { newState: GameState, hasChanged: boolean } {
    const now = Date.now();
    let newState = { ...state };
    let hasChanged = false;

    // Safety checks
    if (isNaN(newState.lastTick)) newState.lastTick = now;
    if (isNaN(newState.timeRemaining)) newState.timeRemaining = newState.settings.turnDuration;

    // 時間経過の計算
    const elapsed = now - newState.lastTick;

    // Default isTimerRunning to true if undefined
    if (typeof newState.isTimerRunning === 'undefined') {
        newState.isTimerRunning = true;
        hasChanged = true;
    }

    // タイマーが停止中の場合、lastTickだけ更新して時間は減らさない
    if (!newState.isTimerRunning) {
        newState.lastTick = now;
        // 保存が必要な場合（pause直後など）は考慮が必要だが、
        // 基本的にpollingでhasChanged=falseなら保存されない。
        // ここでは前回セーブから時間が経っているがタイマーは進めない。
        // ただし、lastTickを更新して保存しないと、次に再開したときに「休止期間」が「経過時間」として計算されてしまう恐れがある？
        // いや、再開時に lastTick = now にするから大丈夫。
        return { newState, hasChanged };
    }

    if (elapsed >= 1000) { // 1秒以上経過していたら更新
        newState.timeRemaining -= elapsed;
        hasChanged = true;

        // ターン切り替え
        if (newState.timeRemaining <= 0) {
            newState.timeRemaining = newState.settings.turnDuration;
            newState.isDay = !newState.isDay; // 昼夜逆転

            // ログ追加
            newState.news.unshift({
                id: uuidv4(),
                message: `時間経過: ${newState.isDay ? '朝になりました ☀️' : '夜になりました 🌙'}`,
                timestamp: Date.now()
            });
            if (newState.news.length > 50) newState.news.pop();

            // 夜になった時の処理 (自動徴収など)
            if (!newState.isDay) {
                // ここに夜のイベント処理を追加 (Day -> Night)
                newState = processNightEvents(newState);
            } else {
                // 朝になった時の処理 (Night -> Day)
                newState.turn += 1; // 日付が進む

                // -----------------------------------------------------
                // Politics: Check Proposal Deadlines (Server-side logic simulation)
                // -----------------------------------------------------
                // Note: In a real app this would be a separate DB worker.
                // Here we can't easily access DB inside simple state function without async.
                // Since processGameTick is synchronous and runs in memory (or client), 
                // we can't check DB proposals here easily.
                // Instead, we will assume the API route or a separate scheduled task handles proposal resolution.
                // However, for this task requirement "updating game settings", we might need a hook.
                // Let's rely on an external trigger or check if we can fetch via API in the loop (bad practice).
                // Alternative: The /api/game/tick or similar endpoint should handle it.
                // Valid Approach: We leave the resolution to a dedicated API call or user interaction for now,
                // OR we accept that we can't resolve it strictly every tick without DB access.
                // BUT, if we want "automatic" resolution, we need an async worker.
                // For this environment, let's skip adding it to synchronous `processGameTick` 
                // and assume an API endpoint `/api/politics/resolve` is called periodically by the client or admin.
                // I will update the PoliticsApp to call "resolve" endpoint occasionally or just handle it purely via API.

                // -----------------------------------------------------
                // Quest System Logic
                // -----------------------------------------------------
                const QUEST_DATABASE: any[] = [
                    {
                        id: 'quest_first_job',
                        title: 'はじめての仕事',
                        description: '職安で仕事を見つけて就職しよう！',
                        type: 'main',
                        requirements: { type: 'job', value: 'unemployed', comparison: 'neq' }, // job !== unemployed
                        rewards: { money: 1000, xp: 50, popularity: 5 }
                    },
                    {
                        id: 'quest_debt_free',
                        title: '借金完済',
                        description: '借金を0にして自由を手に入れよう！',
                        type: 'main',
                        requirements: { type: 'debt', value: 0, comparison: 'lte' }, // debt <= 0
                        rewards: { money: 5000, xp: 100, popularity: 20 }
                    }
                ];

                // Check & Update Quests for each user
                newState.users = newState.users.map(user => {
                    let u = { ...user };
                    if (u.role !== 'player') return u;

                    // 1. Initialize Quests if missing
                    if (!u.quests) u.quests = [];
                    if (!u.completedQuestIds) u.completedQuestIds = [];

                    QUEST_DATABASE.forEach(qData => {
                        const isCompleted = u.completedQuestIds?.includes(qData.id);
                        const isActive = u.quests?.some(q => q.questId === qData.id);

                        if (!isCompleted && !isActive) {
                            u.quests!.push({
                                questId: qData.id,
                                status: 'active',
                                progress: 0,
                                startedAt: Date.now()
                            });
                            // New Quest Notification (Optional, maybe too spammy on login)
                        }
                    });

                    // 2. Check Progress
                    u.quests = u.quests!.map(progress => {
                        if (progress.status !== 'active') return progress;

                        const qData = QUEST_DATABASE.find(q => q.id === progress.questId);
                        if (!qData) return progress;

                        let isMet = false;
                        const req = qData.requirements;

                        if (req.type === 'job') {
                            if (req.comparison === 'neq') isMet = u.job !== req.value;
                            else isMet = u.job === req.value;
                        } else if (req.type === 'debt') {
                            // Special case: Only complete if they had debt before? Or simply if debt is 0.
                            // For "Debt Free", implies reaching 0. Simple check: debt <= 0.
                            if (req.comparison === 'lte') isMet = u.debt <= req.value;
                        }

                        if (isMet) {
                            progress.status = 'completed';
                            progress.completedAt = Date.now();
                            progress.progress = 100;
                            u.completedQuestIds!.push(qData.id);

                            // Give Rewards
                            if (qData.rewards.money) {
                                u.balance += qData.rewards.money;
                                // Log reward
                                if (!u.transactions) u.transactions = [];
                                u.transactions.push({
                                    id: uuidv4(),
                                    type: 'income',
                                    amount: qData.rewards.money,
                                    description: `クエスト報酬: ${qData.title}`,
                                    timestamp: Date.now()
                                });
                            }
                            if (qData.rewards.popularity) {
                                u.popularity = (u.popularity || 0) + qData.rewards.popularity;
                            }

                            // Notification Trigger (via News or Toast State?)
                            // Since this runs on server/logic side, we use newState.news or a dedicated event queue
                            // For now, push to news, client can watch news for "Quest Completed" or use a separate event system
                            newState.news.unshift({
                                id: uuidv4(),
                                type: 'achievement', // Special new type for news
                                message: `🏆 クエスト達成！「${qData.title}」`,
                                timestamp: Date.now()
                            });
                        }
                        return progress;
                    });

                    return u;
                });

                // ユーザーごとの処理 (Original Logic Continues)
                newState.users = newState.users.map(user => {
                    let u = { ...user };
                    // ... (rest of the logic)

                    // 1. 給与支給 (銀行員は税金免除、プレイヤーは税金あり)
                    // グローバル収入倍率を取得
                    const moneyMultiplier = state.settings?.moneyMultiplier || 1;

                    if (u.role === 'banker') {
                        u.balance += 1000 * moneyMultiplier; // 銀行員給料 × 倍率
                    } else if (!u.isOff) { // お休み中でないプレイヤーのみ給与を支払う
                        // プレイヤーの給料計算（職業ベース）
                        const JOB_DEFINITIONS: any = {
                            normal: { salary: 500 },
                            police: { salary: 800 },
                            thief: { salary: 600 },
                            idol: { salary: 1200 }
                        };
                        const jobDef = JOB_DEFINITIONS[u.jobType || 'normal'] || JOB_DEFINITIONS.normal;
                        let salary = jobDef.salary * moneyMultiplier; // 給料 × 倍率

                        // 人気度ボーナス (Rating * 5%)
                        const ratingBonus = Math.floor(salary * (u.rating || 0) * 0.05);
                        salary += ratingBonus;

                        const tax = Math.floor(salary * state.settings.taxRate);
                        const netIncome = salary - tax;

                        // 自動貯金
                        const autoSave = Math.floor(netIncome * (state.settings.salaryAutoSafeRate || 0.1));
                        const cash = netIncome - autoSave;

                        u.balance += cash;
                        u.deposit += autoSave;
                        u.unpaidTax = (u.unpaidTax || 0);

                        // 取引履歴
                        if (!u.transactions) u.transactions = [];
                        u.transactions.push({
                            id: uuidv4(),
                            type: 'income',
                            amount: cash,
                            description: `給料支給 (${u.job})`,
                            timestamp: Date.now()
                        });
                    }


                    // 2. ショップ売上シミュレーション (Day start)
                    if (u.shopName && state.isDay && !u.isOff) {
                        const baseCustomers = Math.floor(Math.random() * 3); // 0-2人
                        const extraCustomers = Math.floor((u.rating || 0) / 2);
                        let customers = baseCustomers + extraCustomers;

                        // 天候による客足への影響
                        const weather = state.environment?.weather || 'sunny';
                        const weatherMultipliers: Record<string, number> = {
                            sunny: 1.2,     // 晴れ: 客足+20%
                            rain: 0.8,      // 雨: 客足-20%
                            heavy_rain: 0.6, // 大雨: 客足-40%
                            storm: 0.3,     // 嵐: 客足-70%
                            snow: 0.7,      // 雪: 客足-30%
                            heatwave: 0.9,  // 猛暑: 客足-10%
                        };
                        const weatherMult = weatherMultipliers[weather] ?? 1.0;
                        customers = Math.floor(customers * weatherMult);

                        if (customers > 0) {
                            let sales = customers * 100;

                            // Apply Active Event Multipliers
                            const boomEvent = state.activeEvents?.find(e => e.type === 'boom' || e.type === 'festival');
                            const recessionEvent = state.activeEvents?.find(e => e.type === 'recession');

                            if (boomEvent) sales = Math.floor(sales * boomEvent.effectValue);
                            if (recessionEvent) sales = Math.floor(sales * recessionEvent.effectValue);

                            // Apply God Mode Money Multiplier
                            sales = Math.floor(sales * moneyMultiplier);

                            u.balance += sales;

                            // 履歴追加 (通知トリガー用)
                            if (!u.transactions) u.transactions = [];
                            u.transactions.push({
                                id: uuidv4(),
                                type: 'income',
                                amount: sales,
                                senderId: 'customer_sim', // システムによる一般客
                                description: `売上: 一般客 (${customers}名) ${weather !== 'sunny' ? `[${weather}]` : ''}`,
                                timestamp: Date.now()
                            });
                        }
                    }

                    return u;
                });
            }
        }


        // NPC Logic (process every tick or every second)
        // Random NPC Spawn Logic (e.g. check every 1 second)
        if (now - newState.lastTick >= 1000) {
            // -----------------------------------------------------
            // Advanced Customer AI Spawn Logic
            // -----------------------------------------------------
            if (now - newState.lastTick >= 2000) { // Check every 2 seconds
                if (newState.isDay) {
                    const shopOwners = newState.users.filter(u => u.shopName && u.role === 'player');

                    shopOwners.forEach(owner => {
                        // Base spawn chance based on Reputation/Popularity
                        // Reputation 0-5 stars. 
                        // Chance: (Rep * 5) + (Popularity / 10) %
                        const reputation = owner.rating || 1;
                        const popularity = owner.popularity || 0;
                        const spawnChance = (reputation * 5) + (popularity / 50) + 5; // Min 5% per check

                        if (Math.random() * 100 < spawnChance) {
                            // Spawn Customer
                            const templates = newState.npcTemplates?.filter(t => t.actionType === 'buy') || [];
                            const template = templates.length > 0
                                ? templates[Math.floor(Math.random() * templates.length)]
                                : { id: 'guest', name: 'Guest', description: 'Customer', duration: 10000, actionType: 'buy' }; // Fallback

                            const customer: any = { // Type assertion for flexibility
                                id: uuidv4(),
                                targetUserId: owner.id,
                                templateId: template.id || 'guest',
                                type: 'customer',
                                name: `Customer ${Math.floor(Math.random() * 1000)}`, // Unique names
                                description: 'Shopping',
                                entryTime: now,
                                leaveTime: now + (template.duration || 15000), // 15 sec visit
                                effectApplied: false,
                                budget: (Math.random() * 5000) + 1000 // 1000 - 6000 yen budget
                            };

                            if (!newState.activeNPCs) newState.activeNPCs = [];
                            newState.activeNPCs.push(customer);

                            // Optional: Notification for very high value customers?
                            // newState.news.unshift(...)
                        }
                    });
                }
            }

            // NPC Logic (process active NPCs)
            if (newState.activeNPCs && newState.activeNPCs.length > 0) {
                const initialCount = newState.activeNPCs.length;
                newState.activeNPCs = newState.activeNPCs.filter(npc => {
                    // Check ownership
                    const targetUser = newState.users.find(u => u.id === npc.targetUserId);
                    if (!targetUser) return false; // User gone, remove NPC

                    const template = newState.npcTemplates?.find(t => t.id === npc.templateId);
                    // Fallback if template missing
                    if (!template && !npc.type) return false;

                    // Determine Action Type & Params
                    const actionType = template?.actionType || npc.actionType || 'buy';

                    // Effect triggering (e.g. at leave time)
                    if (now >= npc.leaveTime) {
                        if (!npc.effectApplied) {
                            // Apply Effect based on Template
                            if (actionType === 'steal_money' || actionType === 'scam') {
                                // Steal Money Logic
                                const min = template?.minStealAmount ?? 100;
                                const max = template?.maxStealAmount ?? 1000;
                                const stolen = Math.floor(min + Math.random() * (max - min));

                                targetUser.balance -= stolen;
                                if (targetUser.balance < 0) targetUser.balance = 0;

                                // Log
                                newState.news.unshift({
                                    id: uuidv4(),
                                    message: `🚨 ${targetUser.name}のお店で${npc.name}による被害！ ${stolen}枚 失いました...`,
                                    timestamp: now
                                });
                            } else if (actionType === 'buy' || npc.type === 'customer') {
                                // DETAILED SHOPPING LOGIC
                                // 1. Check Shop Items
                                const items = targetUser.shopItems || [];
                                const budget = npc.budget || 5000;
                                let spent = 0;
                                const purchasedItems: string[] = [];

                                // 2. Select Items to Buy
                                // Shuffle items to random browse
                                const shuffledItems = [...items].sort(() => 0.5 - Math.random());

                                shuffledItems.forEach(item => {
                                    if (spent >= budget) return;
                                    if (item.isSold || item.stock <= 0) return; // Skip sold out
                                    if (item.price > (budget - spent)) return;

                                    // Purchase Chance (Price vs Quality/Demand placeholder)
                                    // Simplify: 50% chance to buy if affordable
                                    if (Math.random() < 0.5) {
                                        // Buy 1 unit
                                        item.stock -= 1;
                                        // Auto-tag as isSold if stock 0? (Currently boolean isSold is used, maybe simple switch)
                                        if (item.stock <= 0) item.isSold = true;

                                        spent += item.price;
                                        purchasedItems.push(item.name);
                                    }
                                });

                                // 3. Process Transaction if bought anything
                                if (spent > 0) {
                                    targetUser.balance += spent;

                                    if (!targetUser.transactions) targetUser.transactions = [];
                                    targetUser.transactions.push({
                                        id: uuidv4(),
                                        type: 'income',
                                        amount: spent,
                                        senderId: npc.id,
                                        description: `売上: ${npc.name} (${purchasedItems.join(', ')})`,
                                        timestamp: now
                                    });

                                    // Log large purchases
                                    if (spent > 5000) {
                                        newState.news.unshift({
                                            id: uuidv4(),
                                            message: `💰 ${targetUser.name}のお店で${npc.name}が爆買い！ 合計 ${spent.toLocaleString()}枚`,
                                            timestamp: now
                                        });
                                    }
                                }
                            }
                            npc.effectApplied = true;
                        }
                        return false; // Remove after effect
                    }

                    // Keep NPC if time not up
                    return true;
                });

                if (newState.activeNPCs.length !== initialCount) {
                    hasChanged = true;
                }
            }

            // Random Large-Scale Event Logic (Check every 1 second)
            if (now - newState.lastTick >= 1000) {
                // Remove Expired Events
                if (newState.activeEvents && newState.activeEvents.length > 0) {
                    const activeCount = newState.activeEvents.length;
                    newState.activeEvents = newState.activeEvents.filter(e => now < e.startTime + e.duration);
                    if (newState.activeEvents.length !== activeCount) hasChanged = true;
                }

                // Trigger New Event (if none active, low chance)
                // 0.5% chance per second
                if ((!newState.activeEvents || newState.activeEvents.length === 0) && Math.random() < 0.005) {
                    const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
                    const newEvent: GameEvent = {
                        id: uuidv4(),
                        ...template,
                        startTime: now
                    };

                    if (!newState.activeEvents) newState.activeEvents = [];
                    newState.activeEvents.push(newEvent);

                    // Instant Effects
                    if (newEvent.type === 'grant') {
                        newState.users = newState.users.map(u => ({ ...u, balance: u.balance + newEvent.effectValue }));
                    } else if (newEvent.type === 'tax_hike') {
                        newState.users = newState.users.map(u => ({ ...u, balance: Math.floor(u.balance * (1 - newEvent.effectValue)) }));
                    }

                    // Log
                    newState.news.unshift({
                        id: uuidv4(),
                        message: `📢 速報: ${newEvent.name} - ${newEvent.description}`,
                        timestamp: now
                    });
                    hasChanged = true;
                }

                // -----------------------------------------------------
                // Risk System: Police Raid (Night Only)
                // -----------------------------------------------------
                if (!newState.isDay) {
                    newState.users = newState.users.map(u => {
                        const hasForbiddenStocks = u.forbiddenStocks && Object.values(u.forbiddenStocks).some(val => val > 0);
                        const hasIllegalItems = u.inventory && u.inventory.some(i => i.isIllegal);

                        if (hasForbiddenStocks || hasIllegalItems) {
                            // 0.5% chance per second per user if holding illegal goods
                            if (Math.random() < 0.005) {
                                const fine = Math.floor(u.balance * 0.5);
                                u.balance -= fine;

                                // Log
                                u.transactions = u.transactions || [];
                                u.transactions.push({
                                    id: uuidv4(),
                                    type: 'tax', // or custom type
                                    amount: fine,
                                    senderId: 'police',
                                    description: '警察の手入れ（罰金）',
                                    timestamp: Date.now()
                                });

                                newState.news.unshift({
                                    id: uuidv4(),
                                    type: 'arrest',
                                    message: `🚓 【緊急】警察が ${u.name} の元へ突入！違法取引の疑いで罰金 ${fine.toLocaleString()}枚`,
                                    timestamp: Date.now()
                                });
                                hasChanged = true;
                            }
                        }
                        return u;
                    });
                }
            }

            newState.lastTick = now;
            return { newState, hasChanged };
        } else {
            return { newState, hasChanged };
        }
    }

    return { newState, hasChanged };
}

function processNightEvents(state: GameState): GameState {
    // 簡易的な夜間処理
    // 必要に応じて拡張: 利子計算、税金徴収など
    return state;
}
