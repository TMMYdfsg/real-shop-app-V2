import { GameState, User, GameEvent } from '@/types';


import { processGameTick as originalProcessGameTick } from './gameLogic'; // self import fix? No.
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
        newState.lastTick = now;
        hasChanged = true;

        // ターン切り替え
        if (newState.timeRemaining <= 0) {
            newState.timeRemaining = newState.settings.turnDuration;
            newState.isDay = !newState.isDay; // 昼夜逆転

            // ログ追加
            newState.news.unshift({
                id: crypto.randomUUID(),
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

                // ユーザーごとの処理
                newState.users = newState.users.map(user => {
                    let u = { ...user };

                    // 1. 給与支給 (銀行員は税金免除、プレイヤーは税金あり)
                    if (u.role === 'banker') {
                        u.balance += 1000; // 銀行員給与
                    } else {
                        // プレイヤーの給与計算（職業ベース）
                        // 注意: サーバーサイド実行を想定しているが、ここはクライアントでも動く可能性がある共通ロジック
                        // import/require はNext.jsのクライアントコンポーネントで問題になる可能性があるため
                        // 定義をここに持つか、純粋なデータとして扱うのが安全
                        const JOB_DEFINITIONS: any = {
                            normal: { salary: 500 },
                            police: { salary: 800 },
                            thief: { salary: 600 },
                            idol: { salary: 1200 }
                        };
                        const jobDef = JOB_DEFINITIONS[u.jobType || 'normal'] || JOB_DEFINITIONS.normal;
                        let salary = jobDef.salary;

                        // 人気度ボーナス (Rating * 5%)
                        const ratingBonus = Math.floor(salary * (u.rating || 0) * 0.05);
                        salary += ratingBonus;

                        const tax = Math.floor(salary * state.settings.taxRate);
                        const netIncome = salary - tax;

                        // 自動貯金
                        const autoSave = Math.floor(netIncome * state.settings.salaryAutoSafeRate);
                        const cash = netIncome - autoSave;

                        u.balance += cash;
                        u.deposit += autoSave;
                        u.unpaidTax = (u.unpaidTax || 0);
                    }


                    // 2. ショップ売上シミュレーション (Day start)
                    if (u.shopName && state.isDay) {
                        const baseCustomers = Math.floor(Math.random() * 3); // 0-2人
                        const extraCustomers = Math.floor((u.rating || 0) / 2);
                        let customers = baseCustomers + extraCustomers;

                        if (customers > 0) {
                            let sales = customers * 100;

                            // Apply Active Event Multipliers
                            const boomEvent = state.activeEvents?.find(e => e.type === 'boom' || e.type === 'festival');
                            const recessionEvent = state.activeEvents?.find(e => e.type === 'recession');

                            if (boomEvent) sales = Math.floor(sales * boomEvent.effectValue);
                            if (recessionEvent) sales = Math.floor(sales * recessionEvent.effectValue);

                            u.balance += sales;
                        }
                    }

                    return u;
                });
            }
        }


        // NPC Logic (process every tick or every second)
        // Random NPC Spawn Logic (e.g. check every 1 second)
        if (now - newState.lastTick >= 1000) {
            if (newState.isDay && newState.npcTemplates) {
                const players = newState.users.filter(u => u.role === 'player');
                if (players.length > 0) {
                    newState.npcTemplates.forEach(template => {
                        // Check spawn rate (e.g. rate is probability out of 100 per minute -> adjust for per second ~ rate / 60)
                        // Simplified: rate is % chance per tick (approx 1 sec)
                        // Use a smaller probability if rate is meant for longer periods. Assuming rate 0-100 per check.
                        // Let's treat spawnRate as "Probability per 10 seconds" or keep it simple % per tick
                        // User wants "spawnRate" control. Let's assume input 5 means 5% chance per tick.
                        if (Math.random() * 100 < template.spawnRate) {
                            const target = players[Math.floor(Math.random() * players.length)];

                            // Prevent spamming too many NPCs? Limit 1 per user? - Optional
                            // if (newState.activeNPCs.some(n => n.targetUserId === target.id)) return;

                            const newNPC: any = {
                                id: crypto.randomUUID(),
                                targetUserId: target.id,
                                templateId: template.id,
                                type: template.id,
                                name: template.name,
                                description: template.description,
                                entryTime: now,
                                leaveTime: now + template.duration,
                                effectApplied: false
                            };
                            if (!newState.activeNPCs) newState.activeNPCs = [];
                            newState.activeNPCs.push(newNPC);

                            newState.news.unshift({
                                id: crypto.randomUUID(),
                                message: `⚠️ ${target.name}のお店に「${template.name}」が来店しました！`,
                                timestamp: now
                            });
                            hasChanged = true;
                        }
                    });
                }
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
                const actionType = template?.actionType || 'buy'; // default

                // Effect triggering (e.g. at leave time)
                if (now >= npc.leaveTime) {
                    if (!npc.effectApplied) {
                        // Apply Effect based on Template
                        if (actionType === 'steal_money' || actionType === 'scam') {
                            // Steal Money
                            const min = template?.minStealAmount ?? 100;
                            const max = template?.maxStealAmount ?? 1000;
                            const stolen = Math.floor(min + Math.random() * (max - min));

                            targetUser.balance -= stolen;
                            if (targetUser.balance < 0) targetUser.balance = 0;

                            // Log
                            newState.news.unshift({
                                id: crypto.randomUUID(),
                                message: `🚨 ${targetUser.name}のお店で${npc.name}による被害！ ${stolen}枚 失いました...`,
                                timestamp: now
                            });
                        } else if (actionType === 'steal_items') {
                            // Steal Items (placeholder)
                        } else if (actionType === 'buy') {
                            // Buy
                            const min = template?.minPayment ?? 100;
                            const max = template?.maxPayment ?? 1000;
                            const sales = Math.floor(min + Math.random() * (max - min));
                            targetUser.balance += sales;

                            newState.news.unshift({
                                id: crypto.randomUUID(),
                                message: `💰 ${targetUser.name}のお店で${npc.name}が ${sales}枚 のお買い上げ！`,
                                timestamp: now
                            });
                        }
                        npc.effectApplied = true; // Mark as applied mostly formality as we remove below
                    }
                    return false; // Remove after effect (time up)
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
                    id: crypto.randomUUID(),
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
                    id: crypto.randomUUID(),
                    message: `📢 速報: ${newEvent.name} - ${newEvent.description}`,
                    timestamp: now
                });
                hasChanged = true;
            }
        }

        return { newState, hasChanged };

        function processNightEvents(state: GameState): GameState {
            // 簡易的な夜間処理
            // 必要に応じて拡張: 利子計算、税金徴収など
            return state;
        }
    } else {
        return { newState, hasChanged };
    }
}