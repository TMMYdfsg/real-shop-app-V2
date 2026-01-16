import { NextResponse, NextRequest } from 'next/server';
import { updateGameState } from '@/lib/dataStore';
import { GameState, User, Transaction } from '@/types';
import crypto from 'crypto';

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
            updateGameState((state) => {
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

            updateGameState((state) => {
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
                        }
                    }
                }

                return state;
            });
            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // ターン進行 (Next Turn)
        // -----------------------------------------------------
        if (action === 'next_turn') {
            updateGameState((state) => {
                if (state.isDay) {
                    state.isDay = false;
                } else {
                    state.isDay = true;
                    state.turn += 1;

                    // === 夜の自動処理 ===
                    state.users.forEach(user => {
                        if (user.role === 'player') {
                            // 保険料
                            const insurance = state.settings.insuranceRate;
                            if (user.balance >= insurance) {
                                user.balance -= insurance;
                            } else {
                                user.debt += insurance;
                            }

                            // 利子
                            if (user.debt > 0) {
                                const interest = Math.floor(user.debt * state.settings.interestRate);
                                user.debt += interest;
                            }

                            // 土地代
                            const rent = 50;
                            if (user.balance >= rent) {
                                user.balance -= rent;
                            } else {
                                user.debt += rent;
                            }
                        }
                    });

                    // 株価変動
                    state.stocks.forEach(stock => {
                        const changePercent = (Math.random() - 0.5) * stock.volatility * 2;
                        const change = Math.floor(stock.price * changePercent);
                        stock.previousPrice = stock.price;
                        stock.price += change;
                        if (stock.price < 1) stock.price = 1;
                        stock.price = Math.round(stock.price / 10) * 10;
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

            updateGameState((state) => {
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

            updateGameState((state) => {
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
            updateGameState((state) => {
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
            updateGameState((state) => {
                if (products && Array.isArray(products)) {
                    state.products = products;
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
