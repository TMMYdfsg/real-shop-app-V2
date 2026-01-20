import { NextResponse, NextRequest } from 'next/server';
import { updateGameState } from '@/lib/dataStore';
import { GameState, User, Transaction } from '@/types';
import crypto from 'crypto';
import { generateLands, PREFECTURES } from '@/lib/cityData';

export const dynamic = 'force-dynamic';

// Helper for adding transactions (placed outside main function or inside if preferred scope allows)
const addHistory = (user: User, type: Transaction['type'], amount: number, description: string, targetId?: string, senderId?: string) => {
    if (!user.transactions) user.transactions = [];
    user.transactions.push({
        id: crypto.randomUUID(),
        type,
        amount,
        senderId: senderId || (type === 'income' ? 'system' : user.id),
        receiverId: targetId,
        description,
        timestamp: Date.now()
    });
};

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action, requestId, type, decision, season, amount } = body;

        // ... (change_season block skipped for brevity in this replacement if not needed, but we keep structure)
        if (action === 'change_season') {
            // ... existing change_season logic ...
            await updateGameState((state) => {
                if (season) state.season = season;
                state.news.push(`季節が ${season} に変わりました！`);
                // 税金発生
                state.users.forEach(u => {
                    if (u.role === 'player') {
                        const tax = Math.floor(u.balance * 0.1) + 100;
                        u.unpaidTax = (u.unpaidTax || 0) + tax;
                    }
                });
                state.news.push('季節の変わり目により、税金が発生しました。');
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'approve' || action === 'reject') {
            if (!requestId) return NextResponse.json({ error: 'RequestId required' }, { status: 400 });

            await updateGameState((state) => {
                const reqIndex = state.requests.findIndex(r => r.id === requestId);
                if (reqIndex === -1) return state;

                const req = state.requests[reqIndex];
                req.status = action === 'approve' ? 'approved' : 'rejected';

                if (action === 'approve') {
                    const user = state.users.find(u => u.id === req.requesterId);
                    if (user) {
                        if (req.type === 'income') {
                            user.balance += req.amount;
                            addHistory(user, 'income', req.amount, '給料/収入');

                            const saving = Math.floor(req.amount * state.settings.salaryAutoSafeRate);
                            if (saving > 0 && user.balance >= saving) {
                                user.balance -= saving;
                                user.deposit += saving;
                                addHistory(user, 'deposit', saving, '自動貯金');
                            }
                        } else if (req.type === 'loan') {
                            user.balance += req.amount;
                            user.debt += req.amount;
                            addHistory(user, 'income', req.amount, '借金');
                        } else if (req.type === 'repay') {
                            if (user.balance >= req.amount) {
                                user.balance -= req.amount;
                                user.debt = Math.max(0, user.debt - req.amount);
                                addHistory(user, 'payment', req.amount, '借金返済');
                            } else {
                                req.status = 'rejected';
                            }
                        } else if (req.type === 'pay_tax') {
                            if (user.balance >= req.amount) {
                                user.balance -= req.amount;
                                user.unpaidTax = Math.max(0, (user.unpaidTax || 0) - req.amount);
                                addHistory(user, 'tax', req.amount, '納税');
                            } else {
                                req.status = 'rejected';
                            }
                        } else if (req.type === 'tax' || req.type === 'bill') {
                            const targetId = req.details;
                            const target = targetId ? state.users.find(u => u.id === targetId) : null;

                            if (target && targetId && targetId !== 'Self Payment' && targetId !== 'Tax Payment') {
                                // Charge: Target pays Requester
                                let paidAmount = 0;
                                if (target.balance >= req.amount) {
                                    target.balance -= req.amount;
                                    user.balance += req.amount;
                                    paidAmount = req.amount;
                                } else {
                                    paidAmount = req.amount; // 借金してでも払う
                                    target.balance -= req.amount;
                                    if (target.balance < 0) {
                                        target.debt += Math.abs(target.balance);
                                        target.balance = 0;
                                    }
                                    user.balance += req.amount;
                                }
                                addHistory(target, 'payment', paidAmount, `支払い: ${user.name}`, user.id);
                                addHistory(user, 'income', paidAmount, `受取: ${target.name}`, user.id, target.id);

                                // ポイント加算 (100枚につき1pt)
                                const points = Math.floor(paidAmount / 100);
                                if (points > 0) {
                                    if (!target.pointCards) target.pointCards = [];
                                    let card = target.pointCards.find(c => c.shopOwnerId === user.id);
                                    if (!card) {
                                        card = { shopOwnerId: user.id, points: 0 };
                                        target.pointCards.push(card);
                                    }
                                    card.points += points;
                                }
                            } else {
                                // Self Payment
                                if (user.balance >= req.amount) {
                                    user.balance -= req.amount;
                                    addHistory(user, 'payment', req.amount, '支払い');
                                }
                            }
                        } else if (req.type === 'transfer') {
                            const targetId = req.details;
                            const target = state.users.find(u => u.id === targetId);
                            if (target && targetId) {
                                if (user.balance >= req.amount) {
                                    user.balance -= req.amount;
                                    target.balance += req.amount;
                                    addHistory(user, 'transfer', req.amount, `送金: ${target.name}`, target.id);
                                    addHistory(target, 'income', req.amount, `受取: ${user.name}`, target.id, user.id);
                                } else {
                                    req.status = 'rejected';
                                }
                            }
                        } else if (req.type === 'buy_stock') {
                            const stockId = req.details;
                            const quantity = req.amount;
                            const stock = state.stocks.find(s => s.id === stockId);
                            if (stock && stockId) {
                                const cost = stock.price * quantity;
                                if (user.balance >= cost) {
                                    user.balance -= cost;
                                    if (!user.stocks) user.stocks = {};
                                    user.stocks[stockId] = (user.stocks[stockId] || 0) + quantity;
                                    addHistory(user, 'payment', cost, `株購入: ${stock.name} x${quantity}`);
                                } else {
                                    req.status = 'rejected';
                                }
                            }
                        } else if (req.type === 'sell_stock') {
                            const stockId = req.details;
                            const quantity = req.amount;
                            const stock = state.stocks.find(s => s.id === stockId);
                            if (stock && stockId) {
                                const currentHold = (user.stocks && user.stocks[stockId]) || 0;
                                if (currentHold >= quantity) {
                                    const revenue = stock.price * quantity;
                                    user.balance += revenue;
                                    user.stocks[stockId] -= quantity;
                                    addHistory(user, 'income', revenue, `株売却: ${stock.name} x${quantity}`);
                                } else {
                                    req.status = 'rejected';
                                }
                            }
                        } else if (req.type === 'vacation') {
                            user.isOff = true;
                            user.vacationReason = req.details || '有給休暇';
                            addHistory(user, 'income', 0, '有給休暇承認');
                        }
                    }
                }

                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'start_game') {
            await updateGameState((state) => {
                state.settings.isGameStarted = true;
                state.news.unshift({
                    id: crypto.randomUUID(),
                    message: '🎮 ゲームが開始されました！',
                    timestamp: Date.now()
                });
                return state;
            });
            eventManager.broadcast({ type: 'STATE_SYNC', payload: { type: 'game_started' }, timestamp: Date.now(), revision: 0 });
            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // ターン進行 (Next Turn)
        // -----------------------------------------------------
        if (action === 'next_turn') {
            await updateGameState((state) => {
                if (state.isDay) {
                    state.isDay = false;
                } else {
                    state.isDay = true;
                    state.turn += 1;

                    // RANDOM EVENT TRIGGERING
                    if (Math.random() < 0.15) { // 15% chance for a global event per turn
                        const { EVENT_TEMPLATES } = require('@/lib/eventData');
                        const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
                        if (!state.activeEvents) state.activeEvents = [];

                        // Check if same type is already active
                        if (!state.activeEvents.some(e => e.type === template.type)) {
                            state.activeEvents.push({
                                ...template,
                                id: crypto.randomUUID(),
                                startTime: Date.now()
                            });
                            state.news.push(`📢 事件発生: ${template.name}`);
                        }
                    }

                    // Check for active Epidemic
                    const isEpidemic = state.activeEvents?.some(e => e.type === 'epidemic') || false;
                    const hasEpidemic = isEpidemic || state.activeEvents?.some(e => e.description.includes('病') || e.name.includes('ウイルス'));

                    // === 夜の自動処理 ===
                    state.users.forEach(user => {
                        if (user.role === 'player' && !user.isOff) {
                            // Init new fields if missing
                            if (user.health === undefined) user.health = 100;
                            if (user.isInsured === undefined) user.isInsured = false;
                            if (user.propertyLevel === undefined) user.propertyLevel = 'none';
                            if (!user.shopMenu) user.shopMenu = [];
                            if (user.landRank === undefined) user.landRank = 0;

                            // 1. 保険料 (Insurance)
                            if (user.isInsured) {
                                const insuranceCost = 300;
                                if (user.balance >= insuranceCost) {
                                    user.balance -= insuranceCost;
                                } else {
                                    user.debt += insuranceCost;
                                }
                            }

                            // 2. 家賃 (Rent - Old System)
                            // Keep this for basic housing, but Real Estate properties are separate.
                            let rent = 0;
                            if (user.propertyLevel === 'apartment') rent = 500;
                            if (user.propertyLevel === 'house') rent = 2000;
                            if (user.propertyLevel === 'mansion') rent = 10000;

                            if (rent > 0) {
                                if (user.balance >= rent) {
                                    user.balance -= rent;
                                } else {
                                    user.debt += rent;
                                }
                            }

                            // 3. 健康状態 (Health)
                            if (hasEpidemic) {
                                if (Math.random() < 0.3) {
                                    user.health = Math.max(0, user.health - 40);
                                    state.news.push(`😷 ${user.name}が体調を崩しました...`);
                                }
                            }
                            user.health = Math.min(100, Math.max(0, user.health + (Math.random() * 10 - 5)));

                            // 4. 医療費 (Medical)
                            if (user.health < 30) {
                                const medicalFee = user.isInsured ? 500 : 5000;
                                if (user.balance >= medicalFee) {
                                    user.balance -= medicalFee;
                                    user.health += 20;
                                    addHistory(user, 'payment', medicalFee, `治療費(${user.isInsured ? '保険適用' : '全額負担'})`);
                                } else {
                                    user.debt += medicalFee;
                                }
                            }

                            // 5. 店舗売上 (Shop Sales)
                            if (user.shopMenu && user.shopMenu.length > 0) {
                                let totalSales = 0;
                                const landBonus = (user.landRank || 0) * 0.2; // +20% per rank
                                const popBonus = (user.popularity || 0) * 0.05; // +5% per popularity
                                const baseChance = 0.3 + landBonus + popBonus;

                                user.shopMenu.forEach(item => {
                                    if (item.stock > 0) {
                                        // Simple sales logic: try to sell 1-5 items
                                        const maxSell = Math.min(item.stock, 5);
                                        let sold = 0;
                                        for (let i = 0; i < maxSell; i++) {
                                            if (Math.random() < baseChance) {
                                                sold++;
                                            }
                                        }
                                        if (sold > 0) {
                                            item.stock -= sold;
                                            totalSales += item.price * sold;
                                            // Cost is already paid at stocking, so this is gross revenue
                                        }
                                    }
                                });


                                if (totalSales > 0) {
                                    user.balance += totalSales;
                                    addHistory(user, 'income', totalSales, '店舗売上');
                                }
                            }

                            // 利子 (Interest)
                            if (user.debt > 0) {
                                const interest = Math.floor(user.debt * state.settings.interestRate);
                                user.debt += interest;
                            }
                        }
                    });

                    // 6. 不動産収入 (Real Estate Income)
                    if (state.properties) {
                        state.properties.forEach(prop => {
                            if (prop.ownerId) {
                                const owner = state.users.find(u => u.id === prop.ownerId);
                                if (owner) {
                                    if (prop.income > 0) {
                                        owner.balance += prop.income;
                                        addHistory(owner, 'income', prop.income, `不動産収入: ${prop.name}`);
                                    } else if (prop.income < 0) {
                                        const cost = Math.abs(prop.income);
                                        if (owner.balance >= cost) {
                                            owner.balance -= cost;
                                            // addHistory(owner, 'payment', cost, `不動産維持費: ${prop.name}`);
                                        } else {
                                            owner.debt += cost;
                                        }
                                    }
                                }
                            }
                        });
                    }

                    // イベントのクリーンアップ (Expired events)
                    if (state.activeEvents) {
                        state.activeEvents = state.activeEvents.filter(e => {
                            return (Date.now() - e.startTime) < e.duration;
                        });
                    }

                    // 株価変動
                    state.stocks.forEach(stock => {
                        const changePercent = (Math.random() - 0.5) * stock.volatility * 2;
                        const change = Math.floor(stock.price * changePercent);
                        stock.previousPrice = stock.price;
                        stock.price += change;
                        if (stock.price < 1) stock.price = 1;
                        stock.price = Math.round(stock.price / 10) * 10;

                        // Update price history (keep last 20 prices)
                        if (!stock.priceHistory) stock.priceHistory = [];
                        stock.priceHistory.push(stock.price);
                        if (stock.priceHistory.length > 20) {
                            stock.priceHistory.shift();
                        }
                    });
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // ルーレット実行 (Spin)
        // -----------------------------------------------------
        if (action === 'spin_roulette') {
            const targetUserId = requestId;
            const cost = Number(amount) || 0;

            await updateGameState((state) => {
                const items = state.roulette.items;
                const randomItem = items[Math.floor(Math.random() * items.length)];

                state.roulette.currentResult = {
                    text: randomItem.text,
                    timestamp: Date.now(),
                    targetUserId: targetUserId || undefined // Save target ID
                };

                if (targetUserId) {
                    const user = state.users.find(u => u.id === targetUserId);
                    if (user) {
                        user.balance -= cost;
                        if (user.balance < 0) {
                            user.debt += Math.abs(user.balance);
                            user.balance = 0;
                        }

                        if (randomItem.effect === 'bonus_1000') user.balance += 1000;
                        if (randomItem.effect === 'bonus_300') user.balance += 300;
                        if (randomItem.effect === 'sick_cold') {
                            user.balance -= 50;
                            if (user.balance < 0) { user.debt += Math.abs(user.balance); user.balance = 0; }
                        }
                        if (randomItem.effect === 'lost_100') {
                            user.balance -= 100;
                            if (user.balance < 0) { user.debt += Math.abs(user.balance); user.balance = 0; }
                        }
                        if (randomItem.effect === 'pop_up') user.popularity += 10;
                    }
                } else {
                    state.users.forEach(user => {
                        if (user.role === 'player') {
                            if (randomItem.effect === 'bonus_1000') user.balance += 1000;
                            if (randomItem.effect === 'bonus_300') user.balance += 300;
                            if (randomItem.effect === 'sick_cold') {
                                user.balance -= 50;
                                if (user.balance < 0) { user.debt += Math.abs(user.balance); user.balance = 0; }
                            }
                            if (randomItem.effect === 'lost_100') {
                                user.balance -= 100;
                                if (user.balance < 0) { user.debt += Math.abs(user.balance); user.balance = 0; }
                            }
                            if (randomItem.effect === 'pop_up') user.popularity += 10;
                        }
                    });
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // 株価操作 (Update Stock)
        // -----------------------------------------------------
        if (action === 'update_stock') {
            const stockId = requestId;
            const newPrice = Number(amount);

            await updateGameState((state) => {
                const stock = state.stocks.find(s => s.id === stockId);
                if (stock) {
                    stock.price = newPrice;
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // ルーレット設定変更
        // -----------------------------------------------------
        if (action === 'update_roulette_config') {
            const { items } = body; // items: { id, text, effect }[]
            await updateGameState((state) => {
                if (items && Array.isArray(items)) {
                    state.roulette.items = items;
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // 商品管理
        // -----------------------------------------------------
        if (action === 'update_products') {
            const { products } = body; // products: Product[]
            await updateGameState((state) => {
                if (products && Array.isArray(products)) {
                    state.products = products;
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }


        if (action === 'approve_all_requests') {
            await updateGameState((state) => {
                const pendingRequests = state.requests.filter(r => r.status === 'pending');

                pendingRequests.forEach(req => {
                    req.status = 'approved';
                    const user = state.users.find(u => u.id === req.requesterId);

                    if (user) {
                        if (req.type === 'income') {
                            user.balance += req.amount;
                            addHistory(user, 'income', req.amount, '給料/収入');

                            const saving = Math.floor(req.amount * state.settings.salaryAutoSafeRate);
                            if (saving > 0 && user.balance >= saving) {
                                user.balance -= saving;
                                user.deposit += saving;
                                addHistory(user, 'deposit', saving, '自動貯金');
                            }
                        } else if (req.type === 'loan') {
                            user.balance += req.amount;
                            user.debt += req.amount;
                            addHistory(user, 'income', req.amount, '借金');
                        } else if (req.type === 'repay') {
                            if (user.balance >= req.amount) {
                                user.balance -= req.amount;
                                user.debt = Math.max(0, user.debt - req.amount);
                                addHistory(user, 'payment', req.amount, '借金返済');
                            } else {
                                req.status = 'rejected'; // 残高不足なら却下
                            }
                        } else if (req.type === 'pay_tax') {
                            if (user.balance >= req.amount) {
                                user.balance -= req.amount;
                                user.unpaidTax = Math.max(0, (user.unpaidTax || 0) - req.amount);
                                addHistory(user, 'tax', req.amount, '納税');
                            } else {
                                req.status = 'rejected';
                            }
                        } else if (req.type === 'tax' || req.type === 'bill') {
                            const targetId = req.details;
                            const target = targetId ? state.users.find(u => u.id === targetId) : null;

                            if (target && targetId && targetId !== 'Self Payment' && targetId !== 'Tax Payment') {
                                // Charge: Target pays Requester
                                let paidAmount = 0;
                                if (target.balance >= req.amount) {
                                    target.balance -= req.amount;
                                    user.balance += req.amount;
                                    paidAmount = req.amount;
                                } else {
                                    paidAmount = req.amount;
                                    target.balance -= req.amount;
                                    if (target.balance < 0) {
                                        target.debt += Math.abs(target.balance);
                                        target.balance = 0;
                                    }
                                    user.balance += req.amount;
                                }
                                addHistory(target, 'payment', paidAmount, `支払い: ${user.name}`, user.id);
                                addHistory(user, 'income', paidAmount, `受取: ${target.name}`, user.id, target.id);

                                // Point Logic
                                const points = Math.floor(paidAmount / 100);
                                if (points > 0) {
                                    if (!target.pointCards) target.pointCards = [];
                                    let card = target.pointCards.find(c => c.shopOwnerId === user.id);
                                    if (!card) {
                                        card = { shopOwnerId: user.id, points: 0 };
                                        target.pointCards.push(card);
                                    }
                                    card.points += points;
                                }
                            } else {
                                // Self Payment
                                if (user.balance >= req.amount) {
                                    user.balance -= req.amount;
                                    addHistory(user, 'payment', req.amount, '支払い');
                                }
                            }
                        } else if (req.type === 'transfer') {
                            const targetId = req.details;
                            const target = state.users.find(u => u.id === targetId);
                            if (target && targetId) {
                                if (user.balance >= req.amount) {
                                    user.balance -= req.amount;
                                    target.balance += req.amount;
                                    addHistory(user, 'transfer', req.amount, `送金: ${target.name}`, target.id);
                                    addHistory(target, 'income', req.amount, `受取: ${user.name}`, target.id, user.id);
                                } else {
                                    req.status = 'rejected';
                                }
                            }
                        } else if (req.type === 'buy_stock') {
                            const stockId = req.details;
                            const quantity = req.amount;
                            const stock = state.stocks.find(s => s.id === stockId);
                            if (stock && stockId) {
                                const cost = stock.price * quantity;
                                if (user.balance >= cost) {
                                    user.balance -= cost;
                                    if (!user.stocks) user.stocks = {};
                                    user.stocks[stockId] = (user.stocks[stockId] || 0) + quantity;
                                    addHistory(user, 'payment', cost, `株購入: ${stock.name} x${quantity}`);
                                } else {
                                    req.status = 'rejected';
                                }
                            }
                        } else if (req.type === 'sell_stock') {
                            const stockId = req.details;
                            const quantity = req.amount;
                            const stock = state.stocks.find(s => s.id === stockId);
                            if (stock && stockId) {
                                const currentHold = (user.stocks && user.stocks[stockId]) || 0;
                                if (currentHold >= quantity) {
                                    const revenue = stock.price * quantity;
                                    user.balance += revenue;
                                    user.stocks[stockId] -= quantity;
                                    addHistory(user, 'income', revenue, `株売却: ${stock.name} x${quantity}`);
                                } else {
                                    req.status = 'rejected';
                                }
                            }
                        } else if (req.type === 'vacation') {
                            user.isOff = true;
                            user.vacationReason = req.details || '有給休暇';
                            addHistory(user, 'income', 0, '有給休暇承認');
                        }
                    }
                });
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'toggle_vacation') {
            const targetUserId = requestId;
            await updateGameState((state) => {
                const user = state.users.find(u => u.id === targetUserId);
                if (user) {
                    user.isOff = !user.isOff;
                    if (user.isOff) {
                        user.vacationReason = '管理者による設定';
                    } else {
                        user.vacationReason = undefined;
                    }
                    state.news.push(`📢 ${user.name} が ${user.isOff ? 'お休み中' : '復帰'} になりました。`);
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'delete_active_npc') {
            const { npcId } = body;
            await updateGameState((state) => {
                if (state.activeNPCs) {
                    state.activeNPCs = state.activeNPCs.filter(n => n.id !== npcId);
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'spawn_npc') {
            const { targetUserId, templateId } = body;

            await updateGameState((state) => {
                const template = state.npcTemplates?.find(t => t.id === templateId);
                // Fallback to old behavior or default if template not found (safety)
                const def = template || state.npcTemplates?.[0];

                if (!def) return state; // Should not happen if initialized correctly

                const newNPC: any = {
                    id: crypto.randomUUID(),
                    targetUserId,
                    templateId: def.id,
                    type: def.id, // For compatibility
                    name: def.name,
                    description: def.description,
                    entryTime: Date.now(),
                    leaveTime: Date.now() + def.duration,
                    effectApplied: false
                };
                if (!state.activeNPCs) state.activeNPCs = [];
                state.activeNPCs.push(newNPC);

                state.news.unshift({
                    id: crypto.randomUUID(),
                    message: `⚠️ あなたの店に「${def.name}」が来店しました！`,
                    timestamp: Date.now()
                });

                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'update_npc_templates') {
            const { templates } = body;
            await updateGameState((state) => {
                if (templates && Array.isArray(templates)) {
                    state.npcTemplates = templates;
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // 強制職業変更 (Force Job Change)
        // -----------------------------------------------------
        if (action === 'force_change_job') {
            const { targetUserId, newJob } = body;
            await updateGameState((state) => {
                const user = state.users.find(u => u.id === targetUserId);
                if (user) {
                    user.job = newJob || 'unemployed';
                    user.lastJobChangeTurn = state.turn;

                    // Update Job Type
                    if (newJob === 'police') user.jobType = 'police';
                    else if (newJob === 'thief') user.jobType = 'thief';
                    else if (newJob === 'idol') user.jobType = 'idol';
                    else user.jobType = 'normal';
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // 給付金配布 (Distribute Grant)
        // -----------------------------------------------------
        if (action === 'distribute_grant') {
            const { amount, message } = body;
            await updateGameState((state) => {
                let count = 0;
                state.users.forEach(u => {
                    if (u.role === 'player') {
                        u.balance += amount;
                        addHistory(u, 'income', amount, message || '給付金');
                        count++;
                    }
                });
                state.news.push(`💰 給付金配布: 全プレイヤー${count}名に${amount}枚が支給されました`);
                return state;
            });
            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // イベント管理 (Event Management)
        // -----------------------------------------------------
        if (action === 'trigger_event') {
            const { eventTemplate, targetUserId } = body;
            await updateGameState((state) => {
                if (!state.activeEvents) state.activeEvents = [];
                const newEvent = {
                    ...eventTemplate,
                    id: crypto.randomUUID(),
                    startTime: Date.now(),
                    targetUserId
                };
                state.activeEvents.push(newEvent);

                // Add to news
                state.news.push(`${newEvent.name}: ${newEvent.description}`);

                // If it's a one-time grant
                if (newEvent.type === 'grant') {
                    state.users.forEach(u => {
                        if (u.role === 'player') {
                            u.balance += newEvent.effectValue;
                            addHistory(u, 'income', newEvent.effectValue, '特別給付金');
                        }
                    });
                }

                // If it's a one-time tax hike
                if (newEvent.type === 'tax_hike') {
                    state.users.forEach(u => {
                        if (u.role === 'player') {
                            const tax = Math.floor(u.balance * newEvent.effectValue);
                            u.balance -= tax;
                            addHistory(u, 'tax', tax, '臨時増税');
                        }
                    });
                }

                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'end_event') {
            const { eventId } = body;
            await updateGameState((state) => {
                if (state.activeEvents) {
                    state.activeEvents = state.activeEvents.filter(e => e.id !== eventId);
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // 完全リセット (Full Wipe)
        // -----------------------------------------------------
        if (action === 'full_reset') {
            const { prisma } = require('@/lib/prisma');

            // 1. Transactional delete of ALL data (Async operation outside of updateGameState)
            try {
                // Determine execution environment/context if needed, but here we just need to run the transaction.
                await prisma.$transaction([
                    prisma.transaction.deleteMany({}),
                    prisma.request.deleteMany({}),
                    prisma.message.deleteMany({}),
                    prisma.voiceCall.deleteMany({}),
                    prisma.vote.deleteMany({}),
                    prisma.policyProposal.deleteMany({}),
                    prisma.product.deleteMany({}),
                    prisma.land.deleteMany({}),
                    prisma.place.deleteMany({}),
                    prisma.nPC.deleteMany({}),
                    prisma.gameEvent.deleteMany({}),
                    prisma.property.deleteMany({}),
                    prisma.news.deleteMany({}),
                    prisma.rouletteResult.deleteMany({}),
                    prisma.parcel.deleteMany({}),
                    prisma.user.deleteMany({}),
                    // Reset Settings
                    prisma.gameSettings.update({
                        where: { id: 'singleton' },
                        data: {
                            turn: 1,
                            isDay: true,
                            season: 'spring',
                            marketStatus: 'open',
                            economyStatus: 'normal',
                            priceIndex: 100.0,
                            moneyMultiplier: 1.0,
                            taxRate: 0.1,
                            insuranceRate: 0.05,
                            interestRate: 0.05,
                            salaryAutoSafeRate: 0.1
                        }
                    })
                ]);
            } catch (e) {
                console.error("Full Reset Prisma Error:", e);
            }

            // 2. Clear in-memory state / JSON file (Synchronous update)
            await updateGameState((state) => {
                state.users = [];
                state.requests = [];
                state.stocks.forEach(s => {
                    s.price = s.previousPrice || 1000;
                    s.priceHistory = [];
                });
                state.news = [];
                state.activeEvents = [];
                state.activeNPCs = [];
                state.turn = 1;
                state.isDay = true;
                return state;
            });
            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // ゲーム初期化 (Reset Game - Soft Reset)
        // -----------------------------------------------------
        if (action === 'reset_game') {
            await updateGameState((state) => {
                // 1. Reset Users (Keep ID, Name, Role)
                state.users.forEach(u => {
                    if (u.role === 'player') {
                        u.balance = 2000; // 初期所持金
                        u.deposit = 0;
                        u.debt = 0;
                        u.popularity = 0;
                        u.happiness = 50;
                        u.rating = 0;
                        u.job = 'unemployed';
                        u.jobType = 'normal';
                        u.inventory = [];
                        u.stocks = {};
                        u.forbiddenStocks = {};
                        u.isForbiddenUnlocked = false;
                        u.lastJobChangeTurn = 0;
                        u.unpaidTax = 0;
                        u.transactions = [];
                        u.pointCards = [];
                        u.arrestCount = 0;
                        u.stolenAmount = 0;
                        u.fanCount = 0;

                        // Eco & Health Reset
                        u.isInsured = false;
                        u.propertyLevel = 'none';
                        u.health = 100;
                    }
                });

                // 2. Reset Stocks
                state.stocks = [
                    { id: 's1', name: 'テック・フューチャー', price: 1000, previousPrice: 1000, volatility: 0.1, isForbidden: false },
                    { id: 's2', name: 'ハッピー・フーズ', price: 500, previousPrice: 500, volatility: 0.05, isForbidden: false },
                    { id: 's3', name: 'ミラクル建設', price: 800, previousPrice: 800, volatility: 0.08, isForbidden: false },
                    // Forbidden Stocks
                    { id: 'f1', name: 'シャドウ・コーポレーション', price: 5000, previousPrice: 5000, volatility: 0.5, isForbidden: true },
                    { id: 'f2', name: 'ブラックバイオ研究所', price: 2000, previousPrice: 2000, volatility: 0.8, isForbidden: true },
                    { id: 'f3', name: 'ネオカルト証券', price: 10000, previousPrice: 10000, volatility: 1.0, isForbidden: true },
                ];

                // 3. Reset Game Cycle
                state.turn = 1;
                state.isDay = true;
                state.gameId = crypto.randomUUID(); // Force refresh context

                return state;
            });
            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // 完全リセット (Full Reset - Back to Setup)
        // -----------------------------------------------------
        if (action === 'full_reset') {
            await updateGameState((state) => {
                state.users = []; // Clear all users to trigger setup screen
                state.gameId = crypto.randomUUID();
                state.turn = 1;
                state.isDay = true;
                // Reset other lists
                state.stocks = [];
                state.requests = [];
                state.products = [];
                state.lands = [];
                state.activeNPCs = [];
                state.activeEvents = [];
                state.news = [];
                state.cryptos = [];
                state.cryptos = [];

                return state;
            });
            return NextResponse.json({ success: true });
        }



        // -----------------------------------------------------
        // 不動産管理 (Real Estate Management)
        // -----------------------------------------------------
        if (action === 'add_property') {
            const { property } = body;
            await updateGameState((state) => {
                if (!state.properties) state.properties = [];
                state.properties.push({
                    ...property,
                    id: crypto.randomUUID(),
                    ownerId: null // Default to bank owned
                });
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'delete_property') {
            const { propertyId } = body;
            await updateGameState((state) => {
                if (state.properties) {
                    state.properties = state.properties.filter(p => p.id !== propertyId);
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'add_land') {
            const { land } = body;
            await updateGameState((state) => {
                const newLand = {
                    ...land,
                    id: land.id || `land_${crypto.randomUUID()}`, // Use provided Grid ID or random
                    ownerId: null,
                    isForSale: true,
                    placeId: undefined,
                    polygon: land.polygon || [] // Should be generated if missing, but minimal for now
                };
                if (!state.lands) state.lands = [];
                state.lands.push(newLand);
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'update_land') {
            const { landId, price, isForSale, zoning } = body;
            await updateGameState((state) => {
                const land = state.lands.find(l => l.id === landId);
                if (land) {
                    if (price !== undefined) land.price = Number(price);
                    if (isForSale !== undefined) land.isForSale = isForSale;
                    if (zoning !== undefined) land.zoning = zoning;
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'delete_land') {
            const { landId } = body;
            await updateGameState((state) => {
                if (state.lands) {
                    state.lands = state.lands.filter(l => l.id !== landId);
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'reset_japan_lands') {
            const allInitialLands = generateLands();
            const initialJapanLands = allInitialLands.filter(l =>
                l.id === 'country_日本' ||
                PREFECTURES.some(p => p.id === l.id)
            );

            await updateGameState((state) => {
                const japanLandsIds = new Set(initialJapanLands.map(l => l.id));

                // 日本関連の土地（都道府県と country_日本）を除外
                state.lands = (state.lands || []).filter(l => !japanLandsIds.has(l.id));

                // デフォルトの状態（所有者なし等）で再度追加
                state.lands.push(...initialJapanLands);

                return state;
            });
            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // 神モード (God Mode)
        // -----------------------------------------------------
        if (type === 'god_mode_update') {
            const { userId, updates } = body;

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === userId);
                if (!user) return state;

                // 残高
                if (updates.balance !== undefined) {
                    user.balance = updates.balance;
                }

                // 預金
                if (updates.deposit !== undefined) {
                    user.deposit = updates.deposit;
                }

                // 借金
                if (updates.debt !== undefined) {
                    user.debt = updates.debt;
                }

                // 体力
                if (updates.health !== undefined) {
                    user.health = Math.max(0, Math.min(100, updates.health));
                }

                // 幸福度
                if (updates.happiness !== undefined) {
                    user.happiness = Math.max(0, Math.min(100, updates.happiness));
                }

                // 人気度
                if (updates.popularity !== undefined) {
                    user.popularity = updates.popularity;
                }

                return state;
            });

            return NextResponse.json({ success: true });
        }

        if (type === 'god_mode_reset_all') {
            await updateGameState((state) => {
                state.users.forEach(u => {
                    if (u.role === 'player') {
                        u.balance = 2000;
                        u.deposit = 0;
                        u.debt = 0;
                    }
                });
                state.news.push({ id: crypto.randomUUID(), message: '⚡️ 神の裁定により全ユーザーがリセットされました', timestamp: Date.now() });
                return state;
            });

            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // 設定更新 (Update Settings) - God Mode Money Multiplier
        // -----------------------------------------------------
        if (type === 'update_settings') {
            const { updates } = body;

            await updateGameState((state) => {
                if (!state.settings) {
                    state.settings = {} as any;
                }

                // Money Multiplier (1 - 10,000,000)
                if (updates.moneyMultiplier !== undefined) {
                    const mult = Math.max(1, Math.min(10000000, parseInt(updates.moneyMultiplier) || 1));
                    state.settings.moneyMultiplier = mult;
                    state.news.push({
                        id: crypto.randomUUID(),
                        message: `⚡️ 神モード: 収入倍率が ${mult.toLocaleString()}x に変更されました`,
                        timestamp: Date.now()
                    });
                }

                // Other settings can be added here
                if (updates.taxRate !== undefined) state.settings.taxRate = updates.taxRate;
                if (updates.interestRate !== undefined) state.settings.interestRate = updates.interestRate;
                if (updates.turnDuration !== undefined) state.settings.turnDuration = updates.turnDuration;

                return state;
            });

            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // カタログアイテム管理
        // -----------------------------------------------------
        if (action === 'add_catalog_item') {
            const { item } = body;
            await updateGameState((state) => {
                if (!state.catalogInventory) state.catalogInventory = [];
                state.catalogInventory.push({
                    ...item,
                    id: crypto.randomUUID()
                });
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (action === 'delete_catalog_item') {
            const { itemId } = body;
            await updateGameState((state) => {
                if (state.catalogInventory) {
                    state.catalogInventory = state.catalogInventory.filter(i => i.id !== itemId);
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to process admin action' }, { status: 500 });
    }
}
