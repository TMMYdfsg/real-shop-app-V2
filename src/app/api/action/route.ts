import { NextResponse, NextRequest } from 'next/server';
import { updateGameState } from '@/lib/dataStore';
import { Request as GameRequest } from '@/types';
import crypto from 'crypto';

import { JOB_GAME_CONFIGS, JobType } from '@/lib/jobData';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, requesterId, amount, details } = body;

        if (!type || !requesterId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const newRequest: GameRequest = {
            id: crypto.randomUUID(),
            type,
            requesterId,
            amount: Number(amount) || 0,
            details,
            status: 'pending',
            timestamp: Date.now()
        };

        if (type === 'apply_job') {
            const newJobName = details;

            // Check config
            // @ts-ignore
            const config = JOB_GAME_CONFIGS[newJobName as JobType];
            if (!config) {
                return NextResponse.json({ success: false, message: '職業が見つかりません' });
            }

            // Probability Check
            const rate = config.acceptanceRate ?? 100;
            const isSuccess = Math.random() * 100 < rate;

            if (isSuccess) {
                updateGameState((state) => {
                    const user = state.users.find(u => u.id === requesterId);
                    if (user) {
                        user.job = newJobName;
                        user.lastJobChangeTurn = state.turn;

                        // Update Job Type
                        if (newJobName === 'police') user.jobType = 'police';
                        else if (newJobName === 'thief') user.jobType = 'thief';
                        else if (newJobName === 'idol') user.jobType = 'idol';
                        else user.jobType = 'normal';
                    }
                    return state;
                });
                return NextResponse.json({ success: true, message: '採用' });
            } else {
                return NextResponse.json({ success: false, message: '不採用' });
            }
        }

        if (type === 'change_job') {
            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    const newJob = details || 'unemployed';
                    user.job = newJob;
                    user.lastJobChangeTurn = state.turn; // 転職ターンを記録

                    // Update Job Type for Special Actions
                    if (newJob === 'police') user.jobType = 'police';
                    else if (newJob === 'thief') user.jobType = 'thief';
                    else if (newJob === 'idol') user.jobType = 'idol';
                    else user.jobType = 'normal';
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'pay_tax') {
            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    const payAmount = Number(amount);
                    if (user.balance >= payAmount) {
                        user.balance -= payAmount;
                        user.unpaidTax = Math.max(0, (user.unpaidTax || 0) - payAmount);

                        // 履歴追加
                        if (!user.transactions) user.transactions = [];
                        user.transactions.push({
                            id: crypto.randomUUID(),
                            type: 'tax',
                            amount: payAmount,
                            senderId: user.id,
                            description: '納税',
                            timestamp: Date.now()
                        });
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'unlock_forbidden') {
            updateGameState((state) => {
                // Unlock for everyone
                state.users.forEach(u => u.isForbiddenUnlocked = true);
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'deposit') {
            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    const val = Number(amount);
                    if (user.balance >= val) {
                        user.balance -= val;
                        user.deposit += val;
                        // 履歴
                        if (!user.transactions) user.transactions = [];
                        user.transactions.push({
                            id: crypto.randomUUID(), type: 'deposit', amount: val, senderId: user.id, description: '預け入れ', timestamp: Date.now()
                        });
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'withdraw') {
            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    const val = Number(amount);
                    if (user.deposit >= val) {
                        user.deposit -= val;
                        user.balance += val;
                        // 履歴
                        if (!user.transactions) user.transactions = [];
                        user.transactions.push({
                            id: crypto.randomUUID(), type: 'withdraw', amount: val, senderId: user.id, description: '引き出し', timestamp: Date.now()
                        });
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'update_profile') {
            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    if (details) {
                        const { name, shopName, cardType, isInsured, propertyLevel, playerIcon } = JSON.parse(details);
                        if (name !== undefined) user.name = name;
                        if (shopName !== undefined) user.shopName = shopName;
                        if (cardType !== undefined) user.cardType = cardType;
                        if (isInsured !== undefined) user.isInsured = isInsured;
                        if (propertyLevel !== undefined) user.propertyLevel = propertyLevel;
                        if (playerIcon !== undefined) user.playerIcon = playerIcon;
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'purchase_product') {
            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId); // Buyer
                if (!user) return state;

                const { productId, sellerId } = details ? JSON.parse(details) : { productId: '', sellerId: '' };
                const product = state.products.find(p => p.id === productId);
                const seller = state.users.find(u => u.id === sellerId);

                if (user && product && seller && !product.soldAt) {
                    if (user.balance >= product.price) {
                        // Payment
                        user.balance -= product.price;
                        seller.balance += product.price;

                        // Product Update
                        product.isSold = true;
                        product.soldAt = Date.now();
                        product.buyerId = user.id;

                        // Transaction History
                        if (!user.transactions) user.transactions = [];
                        user.transactions.push({
                            id: crypto.randomUUID(), type: 'payment', amount: product.price, senderId: user.id, receiverId: seller.id, description: `購入: ${product.name}`, timestamp: Date.now()
                        });

                        if (!seller.transactions) seller.transactions = [];
                        seller.transactions.push({
                            id: crypto.randomUUID(), type: 'income', amount: product.price, senderId: user.id, receiverId: seller.id, description: `売上: ${product.name}`, timestamp: Date.now()
                        });

                        // Points (100 -> 1pt)
                        const points = Math.floor(product.price / 100);
                        if (points > 0) {
                            if (!user.pointCards) user.pointCards = [];
                            let card = user.pointCards.find(c => c.shopOwnerId === seller.id);
                            if (!card) {
                                card = { shopOwnerId: seller.id, points: 0 };
                                user.pointCards.push(card);
                            }
                            card.points += points;
                        }
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        // ShopMenuからの商品購入
        if (type === 'purchase_shop_item') {
            updateGameState((state) => {
                const buyer = state.users.find(u => u.id === requesterId);
                if (!buyer) return state;

                const { itemId, sellerId } = details ? JSON.parse(details) : {};
                const seller = state.users.find(u => u.id === sellerId);

                if (!seller || !seller.shopMenu) return state;

                const item = seller.shopMenu.find(i => i.id === itemId);

                if (item && item.stock > 0 && buyer.balance >= item.price) {
                    // 支払い
                    buyer.balance -= item.price;
                    seller.balance += item.price;

                    // 在庫減算
                    item.stock -= 1;

                    // 取引履歴
                    if (!buyer.transactions) buyer.transactions = [];
                    buyer.transactions.push({
                        id: crypto.randomUUID(),
                        type: 'payment',
                        amount: item.price,
                        senderId: buyer.id,
                        receiverId: seller.id,
                        description: `購入: ${item.name}（${seller.shopName || seller.name}）`,
                        timestamp: Date.now()
                    });

                    if (!seller.transactions) seller.transactions = [];
                    seller.transactions.push({
                        id: crypto.randomUUID(),
                        type: 'income',
                        amount: item.price,
                        senderId: buyer.id,
                        receiverId: seller.id,
                        description: `売上: ${item.name}`,
                        timestamp: Date.now()
                    });

                    // ポイント付与
                    const points = Math.floor(item.price / 100);
                    if (points > 0) {
                        if (!buyer.pointCards) buyer.pointCards = [];
                        let card = buyer.pointCards.find(c => c.shopOwnerId === seller.id);
                        if (!card) {
                            card = { shopOwnerId: seller.id, points: 0 };
                            buyer.pointCards.push(card);
                        }
                        card.points += points;
                    }
                }

                return state;
            });
            return NextResponse.json({ success: true });
        }

        // ポイント交換アクション
        if (type === 'exchange_point') {
            const { getGameState } = await import('@/lib/dataStore');
            const state = getGameState();
            const user = state.users.find(u => u.id === requesterId);

            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // ポイント計算
            const totalPoints = (user.pointCards || []).reduce((sum, c) => sum + c.points, 0);
            const exchangeType = details as 'cash' | 'debt_relief' | 'title';

            let cost = 0;
            if (exchangeType === 'cash') cost = 10;
            if (exchangeType === 'debt_relief') cost = 50;
            if (exchangeType === 'title') cost = 100;

            if (totalPoints < cost) {
                return NextResponse.json({ error: 'ポイントが足りません' }, { status: 400 });
            }

            updateGameState((s) => {
                const u = s.users.find(x => x.id === requesterId);
                if (u && u.pointCards) {
                    // ポイント消費: 古いカードから順に減らす
                    let remainingCost = cost;
                    u.pointCards = u.pointCards.map(c => {
                        if (remainingCost <= 0) return c;
                        if (c.points >= remainingCost) {
                            c.points -= remainingCost;
                            remainingCost = 0;
                        } else {
                            remainingCost -= c.points;
                            c.points = 0;
                        }
                        return c;
                    }).filter(c => c.points > 0);

                    // 特典適用
                    if (exchangeType === 'cash') {
                        u.balance += 500;
                        u.transactions.push({
                            id: crypto.randomUUID(), type: 'income', amount: 500, description: 'ポイント交換（現金）', timestamp: Date.now()
                        });
                    } else if (exchangeType === 'debt_relief') {
                        // 借金APIと整合性を取るため、ここではloanを減らすと仮定
                        u.debt = Math.max(0, u.debt - 2000);
                        u.transactions.push({
                            id: crypto.randomUUID(), type: 'repay', amount: 2000, description: 'ポイント交換（借金免除）', timestamp: Date.now()
                        });
                    }

                    s.news.unshift({
                        id: crypto.randomUUID(),
                        message: `🎁 ${u.name}がポイントを交換しました！`,
                        timestamp: Date.now()
                    });
                }
                return s;
            });

            return NextResponse.json({ success: true, message: '交換しました！' });
        }

        // タイマー管理アクション
        if (type === 'timer_start') {
            updateGameState((state) => {
                state.isTimerRunning = true;
                state.lastTick = Date.now();
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'timer_stop') {
            updateGameState((state) => {
                state.isTimerRunning = false;
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'timer_update') {
            const params = details ? JSON.parse(details) : { minutes: 5, seconds: 0 };
            const newTime = (params.minutes * 60 * 1000) + (params.seconds * 1000);

            updateGameState((state) => {
                state.timeRemaining = newTime;
                state.lastTick = Date.now();
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'timer_reset') {
            updateGameState((state) => {
                state.timeRemaining = state.settings.turnDuration;
                state.lastTick = Date.now();
                state.isTimerRunning = true;
                return state;
            });
            return NextResponse.json({ success: true });
        }

        // 特殊職業アクション
        if (type === 'arrest' || type === 'steal' || type === 'perform') {
            const { getGameState } = await import('@/lib/dataStore');
            const state = getGameState();
            const user = state.users.find(u => u.id === requesterId);

            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            if (type === 'arrest') {
                if (user.jobType !== 'police') {
                    return NextResponse.json({ error: '警察のみ実行可能' }, { status: 403 });
                }
                const target = state.users.find(u => u.id === details);
                if (!target || !((target.unpaidTax && target.unpaidTax > 0) || target.jobType === 'thief')) {
                    return NextResponse.json({ error: '逮捕できません' }, { status: 400 });
                }
                updateGameState((s) => {
                    const u = s.users.find(x => x.id === requesterId);
                    if (u) {
                        u.balance += 300;
                        u.arrestCount = (u.arrestCount || 0) + 1;
                        u.transactions.push({
                            id: crypto.randomUUID(),
                            type: 'income',
                            amount: 300,
                            description: `${target.name}を逮捕`,
                            timestamp: Date.now()
                        });
                        s.news.unshift({
                            id: crypto.randomUUID(),
                            message: `🚔 ${u.name}が${target.name}を逮捕！`,
                            timestamp: Date.now()
                        }); // Assuming news array expects object. If it expects strings, will fix.
                    }
                    return s;
                });
                return NextResponse.json({ success: true, message: '逮捕成功！報奨金300枚' });
            }

            if (type === 'steal') {
                if (user.jobType !== 'thief') {
                    return NextResponse.json({ error: '泥棒のみ実行可能' }, { status: 403 });
                }
                const success = Math.random() < 0.6;
                if (success) {
                    const amt = Math.floor(Math.random() * 151) + 50;
                    const victim = state.users.find(u => u.id === details);
                    if (!victim) return NextResponse.json({ error: 'Target not found' }, { status: 404 });
                    const actual = Math.min(amt, victim.balance);
                    updateGameState((s) => {
                        const u = s.users.find(x => x.id === requesterId);
                        const v = s.users.find(x => x.id === details);
                        if (u && v) {
                            v.balance -= actual;
                            u.balance += actual;
                            u.stolenAmount = (u.stolenAmount || 0) + actual;
                            u.transactions.push({
                                id: crypto.randomUUID(),
                                type: 'income',
                                amount: actual,
                                description: '盗み成功',
                                timestamp: Date.now()
                            });
                            s.news.unshift({
                                id: crypto.randomUUID(),
                                message: `💰 誰かが${actual}枚を盗んだようです...`,
                                timestamp: Date.now()
                            });
                        }
                        return s;
                    });
                    return NextResponse.json({ success: true, message: `${actual}枚を盗みました！` });
                } else {
                    updateGameState((s) => {
                        const u = s.users.find(x => x.id === requesterId);
                        if (u) {
                            u.balance -= 500;
                            u.transactions.push({
                                id: crypto.randomUUID(),
                                type: 'payment',
                                amount: 500,
                                description: '盗み失敗（罰金）',
                                timestamp: Date.now()
                            });
                            s.news.unshift({
                                id: crypto.randomUUID(),
                                message: `🚨 ${u.name}が盗みに失敗！罰金500枚`,
                                timestamp: Date.now()
                            });
                        }
                        return s;
                    });
                    return NextResponse.json({ success: false, message: '失敗！罰金500枚' }, { status: 400 });
                }
            }

            if (type === 'perform') {
                if (user.jobType !== 'idol') {
                    return NextResponse.json({ error: 'アイドルのみ実行可能' }, { status: 403 });
                }
                const earning = 200 + (user.rating || 0) * 50;
                updateGameState((s) => {
                    const u = s.users.find(x => x.id === requesterId);
                    if (u) {
                        u.balance += earning;
                        u.rating = (u.rating || 0) + 1;
                        u.fanCount = (u.fanCount || 0) + Math.floor(Math.random() * 10) + 1;
                        u.transactions.push({
                            id: crypto.randomUUID(),
                            type: 'income',
                            amount: earning,
                            description: 'ライブ投げ銭',
                            timestamp: Date.now()
                        });
                        s.news.unshift({
                            id: crypto.randomUUID(),
                            message: `🎤 ${u.name}がライブ開催！${earning}枚獲得`,
                            timestamp: Date.now()
                        });
                    }
                    return s;
                });
                return NextResponse.json({ success: true, message: `${earning}枚獲得！人気度+1` });
            }
        }

        if (type === 'complete_job') {
            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    const score = details ? JSON.parse(details).score : 0;
                    const jobType = user.job || 'unemployed';
                    const baseSalary = 100; // Define base or import
                    // Simplified reward logic
                    const reward = Math.floor(baseSalary * (score / 100) * (1 + (user.rating || 0) * 0.1));

                    user.balance += reward;
                    user.transactions.push({
                        id: crypto.randomUUID(),
                        type: 'income',
                        amount: reward,
                        description: `仕事報酬 (${jobType})`,
                        timestamp: Date.now()
                    });
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // ギャンブル (Dice)
        // -----------------------------------------------------
        if (type === 'gamble_dice') {
            const bet = Number(amount);
            const guess = details; // 'high' or 'low'

            let resultData: any = {};

            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (!user) return state;

                if (user.balance < bet) {
                    // This check usually happens before call, but double check
                    return state;
                }

                // Deduct Bet first
                user.balance -= bet;

                // Roll Dice
                const d1 = Math.floor(Math.random() * 6) + 1;
                const d2 = Math.floor(Math.random() * 6) + 1;
                const sum = d1 + d2;

                let isWin = false;
                // Rule: 7 is House Win (Loss).
                // Low: 2-6
                // High: 8-12
                if (guess === 'low' && sum < 7) isWin = true;
                if (guess === 'high' && sum > 7) isWin = true;

                let payout = 0;
                if (isWin) {
                    payout = bet * 2;
                    user.balance += payout;
                }

                if (!user.transactions) user.transactions = [];
                user.transactions.push({
                    id: crypto.randomUUID(),
                    type: isWin ? 'income' : 'payment',
                    amount: isWin ? payout - bet : bet, // Net change logged? Or gross?
                    // Let's log the net outcome description, usually payment of bet is already implicit if we deducted.
                    // Actually, let's just log the RESULT.
                    // If Win: +Payout (Net +Bet)
                    // If Lose: -Bet
                    // Simplest: Log "Gamble Win" or "Gamble Lose"
                    description: `ギャンブル(${guess}): ${isWin ? '勝利' : '敗北'} (出目${sum})`,
                    timestamp: Date.now()
                });

                resultData = {
                    dice: [d1, d2],
                    sum,
                    isWin,
                    payout,
                    balance: user.balance
                };

                return state;
            });

            if (!resultData.dice) {
                return NextResponse.json({ error: 'Balance insufficient' }, { status: 400 });
            }

            return NextResponse.json({ success: true, ...resultData });
        }

        // -----------------------------------------------------
        // ギャンブル - ブラックジャック
        // -----------------------------------------------------
        if (type === 'gamble_blackjack') {
            const bet = Number(amount);
            const gameData = JSON.parse(details);

            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (!user) return state;

                // Bet already deducted on client, payout calculated there too
                // Just apply the result
                if (gameData.winAmount > 0) {
                    user.balance += gameData.winAmount;
                }

                if (!user.transactions) user.transactions = [];
                user.transactions.push({
                    id: crypto.randomUUID(),
                    type: gameData.winAmount > 0 ? 'income' : 'payment',
                    amount: gameData.winAmount > 0 ? gameData.winAmount - bet : bet,
                    description: `ブラックジャック: ${gameData.outcome}`,
                    timestamp: Date.now()
                });

                return state;
            });

            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // ギャンブル - スロット
        // -----------------------------------------------------
        if (type === 'gamble_slot') {
            const bet = Number(amount);
            const gameData = JSON.parse(details);

            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (!user) return state;

                // Deduct bet
                user.balance -= bet;

                // Add payout if win
                if (gameData.payout > 0) {
                    user.balance += gameData.payout;
                }

                if (!user.transactions) user.transactions = [];
                user.transactions.push({
                    id: crypto.randomUUID(),
                    type: gameData.payout > 0 ? 'income' : 'payment',
                    amount: gameData.payout > 0 ? gameData.payout - bet : bet,
                    description: `スロット: ${gameData.message}`,
                    timestamp: Date.now()
                });

                return state;
            });

            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // ギャンブル - 競馬
        // -----------------------------------------------------
        if (type === 'gamble_horse') {
            const bet = Number(amount);
            const gameData = JSON.parse(details);

            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (!user) return state;

                // Deduct bet
                user.balance -= bet;

                // Add payout if win
                if (gameData.payout > 0) {
                    user.balance += gameData.payout;
                }

                if (!user.transactions) user.transactions = [];
                user.transactions.push({
                    id: crypto.randomUUID(),
                    type: gameData.payout > 0 ? 'income' : 'payment',
                    amount: gameData.payout > 0 ? gameData.payout - bet : bet,
                    description: `競馬: ${gameData.payout > 0 ? '的中!' : '外れ'} (馬${gameData.selectedHorse}→${gameData.winner})`,
                    timestamp: Date.now()
                });

                return state;
            });

            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // 店舗・不動産アクション
        // -----------------------------------------------------
        if (type === 'buy_property') {
            const propertyId = details;
            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                const property = state.properties?.find(p => p.id === propertyId);

                if (user && property && !property.ownerId) {
                    if (user.balance >= property.price) {
                        user.balance -= property.price;
                        property.ownerId = user.id;

                        // If it's land, update user landRank
                        if (property.type === 'land') {
                            if (property.name.includes('一等地')) user.landRank = 3;
                            else user.landRank = 1;
                        }

                        user.transactions.push({
                            id: crypto.randomUUID(), type: 'payment', amount: property.price, description: `不動産購入: ${property.name}`, timestamp: Date.now()
                        });
                        state.news.push(`🏠 ${user.name}が「${property.name}」を購入しました！`);
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'update_shop_menu') {
            // details = JSON string of ShopItem[]
            const items = JSON.parse(details);
            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    user.shopMenu = items;
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'restock_item') {
            const { itemId, quantity } = JSON.parse(details);
            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user && user.shopMenu) {
                    const item = user.shopMenu.find(i => i.id === itemId);
                    if (item) {
                        const cost = item.cost * quantity;
                        if (user.balance >= cost) {
                            user.balance -= cost;
                            item.stock += quantity;
                            user.transactions.push({
                                id: crypto.randomUUID(), type: 'payment', amount: cost, description: `仕入れ: ${item.name} x${quantity}`, timestamp: Date.now()
                            });
                        }
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // 秘密コード解除
        // -----------------------------------------------------
        if (type === 'unlock_secret') {
            const code = details?.toUpperCase();
            const SECRET_CODES: Record<string, string> = {
                'DARK666': 'forbidden_market',
                'SHADOW': 'forbidden_market',
                'FORBIDDEN': 'forbidden_market'
            };

            if (SECRET_CODES[code]) {
                updateGameState((state) => {
                    const user = state.users.find(u => u.id === requesterId);
                    if (user) {
                        user.isForbiddenUnlocked = true;
                    }
                    return state;
                });
                return NextResponse.json({ success: true, unlocked: SECRET_CODES[code], message: '禁断の市場が解放されました！' });
            }
            return NextResponse.json({ success: false, message: 'コードが無効です' }, { status: 400 });
        }

        updateGameState((state) => {
            state.requests.push(newRequest);
            return state;
        });

        // クーポン作成
        if (type === 'create_coupon') {
            const { code, discountPercent, minPurchase, maxUses, expiresAt } = JSON.parse(details);

            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (!user) return state;

                const newCoupon = {
                    id: crypto.randomUUID(),
                    shopOwnerId: requesterId,
                    code,
                    discountPercent: Number(discountPercent),
                    minPurchase: minPurchase ? Number(minPurchase) : undefined,
                    maxUses: maxUses ? Number(maxUses) : undefined,
                    usedCount: 0,
                    expiresAt: expiresAt ? Number(expiresAt) : undefined,
                    createdAt: Date.now(),
                    isActive: true
                };

                if (!user.coupons) user.coupons = [];
                user.coupons.push(newCoupon);

                return state;
            });

            return NextResponse.json({ success: true });
        }

        // ガチャを回す
        if (type === 'play_gacha') {
            let result: any = null;

            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (!user || user.balance < 100) return state;

                // 100枚消費
                user.balance -= 100;

                // ランダム抽選
                const { GACHA_ITEMS } = require('@/lib/gameData');
                const random = Math.random() * 100;
                let cumulative = 0;

                for (const item of GACHA_ITEMS) {
                    cumulative += item.dropRate;
                    if (random <= cumulative) {
                        result = item;
                        break;
                    }
                }

                // コレクションに追加
                if (result) {
                    if (!user.gachaCollection) user.gachaCollection = [];
                    if (!user.gachaCollection.includes(result.id)) {
                        user.gachaCollection.push(result.id);
                    }
                }

                return state;
            });

            return NextResponse.json({ success: true, item: result });
        }

        // カタログから仕入れ
        // カタログから仕入れ
        if (type === 'restock_from_catalog') {
            const { catalogType, itemId, cost, price, stock } = JSON.parse(details);
            let earnedPoints = 0;

            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (!user) return state;

                const totalCost = cost * stock;
                if (user.balance < totalCost) return state;

                user.balance -= totalCost;

                // ポイント付与 (10%)
                earnedPoints = Math.floor(totalCost * 0.1);
                user.catalogPoints = (user.catalogPoints || 0) + earnedPoints;

                // カタログからアイテム情報取得
                let catalogItem;
                const { FURNITURE_CATALOG, PET_CATALOG, INGREDIENTS } = require('@/lib/gameData');

                if (catalogType === 'furniture') {
                    catalogItem = FURNITURE_CATALOG.find((i: any) => i.id === itemId);
                } else if (catalogType === 'pet') {
                    catalogItem = PET_CATALOG.find((i: any) => i.id === itemId);
                } else if (catalogType === 'ingredient') {
                    catalogItem = INGREDIENTS.find((i: any) => i.id === itemId);
                }

                if (!catalogItem) return state;

                // shopMenuに追加
                if (!user.shopMenu) user.shopMenu = [];
                const existing = user.shopMenu.find(i => i.id === itemId);

                if (existing) {
                    existing.stock += stock;
                } else {
                    user.shopMenu.push({
                        id: itemId,
                        name: catalogItem.name,
                        emoji: catalogItem.emoji,
                        cost,
                        price,
                        stock,
                        category: catalogType as any
                    });
                }

                // 履歴に追加
                if (!user.transactions) user.transactions = [];
                user.transactions.push({
                    id: crypto.randomUUID(), type: 'payment', amount: totalCost, description: `仕入れ: ${catalogItem.name} x${stock} (+${earnedPoints}pt)`, timestamp: Date.now()
                });

                return state;
            });

            return NextResponse.json({ success: true, points: earnedPoints });
        }

        // ポイント交換
        if (type === 'exchange_points') {
            const { itemId, pointsCost, itemType, itemData } = JSON.parse(details);

            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (!user) return state;

                const currentPoints = user.catalogPoints || 0;
                if (currentPoints < pointsCost) return state;

                // ポイント消費
                user.catalogPoints = currentPoints - pointsCost;

                // アイテム付与
                // itemType: 'gacha_ticket', 'furniture', etc.
                if (itemType === 'furniture') {
                    // shopMenuに追加 (在庫として)
                    if (!user.shopMenu) user.shopMenu = [];
                    // 限定家具などは原価0で追加
                    user.shopMenu.push({
                        id: itemId,
                        name: itemData.name,
                        emoji: itemData.emoji,
                        cost: 0,
                        price: itemData.price || 1000,
                        stock: 1,
                        category: 'furniture',
                        isSale: false
                    });
                } else if (itemType === 'gacha_ticket') {
                    // チケット機能はまだないので、とりあえずgachaCollectionに追加するか、
                    // あるいは所持金に換金するか...ここは一旦「レアアイテム」としてshopMenuに追加
                    if (!user.shopMenu) user.shopMenu = [];
                    user.shopMenu.push({
                        id: itemId,
                        name: itemData.name,
                        emoji: itemData.emoji,
                        cost: 0,
                        price: 0, // 売れない？
                        stock: 1,
                        category: 'other',
                        description: '持っているといいことがあるかも？'
                    });
                }

                // 履歴
                if (!user.transactions) user.transactions = [];
                user.transactions.push({
                    id: crypto.randomUUID(), type: 'payment', amount: 0, description: `ポイント交換: ${itemData.name} (-${pointsCost}pt)`, timestamp: Date.now()
                });

                return state;
            });

            return NextResponse.json({ success: true });
        }

        // まとめ買い
        if (type === 'bulk_purchase_shop_items') {
            const { sellerId, cartItems, couponCode } = JSON.parse(details);

            let totalCost = 0;
            let discount = 0;

            updateGameState((state) => {
                const buyer = state.users.find(u => u.id === requesterId);
                const seller = state.users.find(u => u.id === sellerId);
                if (!buyer || !seller) return state;

                const itemsToPurchase: { item: any, quantity: number }[] = [];

                // cartItems: Record<string, number> (itemId -> quantity)
                // 各アイテムの価格を計算
                Object.entries(cartItems as Record<string, number>).forEach(([itemId, quantity]) => {
                    const item = seller.shopMenu?.find(i => i.id === itemId);
                    if (item && item.stock >= quantity) {
                        totalCost += item.price * quantity;
                        itemsToPurchase.push({ item, quantity });
                    }
                });

                // クーポン適用
                if (couponCode && seller.coupons) {
                    const coupon = seller.coupons.find(c =>
                        c.code === couponCode &&
                        c.isActive &&
                        (!c.expiresAt || c.expiresAt > Date.now()) &&
                        (!c.maxUses || c.usedCount < c.maxUses) &&
                        (!c.minPurchase || totalCost >= c.minPurchase)
                    );

                    if (coupon) {
                        discount = Math.floor(totalCost * (coupon.discountPercent / 100));
                        totalCost -= discount;
                        coupon.usedCount++;
                    }
                }

                // 残高チェック (銀行員はバイパス)
                if (buyer.role !== 'banker' && buyer.balance < totalCost) return state;

                // 購入処理
                buyer.balance -= totalCost;
                seller.balance += totalCost;

                itemsToPurchase.forEach(({ item, quantity }) => {
                    item.stock -= quantity;
                });

                // 取引履歴
                if (!buyer.transactions) buyer.transactions = [];
                if (!seller.transactions) seller.transactions = [];

                const itemCount = Object.values(cartItems as Record<string, number>).reduce((a: number, b: number) => a + b, 0);

                buyer.transactions.push({
                    id: crypto.randomUUID(),
                    type: 'payment',
                    amount: totalCost,
                    senderId: requesterId,
                    receiverId: sellerId,
                    description: `一括購入: ${seller.name}の店 (${itemCount}点)`,
                    timestamp: Date.now()
                });

                seller.transactions.push({
                    id: crypto.randomUUID(),
                    type: 'income',
                    amount: totalCost,
                    senderId: requesterId,
                    receiverId: sellerId,
                    description: `売上: ${itemCount}点`,
                    timestamp: Date.now()
                });

                return state;
            });

            return NextResponse.json({ success: true, total: totalCost, discount });
        }

        return NextResponse.json({ success: true, request: newRequest });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit action' }, { status: 500 });
    }
}
