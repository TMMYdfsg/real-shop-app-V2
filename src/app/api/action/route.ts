import { NextResponse, NextRequest } from 'next/server';
import { updateGameState } from '@/lib/dataStore';
import { v4 as uuidv4 } from 'uuid';
import { Request as GameRequest, GameState } from '@/types';
import crypto from 'crypto';
import { z } from 'zod'; // Zod Import

import { JOB_GAME_CONFIGS, JobType } from '@/lib/jobData';
import { GACHA_ITEMS } from '@/lib/gameData';
import { logAudit, checkResalePrice } from '@/lib/audit';
import { eventManager } from '@/lib/eventManager';
import { getGameState } from '@/lib/dataStore';
import { calculateSalary } from '@/lib/career';
import { JOBS, PART_TIME_JOBS } from '@/lib/gameData';
import { COMPANY_BASE_SALARY } from '@/lib/companyData';

// // export const dynamic = 'force-dynamic';

// Validation Schema
const ActionSchema = z.object({
    type: z.string(),
    requesterId: z.string(),
    amount: z.number().optional(),
    details: z.any().optional(), // Flexible for now, can be tightened later
    idempotencyKey: z.string().optional()
});

const STOCK_TICK_INTERVAL_MS = 10000;
let lastStockTickAt = 0;

const applyStockPriceTick = (state: GameState) => {
    state.stocks.forEach((stock) => {
        const changePercent = (Math.random() - 0.5) * stock.volatility * 2;
        const change = Math.floor(stock.price * changePercent);
        stock.previousPrice = stock.price;
        stock.price += change;
        if (stock.price < 1) stock.price = 1;
        stock.price = Math.round(stock.price / 10) * 10;

        if (!stock.priceHistory) stock.priceHistory = [];
        stock.priceHistory.push(stock.price);
        if (stock.priceHistory.length > 20) {
            stock.priceHistory.shift();
        }
    });
};

export async function POST(request: NextRequest) {
    const safeParseDetails = (d: any) => {
        if (!d) return {};
        if (typeof d === 'string') {
            try {
                return JSON.parse(d);
            } catch (e) {
                console.error('Failed to parse details string:', d);
                return {};
            }
        }
        return d;
    };

    try {
        const body = await request.json();

        // Validate Validation
        const result = ActionSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: 'Invalid request data', details: result.error.format() }, { status: 400 });
        }

        const { type, requesterId, amount, details, idempotencyKey } = result.data;

        if (!type || !requesterId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // --- 1. Idempotency Check ---
        if (idempotencyKey) {
            const state = await getGameState();
            if (state.processedIdempotencyKeys?.includes(idempotencyKey)) {
                return NextResponse.json({ success: true, message: 'Already processed (Idempotent)' });
            }
        }

        let eventToBroadcast: any = null;

        const newRequest: GameRequest = {
            id: uuidv4(),
            type: type as GameRequest['type'],
            requesterId,
            amount: Number(amount) || 0,
            details,
            status: 'pending',
            timestamp: Date.now(),
            idempotencyKey
        };

        const timeGateState = await getGameState();
        const timeGateUser = timeGateState.users.find(u => u.id === requesterId);
        if (timeGateUser?.timeEra === 'past') {
            const blockedActions = new Set([
                'install_app',
                'uninstall_app',
                'post_sns',
                'like_sns',
                'upload_video',
                'buy_stock',
                'sell_stock',
                'stock_tick',
                'gamble_dice',
                'gamble_blackjack',
                'gamble_slot',
                'gamble_horse'
            ]);

            if (blockedActions.has(type)) {
                return NextResponse.json({ success: false, message: '1950年代では利用できません。' }, { status: 403 });
            }
        }

        if (type === 'stock_tick') {
            const now = Date.now();
            if (now - lastStockTickAt < STOCK_TICK_INTERVAL_MS) {
                return NextResponse.json({ success: true, skipped: true });
            }

            await updateGameState((state) => {
                applyStockPriceTick(state);
                return state;
            });
            lastStockTickAt = now;
            return NextResponse.json({ success: true });
        }

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
                await updateGameState((state) => {
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

        if (type === 'install_app' || type === 'uninstall_app') {
            const parsedDetails = typeof details === 'string' ? JSON.parse(details || '{}') : details;
            const appId = parsedDetails?.appId;
            if (!appId) {
                return NextResponse.json({ success: false, message: 'アプリIDが必要です' });
            }

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (!user) return state;

                if (!user.smartphone) {
                    user.smartphone = {
                        model: 'Android',
                        apps: ['shopping'],
                        broken: false,
                        battery: 100
                    };
                }

                const installed = new Set(user.smartphone.apps || []);
                if (type === 'install_app') {
                    installed.add(appId);
                    installed.add('shopping');
                } else {
                    if (appId !== 'shopping') installed.delete(appId);
                    installed.add('shopping');
                }

                user.smartphone.apps = Array.from(installed);
                return state;
            });

            return NextResponse.json({ success: true });
        }

        if (type === 'change_job') {
            await updateGameState((state) => {
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

        if (type === 'city_buy_land') {
            const landId = details;

            // 土地購入処理
            let purchaseSuccess = false;
            let purchasedLandAddress = '';
            let updatedLand: any = null;

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (!user) return state;

                // DBにlandsがない場合は初期化
                if (!state.lands || state.lands.length === 0) {
                    const { generateLands } = require('@/lib/cityData');
                    state.lands = generateLands();
                }

                let land = state.lands.find(l => l.id === landId);

                // まだリストにない場合はcityDataから取得して追加
                if (!land) {
                    const { generateLands } = require('@/lib/cityData');
                    const allLands = generateLands();
                    const target = allLands.find((l: any) => l.id === landId);
                    if (target) {
                        state.lands.push(target);
                        land = target;
                    }
                }

                if (user && land) {
                    // バリデーション
                    if (land.ownerId && land.ownerId !== 'public' && land.ownerId !== '') {
                        return state; // 既に誰かが所有
                    }
                    if (user.balance < land.price) return state; // 資金不足

                    // 支払い
                    user.balance -= land.price;

                    // 所有権移転
                    land.ownerId = user.id;
                    land.isForSale = false;
                    land.status = 'owned';

                    // ユーザーの所有地リストに追加
                    if (!user.ownedLands) user.ownedLands = [];
                    if (!user.ownedLands.includes(land.id)) {
                        user.ownedLands.push(land.id);
                    }

                    // 履歴追加
                    if (!user.transactions) user.transactions = [];
                    user.transactions.push({
                        id: uuidv4(),
                        type: 'payment',
                        amount: land.price,
                        senderId: user.id,
                        description: `土地購入 (${land.address})`,
                        timestamp: Date.now()
                    });

                    purchaseSuccess = true;
                    purchasedLandAddress = land.address;
                    updatedLand = land;

                    // --- Phase 8: Record Idempotency ---
                    if (idempotencyKey) state.processedIdempotencyKeys.push(idempotencyKey);
                }
                return state;
            });

            if (purchaseSuccess && updatedLand) {
                eventManager.broadcast({
                    type: 'STATE_SYNC',
                    payload: { type: 'land_update', land: updatedLand },
                    timestamp: Date.now(),
                    revision: 0
                });
                return NextResponse.json({ success: true, message: `${purchasedLandAddress}を購入しました！` });
            } else {
                return NextResponse.json({ success: false, message: '購入できませんでした' });
            }
        }

        if (type === 'city_build_place') {
            const { landId, buildingType, buildingName, companyType, companyAbilityId, companyStatId } = safeParseDetails(details);
            let checkSuccess = false;

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                const land = state.lands.find(l => l.id === landId);

                if (user && land && land.ownerId === user.id) {
                    // 建設コスト計算 (簡易)
                    // House: 500万, Shop: 1000万, Company: 2000万
                    let cost = 5000000;
                    if (buildingType === 'shop') cost = 10000000;
                    if (buildingType === 'company') cost = 20000000;

                    if (user.balance < cost) return state;

                    // 支払い
                    user.balance -= cost;

                    // Place作成
                    const placeId = `plc_${uuidv4()}`;
                    const normalizedCompanyType = companyType || 'start_up';
                    const baseSalary = COMPANY_BASE_SALARY[normalizedCompanyType as keyof typeof COMPANY_BASE_SALARY] || 180000;
                    const newPlace: any = { // Use 'any' or correct Place type matching updated index.ts
                        id: placeId,
                        ownerId: user.id,
                        name: buildingName || 'New Building',
                        type: buildingType === 'house' ? 'residential' : (buildingType === 'shop' ? 'retail' : 'office'),
                        buildingCategory: buildingType,
                        companyType: normalizedCompanyType,
                        companyProfile: buildingType === 'company' ? {
                            abilityId: companyAbilityId || 'automation',
                            statId: companyStatId || 'management',
                            baseSalary
                        } : undefined,
                        location: { ...land.location, address: land.address, landId: land.id },
                        status: 'active',
                        level: 1,
                        employees: [],
                        stats: { capital: 0, sales: 0, expenses: 0, profit: 0, reputation: 0, customerCount: 0 },
                        licenses: [],
                        insurances: []
                    };

                    if (!state.places) state.places = [];
                    state.places.push(newPlace);
                    if (!user.ownedPlaces) user.ownedPlaces = [];
                    if (!user.ownedPlaces.includes(placeId)) user.ownedPlaces.push(placeId);

                    // 土地情報更新
                    land.placeId = placeId;

                    // 履歴
                    if (!user.transactions) user.transactions = [];
                    user.transactions.push({
                        id: uuidv4(),
                        type: 'payment',
                        amount: cost,
                        senderId: user.id,
                        description: `建設費用 (${buildingName})`,
                        timestamp: Date.now()
                    });

                    checkSuccess = true;

                    if (idempotencyKey) state.processedIdempotencyKeys.push(idempotencyKey);
                }
                return state;
            });

            if (checkSuccess) {
                eventManager.broadcast({
                    type: 'STATE_SYNC',
                    payload: { type: 'places_update' }, // Simplified event
                    timestamp: Date.now(),
                    revision: 0
                });
                return NextResponse.json({ success: true, message: '建設完了！' });
            } else {
                return NextResponse.json({ success: false, message: '建設に失敗しました（資金不足または所有権なし）' });
            }
        }

        if (type === 'city_update_land_coord') {
            const { landId, lat, lng } = safeParseDetails(details);
            await updateGameState((state) => {
                // landsが未初期化の場合は初期化
                if (!state.lands || state.lands.length === 0) {
                    const { generateLands } = require('@/lib/cityData');
                    state.lands = generateLands();
                }

                let land = state.lands.find(l => l.id === landId);

                // まだリストにない場合は追加（cityDataから復元）
                if (!land) {
                    const { generateLands } = require('@/lib/cityData');
                    const allLands = generateLands();
                    const target = allLands.find((l: any) => l.id === landId);
                    if (target) {
                        state.lands.push(target);
                        land = target;
                    }
                }

                if (land) {
                    land.location = { lat, lng };
                    // DB同期用
                    (land as any).lat = lat;
                    (land as any).lng = lng;
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'admin_update_land') {
            const updates = safeParseDetails(details);
            await updateGameState((state) => {
                const land = state.lands.find(l => l.id === updates.landId);
                if (land) {
                    if (updates.price !== undefined) land.price = updates.price;
                    if (updates.maintenanceFee !== undefined) land.maintenanceFee = updates.maintenanceFee;
                    if (updates.requiresApproval !== undefined) land.requiresApproval = updates.requiresApproval;
                    if (updates.allowConstruction !== undefined) land.allowConstruction = updates.allowConstruction;
                    if (updates.allowCompany !== undefined) land.allowCompany = updates.allowCompany;
                    if (updates.isForSale !== undefined) land.isForSale = updates.isForSale;
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'city_buy_address') {
            const { address, location, polygon, price } = safeParseDetails(details);
            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    if (user.balance < price) return state;

                    user.balance -= price;
                    const landId = `addr_${uuidv4()}`;
                    const newLand = {
                        id: landId,
                        ownerId: user.id,
                        price,
                        location,
                        address,
                        isForSale: false,
                        polygon,
                        size: 100, // Default 100m2
                        zoning: 'residential' // Default zoning
                    };

                    if (!state.lands) state.lands = [];
                    state.lands.push(newLand);

                    if (!user.ownedLands) user.ownedLands = [];
                    user.ownedLands.push(landId);

                    if (!user.transactions) user.transactions = [];
                    user.transactions.push({
                        id: uuidv4(),
                        type: 'payment',
                        amount: price,
                        senderId: user.id,
                        description: `住所指定購入 (${address})`,
                        timestamp: Date.now()
                    });

                    // --- Phase 8: Record Idempotency ---
                    if (idempotencyKey) state.processedIdempotencyKeys.push(idempotencyKey);
                }
                return state;
            });
            eventManager.broadcast({
                type: 'STATE_SYNC',
                payload: { type: 'address_land_purchased', address },
                timestamp: Date.now(),
                revision: 0
            });
            return NextResponse.json({ success: true, message: '住所指定で土地を購入しました' });
        }

        if (type === 'city_update_land') {
            const { landId, price, isForSale } = details;

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                const land = state.lands.find(l => l.id === landId);

                if (user && land) {
                    // 権限チェック: 所有者 or 銀行員 or 不動産屋
                    const isOwner = land.ownerId === user.id;
                    const isAdmin = user.role === 'banker' || user.job === 'real_estate_agent';

                    if (!isOwner && !isAdmin) {
                        return state; // 権限なし
                    }

                    // 更新
                    if (price !== undefined) land.price = Number(price);
                    if (isForSale !== undefined) land.isForSale = isForSale;
                }
                return state;
            });
            return NextResponse.json({ success: true, message: '土地情報を更新しました' });
        }

        // --- Virtual Currency Actions ---
        if (type === 'crypto_create') {
            const { name, symbol, price, volatility, description } = safeParseDetails(details);
            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user && user.role === 'banker') {
                    const newCrypto = {
                        id: `cry_${uuidv4()}`,
                        name,
                        symbol,
                        price: Number(price),
                        previousPrice: Number(price),
                        volatility: Number(volatility),
                        priceHistory: [Number(price)],
                        creatorId: user.id,
                        description,
                        createdAt: Date.now(),
                        updatedAt: Date.now()
                    };
                    if (!state.cryptos) state.cryptos = [];
                    // @ts-ignore
                    state.cryptos.push(newCrypto);
                }
                return state;
            });
            return NextResponse.json({ success: true, message: '仮想通貨を作成しました' });
        }

        if (type === 'crypto_manage') {
            const { action, cryptoId, data } = safeParseDetails(details);

            if (action === 'delete') {
                const { prisma } = await import('@/lib/db');
                await prisma.crypto.delete({ where: { id: cryptoId } });
                return NextResponse.json({ success: true, message: '削除しました' });
            }

            if (action === 'update') {
                await updateGameState((state) => {
                    const c = state.cryptos.find(x => x.id === cryptoId);
                    if (c && data) {
                        if (data.name) c.name = data.name;
                        if (data.symbol) c.symbol = data.symbol;
                        if (data.price) {
                            c.previousPrice = c.price;
                            c.price = Number(data.price);
                        }
                        if (data.volatility) c.volatility = Number(data.volatility);
                        if (data.description) c.description = data.description;
                    }
                    return state;
                });
                return NextResponse.json({ success: true, message: '更新しました' });
            }

            return NextResponse.json({ success: true });
        }

        if (type === 'crypto_buy') {
            const { cryptoId, amount: buyAmount } = details ? safeParseDetails(details) : { cryptoId: '', amount: 0 }; // buyAmount is quantity? Or currency?
            // "amount" in top level is usually currency amount for generic checking, but here let's clarify.
            // Let's assume 'amount' passed in body is the COST (total price).
            // details has the quantity.

            // Re-reading logic: standard is `amount` is the money involved.

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                const coin = state.cryptos.find(c => c.id === cryptoId);

                if (user && coin) {
                    const cost = Number(amount); // This should be calculated by client: price * quantity
                    // Verify cost approximately to prevent cheating?
                    // Ideally we pass quantity and calc cost server side.
                    // But for now, trusting the request if balance is sufficient.

                    if (user.balance >= cost) {
                        user.balance -= cost;

                        // Quantity calculation based on current price to be safe?
                        // If client sends cost, we calculate quantity = cost / coin.price
                        const quantity = cost / coin.price;

                        if (!user.cryptoHoldings) user.cryptoHoldings = {};
                        user.cryptoHoldings[cryptoId] = (user.cryptoHoldings[cryptoId] || 0) + quantity;

                        if (!user.transactions) user.transactions = [];
                        user.transactions.push({
                            id: uuidv4(),
                            type: 'payment',
                            amount: cost,
                            senderId: user.id,
                            description: `仮想通貨購入 (${coin.name} x${quantity.toFixed(4)})`,
                            timestamp: Date.now()
                        });
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true, message: '購入しました' });
        }

        if (type === 'crypto_sell') {
            const { cryptoId, amount: sellCost } = details ? safeParseDetails(details) : { cryptoId: '', amount: 0 };
            // amount is the money to receive.

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                const coin = state.cryptos.find(c => c.id === cryptoId);

                if (user && coin) {
                    const receiveAmount = Number(amount);
                    const quantityToSell = receiveAmount / coin.price;

                    if (user.cryptoHoldings && (user.cryptoHoldings[cryptoId] || 0) >= quantityToSell) {
                        user.cryptoHoldings[cryptoId] -= quantityToSell;
                        user.balance += receiveAmount;

                        if (!user.transactions) user.transactions = [];
                        user.transactions.push({
                            id: uuidv4(),
                            type: 'income',
                            amount: receiveAmount,
                            senderId: user.id,
                            description: `仮想通貨売却 (${coin.name} x${quantityToSell.toFixed(4)})`,
                            timestamp: Date.now()
                        });
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true, message: '売却しました' });
        }



        if (type === 'pay_tax') {
            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    const payAmount = Number(amount);
                    if (user.balance >= payAmount) {
                        user.balance -= payAmount;
                        user.unpaidTax = Math.max(0, (user.unpaidTax || 0) - payAmount);

                        // 履歴追加
                        if (!user.transactions) user.transactions = [];
                        user.transactions.push({
                            id: uuidv4(),
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
            await updateGameState((state) => {
                // Unlock for everyone
                state.users.forEach(u => u.isForbiddenUnlocked = true);
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'deposit') {
            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    const val = Number(amount);
                    if (user.balance >= val) {
                        user.balance -= val;
                        user.deposit += val;
                        // 履歴
                        if (!user.transactions) user.transactions = [];
                        user.transactions.push({
                            id: uuidv4(), type: 'deposit', amount: val, senderId: user.id, description: '預け入れ', timestamp: Date.now()
                        });
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'withdraw') {
            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    const val = Number(amount);
                    if (user.deposit >= val) {
                        user.deposit -= val;
                        user.balance += val;
                        // 履歴
                        if (!user.transactions) user.transactions = [];
                        user.transactions.push({
                            id: uuidv4(), type: 'withdraw', amount: val, senderId: user.id, description: '引き出し', timestamp: Date.now()
                        });
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'update_profile') {
            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user && details) {
                    const { name, shopName, cardType, isInsured, propertyLevel, playerIcon, settings, smartphone, traits, skills, needsTraitSelection } = safeParseDetails(details);
                    if (name !== undefined) user.name = name;
                    if (shopName !== undefined) user.shopName = shopName;
                    if (cardType !== undefined) user.cardType = cardType;
                    if (isInsured !== undefined) user.isInsured = isInsured;
                    if (propertyLevel !== undefined) user.propertyLevel = propertyLevel;
                    if (playerIcon !== undefined) user.playerIcon = playerIcon;
                    if (traits !== undefined) user.traits = Array.isArray(traits) ? traits : [];
                    if (skills !== undefined && typeof skills === 'object') user.skills = skills;
                    if (needsTraitSelection !== undefined) user.needsTraitSelection = !!needsTraitSelection;
                    if (settings !== undefined) {
                        user.settings = { ...user.settings, ...settings };
                    }
                    if (smartphone !== undefined) {
                        const baseSmartphone = user.smartphone || {
                            model: 'Android',
                            apps: ['shopping'],
                            appOrder: ['shopping'],
                            broken: false,
                            battery: 100,
                            settings: { customIcons: [] }
                        };
                        user.smartphone = { ...baseSmartphone, ...smartphone };
                        if (smartphone.settings) {
                            user.smartphone.settings = {
                                ...baseSmartphone.settings,
                                ...smartphone.settings,
                                customIcons: smartphone.settings.customIcons ?? baseSmartphone.settings?.customIcons ?? []
                            };
                        }
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'train_skill') {
            const parsed = safeParseDetails(details);
            const skillName = parsed?.skillName;
            const score = Number(parsed?.score || 0);
            if (!skillName) {
                return NextResponse.json({ success: false, message: 'スキル名が必要です' }, { status: 400 });
            }

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (!user) return state;
                if (!user.skills) user.skills = {};
                const current = user.skills[skillName] || 0;
                const gain = Math.max(1, Math.min(5, Math.floor(score / 20)));
                user.skills[skillName] = current + gain;
                return state;
            });

            return NextResponse.json({ success: true });
        }

        if (type === 'create_website' || type === 'update_website') {
            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user && details) {
                    const websiteData = safeParseDetails(details);
                    if (websiteData.shopName) user.shopName = websiteData.shopName;
                    user.shopWebsite = {
                        ...websiteData,
                        ownerId: user.id
                    };
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'update_exchange_items') {
            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user && details) {
                    const items = safeParseDetails(details);
                    user.pointExchangeItems = items;
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'exchange_user_item') {
            await updateGameState((state) => {
                const buyer = state.users.find(u => u.id === requesterId);
                if (!buyer || !details) return state;

                const { itemId, ownerId } = safeParseDetails(details);
                const owner = state.users.find(u => u.id === ownerId);

                if (!owner || !owner.pointExchangeItems) return state;

                const item = owner.pointExchangeItems.find(i => i.id === itemId);
                if (!item) return state;

                // 在庫とポイントチェック
                if ((item.stock || 0) <= 0) return state;

                // ロイヤルティポイントの初期化とチェック
                if (!buyer.loyaltyPoints) buyer.loyaltyPoints = 0;
                if (buyer.loyaltyPoints < item.pointCost) return state;

                // ポイント消費
                buyer.loyaltyPoints -= item.pointCost;

                // 在庫減少
                if (item.stock !== undefined) {
                    item.stock -= 1;
                }

                // 交換カウント増加
                if (item.exchangedCount !== undefined) {
                    item.exchangedCount += 1;
                } else {
                    item.exchangedCount = 1;
                }

                // 交換したアイテムを buyer のインベントリに追加
                if (!buyer.inventory) buyer.inventory = [];
                const existing = buyer.inventory.find(inv => inv.itemId === item.id);
                if (existing) {
                    existing.quantity = (existing.quantity || 0) + 1;
                } else {
                    buyer.inventory.push({
                        id: crypto.randomUUID(),
                        itemId: item.id,
                        name: item.name,
                        quantity: 1,
                    });
                }

                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'purchase_product') {
            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId); // Buyer
                if (!user) return state;

                const { productId, sellerId } = details ? safeParseDetails(details) : { productId: '', sellerId: '' };
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
                            id: uuidv4(), type: 'payment', amount: product.price, senderId: user.id, receiverId: seller.id, description: `購入: ${product.name}`, timestamp: Date.now()
                        });

                        if (!seller.transactions) seller.transactions = [];
                        seller.transactions.push({
                            id: uuidv4(), type: 'income', amount: product.price, senderId: user.id, receiverId: seller.id, description: `売上: ${product.name}`, timestamp: Date.now()
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
            await updateGameState((state) => {
                const buyer = state.users.find(u => u.id === requesterId);
                if (!buyer) return state;

                const parsedDetails: { itemId?: string; sellerId?: string } = details ? safeParseDetails(details) : {};
                const { itemId, sellerId } = parsedDetails;
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
                        id: uuidv4(),
                        type: 'payment',
                        amount: item.price,
                        senderId: buyer.id,
                        receiverId: seller.id,
                        description: `購入: ${item.name}（${seller.shopName || seller.name}）`,
                        timestamp: Date.now()
                    });

                    if (!seller.transactions) seller.transactions = [];
                    seller.transactions.push({
                        id: uuidv4(),
                        type: 'income',
                        amount: item.price,
                        senderId: buyer.id,
                        receiverId: seller.id,
                        description: `売上: ${item.name}`,
                        timestamp: Date.now()
                    });

                    const points = Math.floor(item.price * 0.01); // 1% points
                    if (points > 0) {
                        if (!buyer.pointCards) buyer.pointCards = [];
                        let card = buyer.pointCards.find(c => c.shopOwnerId === seller.id);
                        if (!card) {
                            card = { shopOwnerId: seller.id, points: 0 };
                            buyer.pointCards.push(card);
                        }
                        card.points += points;
                    }

                    // --- Receipt Generation ---
                    if (!buyer.receipts) buyer.receipts = [];
                    buyer.receipts.push({
                        id: uuidv4(),
                        shopOwnerId: seller.id,
                        shopOwnerName: seller.shopName || seller.name,
                        customerId: buyer.id,
                        items: [{
                            itemId: item.id,
                            name: item.name,
                            price: item.price,
                            quantity: 1
                        }],
                        total: item.price,
                        timestamp: Date.now(),
                        hasReview: false
                    });

                    // --- Phase 8: Record Idempotency ---
                    if (idempotencyKey) state.processedIdempotencyKeys.push(idempotencyKey);

                    // --- Phase 8: Event Broadcast ---
                    eventToBroadcast = {
                        type: 'SALES_NOTIFICATION',
                        payload: {
                            buyerName: buyer.name,
                            itemName: item.name,
                            price: item.price,
                            sellerId: seller.id
                        },
                        timestamp: Date.now(),
                        revision: 0
                    };
                }

                return state;
            });

            if (eventToBroadcast) {
                eventManager.broadcast(eventToBroadcast);
                // Also general sync
                    eventManager.broadcast({
                        type: 'INVENTORY_UPDATED',
                        payload: { sellerId: eventToBroadcast.payload?.sellerId ?? '' },
                        timestamp: Date.now(),
                        revision: 0
                    });
            }

            return NextResponse.json({ success: true });
        }

        // ポイント交換アクション
        if (type === 'exchange_point') {
            const { getGameState } = await import('@/lib/dataStore');
            const state = await getGameState();
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

            await updateGameState((s) => {
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
                            id: uuidv4(), type: 'income', amount: 500, description: 'ポイント交換（現金）', timestamp: Date.now()
                        });
                    } else if (exchangeType === 'debt_relief') {
                        // 借金APIと整合性を取るため、ここではloanを減らすと仮定
                        u.debt = Math.max(0, u.debt - 2000);
                        u.transactions.push({
                            id: uuidv4(), type: 'repay', amount: 2000, description: 'ポイント交換（借金免除）', timestamp: Date.now()
                        });
                    }

                    s.news.unshift({
                        id: uuidv4(),
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
            await updateGameState((state) => {
                state.isTimerRunning = true;
                state.lastTick = Date.now();
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'timer_stop') {
            await updateGameState((state) => {
                state.isTimerRunning = false;
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'timer_update') {
            const params = details ? safeParseDetails(details) : { days: 0, hours: 0, minutes: 5, seconds: 0 };
            const days = Number(params.days) || 0;
            const hours = Number(params.hours) || 0;
            const minutes = Number(params.minutes) || 0;
            const seconds = Number(params.seconds) || 0;

            const newTime =
                (days * 24 * 60 * 60 * 1000) +
                (hours * 60 * 60 * 1000) +
                (minutes * 60 * 1000) +
                (seconds * 1000);

            await updateGameState((state) => {
                state.timeRemaining = newTime;
                state.lastTick = Date.now();
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'timer_reset') {
            await updateGameState((state) => {
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
            const state = await getGameState();
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
                await updateGameState((s) => {
                    const u = s.users.find(x => x.id === requesterId);
                    if (u) {
                        u.balance += 300;
                        u.arrestCount = (u.arrestCount || 0) + 1;
                        u.transactions.push({
                            id: uuidv4(),
                            type: 'income',
                            amount: 300,
                            description: `${target.name}を逮捕`,
                            timestamp: Date.now()
                        });
                        s.news.unshift({
                            id: uuidv4(),
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
                    await updateGameState((s) => {
                        const u = s.users.find(x => x.id === requesterId);
                        const v = s.users.find(x => x.id === details);
                        if (u && v) {
                            v.balance -= actual;
                            u.balance += actual;
                            u.stolenAmount = (u.stolenAmount || 0) + actual;
                            u.transactions.push({
                                id: uuidv4(),
                                type: 'income',
                                amount: actual,
                                description: '盗み成功',
                                timestamp: Date.now()
                            });
                            s.news.unshift({
                                id: uuidv4(),
                                message: `💰 誰かが${actual}枚を盗んだようです...`,
                                timestamp: Date.now()
                            });
                        }
                        return s;
                    });
                    return NextResponse.json({ success: true, message: `${actual}枚を盗みました！` });
                } else {
                    await updateGameState((s) => {
                        const u = s.users.find(x => x.id === requesterId);
                        if (u) {
                            u.balance -= 500;
                            u.transactions.push({
                                id: uuidv4(),
                                type: 'payment',
                                amount: 500,
                                description: '盗み失敗（罰金）',
                                timestamp: Date.now()
                            });
                            s.news.unshift({
                                id: uuidv4(),
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
                await updateGameState((s) => {
                    const u = s.users.find(x => x.id === requesterId);
                    if (u) {
                        u.balance += earning;
                        u.rating = (u.rating || 0) + 1;
                        u.fanCount = (u.fanCount || 0) + Math.floor(Math.random() * 10) + 1;
                        u.transactions.push({
                            id: uuidv4(),
                            type: 'income',
                            amount: earning,
                            description: 'ライブ投げ銭',
                            timestamp: Date.now()
                        });
                        s.news.unshift({
                            id: uuidv4(),
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
            let authError = false;

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    const score = details ? safeParseDetails(details).score : 0;
                    const jobId = user.job;
                    const job = JOBS.find(j => j.id === jobId) || PART_TIME_JOBS.find(j => j.id === jobId);

                    let reward = 0;

                    if (jobId === 'job_debugger') {
                        // Debugger Logic
                        if (!user.isDebugAuthorized) {
                            authError = true;
                            return state;
                        }
                        reward = 0; // Always 0 for debugger
                    } else if (job) {
                        const multiplier = state.settings.moneyMultiplier || 1.0;
                        // calculateSalary already applies multiplier
                        const dailySalary = calculateSalary(user as any, job, multiplier);
                        // Apply Score Percentage (e.g. 50 score -> 50% of potential earnings)
                        reward = Math.floor(dailySalary * (score / 100));
                    } else {
                        reward = Math.floor(100 * (score / 100)); // Default fallback
                    }

                    user.balance += reward;
                    if (!user.transactions) user.transactions = [];
                    user.transactions.push({
                        id: uuidv4(),
                        type: 'income',
                        amount: reward,
                        description: `仕事報酬 (${job?.name || jobId})`,
                        timestamp: Date.now()
                    });
                }
                return state;
            });

            if (authError) {
                return NextResponse.json({ success: false, error: 'デバッグ権限がありません。管理者に承認をもらってください。' });
            }

            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // ギャンブル (Dice)
        // -----------------------------------------------------
        if (type === 'gamble_dice') {
            const bet = Number(amount);
            const guess = details; // 'high' or 'low'

            let resultData: any = {};

            await updateGameState((state) => {
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
                    id: uuidv4(),
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
            const gameData = safeParseDetails(details);

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (!user) return state;

                // Bet already deducted on client, payout calculated there too
                // Just apply the result
                if (gameData.winAmount > 0) {
                    user.balance += gameData.winAmount;
                }

                if (!user.transactions) user.transactions = [];
                user.transactions.push({
                    id: uuidv4(),
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
            const gameData = safeParseDetails(details);

            await updateGameState((state) => {
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
                    id: uuidv4(),
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
            const gameData = safeParseDetails(details);

            await updateGameState((state) => {
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
                    id: uuidv4(),
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
            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                const property = state.properties?.find(p => p.id === propertyId);

                if (user && property && !property.ownerId) {
                    if (user.balance >= property.price) {
                        user.balance -= property.price;
                        property.ownerId = user.id;

                        // If it's land, update user landRank
                        if (property.type === 'land') {
                            user.landRank = (user.landRank || 0) + 1;
                        }

                        // History
                        user.transactions.push({
                            id: uuidv4(), type: 'payment', amount: property.price, senderId: user.id, description: `不動産購入: ${property.name}`, timestamp: Date.now()
                        });
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        // =====================================================
        // PHASE 2: 通勤と移動システム
        // =====================================================

        // -----------------------------------------------------
        // 車両購入 (buy_vehicle)
        // -----------------------------------------------------
        if (type === 'buy_vehicle') {
            const vehicleId = details;

            // 後で動的にインポートするか、データストア拡張時に組み込むのが望ましいが、簡易的にここで定義・参照
            const { VEHICLE_CATALOG } = await import('@/lib/gameData');
            const targetVehicle = VEHICLE_CATALOG.find(v => v.id === vehicleId);

            if (!targetVehicle) {
                return NextResponse.json({ error: '車両が見つかりません' }, { status: 404 });
            }

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    // 購入チェック
                    if (user.balance < targetVehicle.price) {
                        return state; // 残高不足 (クライアント側でもチェック推奨)
                    }
                    if (user.ownedVehicles?.includes(vehicleId)) {
                        return state; // 既に所有している
                    }

                    // 免許チェック（車の場合）
                    if (targetVehicle.type === 'car' && !user.hasLicense) {
                        return state; // 免許がない
                    }

                    // 支払い
                    user.balance -= targetVehicle.price;

                    // 所有リストに追加
                    if (!user.ownedVehicles) user.ownedVehicles = [];
                    user.ownedVehicles.push(vehicleId);

                    // 車の場合、ガソリン満タンで納車
                    if (targetVehicle.type === 'car') {
                        user.carFuel = 100;
                    }

                    // 履歴
                    if (!user.transactions) user.transactions = [];
                    user.transactions.push({
                        id: uuidv4(),
                        type: 'payment',
                        amount: targetVehicle.price,
                        senderId: user.id,
                        description: `車両購入: ${targetVehicle.name}`,
                        timestamp: Date.now()
                    });

                    // --- Phase 8: Record Idempotency ---
                    if (idempotencyKey) state.processedIdempotencyKeys.push(idempotencyKey);
                }
                return state;
            });

            // --- Phase 8: Event Broadcast ---
            eventManager.broadcast({
                type: 'STATE_SYNC',
                payload: { type: 'vehicle_purchased', vehicleId, requesterId },
                timestamp: Date.now(),
                revision: 0
            });

            return NextResponse.json({ success: true, message: `${targetVehicle.name}を購入しました！` });
        }

        // -----------------------------------------------------
        // 免許取得 (get_license)
        // -----------------------------------------------------
        if (type === 'get_license') {
            const LICENSE_COST = 300000; // 教習所費用

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    if (user.hasLicense) return state;
                    if (user.balance < LICENSE_COST) return state;

                    user.balance -= LICENSE_COST;
                    user.hasLicense = true;

                    if (!user.transactions) user.transactions = [];
                    user.transactions.push({
                        id: uuidv4(),
                        type: 'payment',
                        amount: LICENSE_COST,
                        senderId: user.id,
                        description: '運転免許取得費用',
                        timestamp: Date.now()
                    });
                }
                return state;
            });
            return NextResponse.json({ success: true, message: '運転免許を取得しました！' });
        }

        // -----------------------------------------------------
        // 通勤設定 (config_commute)
        // -----------------------------------------------------
        if (type === 'config_commute') {
            const { method, homeId, workId, distance, region } = safeParseDetails(details);

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    if (method) user.commuteMethod = method;
                    if (homeId) user.homeLocationId = homeId;
                    if (workId) user.workLocationId = workId;
                    if (distance) user.commuteDistance = Number(distance);
                    if (region) user.region = region;
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }


        // -----------------------------------------------------
        // 資格試験合格 (pass_exam)
        // -----------------------------------------------------
        if (type === 'pass_exam') {
            const { qualificationId } = safeParseDetails(details);
            const { QUALIFICATIONS_DATA } = await import('@/lib/qualificationData');

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                const qual = QUALIFICATIONS_DATA.find(q => q.id === qualificationId);

                if (user && qual) {
                    // Check if already owned
                    if (user.qualifications?.includes(qualificationId)) return state;

                    // Fee deduction
                    const fee = qual.feeYen || 0;
                    if (user.balance < fee) return state;

                    user.balance -= fee;

                    // Add qualification
                    if (!user.qualifications) user.qualifications = [];
                    user.qualifications.push(qualificationId);

                    // Add Payment Record
                    if (fee > 0) {
                        if (!user.transactions) user.transactions = [];
                        user.transactions.push({
                            id: uuidv4(),
                            type: 'payment',
                            amount: fee,
                            senderId: user.id,
                            description: `資格受験料 (${qual.name})`,
                            timestamp: Date.now()
                        });
                    }

                    // News
                    state.news.unshift({
                        id: uuidv4(),
                        message: `🎓 ${user.name}が「${qual.name}」を取得しました！`,
                        timestamp: Date.now()
                    });
                }
                return state;
            });
            return NextResponse.json({ success: true, message: '資格を取得しました！' });
        }

        // -----------------------------------------------------
        // パートナー探し (find_partner)
        // -----------------------------------------------------
        if (type === 'find_partner') {
            const candidates = Array.from({ length: 3 }).map(() => {
                const isFemale = Math.random() > 0.5;
                const age = Math.floor(Math.random() * 10) + 20; // 20-30
                const salary = Math.floor(Math.random() * 300) * 1000 + 200000;
                return {
                    id: uuidv4(),
                    name: isFemale ? `Female Candidate ${Math.floor(Math.random() * 100)}` : `Male Candidate ${Math.floor(Math.random() * 100)}`,
                    gender: isFemale ? 'female' : 'male',
                    age: age,
                    job: 'Company Employee',
                    salary: salary,
                    tags: ['Kind', 'Serious', 'Active'].sort(() => 0.5 - Math.random()).slice(0, 2),
                    affection: 0
                };
            });
            return NextResponse.json({ success: true, candidates });
        }

        // -----------------------------------------------------
        // 結婚 (marry_partner)
        // -----------------------------------------------------
        if (type === 'marry_partner') {
            const { candidateId } = safeParseDetails(details);

            let success = false;
            let errorMsg = '';

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (!user) return state;

                if (user.balance < 50000) {
                    errorMsg = '資金が足りません';
                    return state;
                }

                if (!user.family) user.family = [];
                // Mock spouse creation (in reality, we'd retrieve the candidate)
                const spouse = {
                    id: candidateId || uuidv4(),
                    relation: 'spouse' as 'spouse',
                    name: 'Partner', // Simplified
                    age: 25,
                    gender: 'female' as 'female' | 'male' | 'other',
                    affection: 50,
                    occupation: 'Partner'
                };
                user.family.push(spouse);

                user.balance -= 50000;
                if (!user.transactions) user.transactions = [];
                user.transactions.push({
                    id: uuidv4(),
                    type: 'payment',
                    amount: 50000,
                    description: '結婚費用',
                    timestamp: Date.now(),
                    senderId: user.id
                });

                success = true;
                return state;
            });

            if (!success) {
                return NextResponse.json({ success: false, error: errorMsg || 'Unknown error' }, { status: 400 });
            }

            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // 家具配置保存 (update_furniture_layout)
        // -----------------------------------------------------
        if (type === 'update_furniture_layout') {
            const { items } = details;

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    user.myRoomItems = items;
                }
                return state;
            });

            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // 採取 (gather_resource)
        // -----------------------------------------------------
        if (type === 'gather_resource') {
            let gatheredItem: any = null;
            let message = '何も見つかりませんでした...';

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    const rand = Math.random();
                    if (rand < 0.7) { // 70% chance
                        // Mock drop items
                        const DROPS = [
                            { id: 'ing_apple', name: '🍎 リンゴ', price: 100 },
                            { id: 'ing_herb', name: '🌿 ハーブ', price: 50 },
                            { id: 'ing_mushroom', name: '🍄 キノコ', price: 80 },
                            { id: 'col_stone', name: '🪨 きれいな石', price: 10 },
                            { id: 'col_bug', name: '🐞 てんとう虫', price: 20 },
                        ];
                        gatheredItem = DROPS[Math.floor(Math.random() * DROPS.length)];

                        if (!user.inventory) user.inventory = [];

                        // Push new InventoryItem
                        user.inventory.push({
                            id: crypto.randomUUID(),
                            itemId: gatheredItem.id,
                            quantity: 1,
                            name: gatheredItem.name
                        });

                        message = `${gatheredItem.name} を発見しました！`;

                        // Cost
                        user.lifeStats = user.lifeStats || { health: 100, hunger: 0, stress: 0, fatigue: 0, hygiene: 100 };
                        user.lifeStats.fatigue = Math.min(100, user.lifeStats.fatigue + 5);
                    } else {
                        user.lifeStats = user.lifeStats || { health: 100, hunger: 0, stress: 0, fatigue: 0, hygiene: 100 };
                        user.lifeStats.fatigue = Math.min(100, user.lifeStats.fatigue + 2);
                    }
                }
                return state;
            });

            return NextResponse.json({ success: !!gatheredItem, message, item: gatheredItem });
        }

        // -----------------------------------------------------
        // ペットと遊ぶ (interact_pet)
        // -----------------------------------------------------
        if (type === 'interact_pet') {
            const { petItemIds } = details;
            let message = '';

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user && user.myRoomItems) {
                    const pets = user.myRoomItems.filter(i => petItemIds.includes(i.id));
                    if (pets.length > 0) {
                        const happinessGain = pets.length * 5;
                        const stressReduction = pets.length * 10;

                        user.happiness = Math.min(100, (user.happiness || 50) + happinessGain);
                        if (user.lifeStats) {
                            user.lifeStats.stress = Math.max(0, user.lifeStats.stress - stressReduction);
                        }
                        message = `ペットたちと遊んで癒やされました (+${happinessGain} 幸福度)`;
                    }
                }
                return state;
            });

            return NextResponse.json({ success: true, message });
        }

        // -----------------------------------------------------
        // 通勤実行 (commute)
        // -----------------------------------------------------
        if (type === 'commute') {
            const { COMMUTE_EVENTS, VEHICLE_CATALOG } = await import('@/lib/gameData');

            // クライアントからミニゲームのスコアなどの詳細を受け取る
            const { minigameScore } = details ? safeParseDetails(details) : { minigameScore: undefined };

            let result = {
                success: true,
                message: '無事に出勤しました。',
                late: false,
                cost: 0,
                event: null as any,
                stressChange: 0,
                minigameBonus: 0
            };

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (!user) return state;

                const method = user.commuteMethod || 'walk';
                const distance = user.commuteDistance || 5; // Default 5km

                // 1. コスト計算
                let cost = 0;
                if (method === 'train') cost = 500; // 一律
                if (method === 'bus') cost = 220;
                if (method === 'taxi') cost = 700 + (distance * 300); // 初乗り700 + 300/km

                // 車の場合のガソリン消費
                if (method === 'car') {
                    // 車種特定
                    const carId = user.ownedVehicles?.find(id => id.startsWith('car_'));
                    const carData = VEHICLE_CATALOG.find(v => v.id === carId) || VEHICLE_CATALOG.find(v => v.id === 'car_kei');

                    // 燃費計算 (ミニゲームで好成績なら燃費向上)
                    let fuelEff = carData?.fuelConsumption || 10;
                    if (minigameScore && minigameScore > 80) fuelEff *= 1.2; // 20% better fuel economy

                    const fuelConsumed = Math.ceil(distance / fuelEff);
                    user.carFuel = Math.max(0, (user.carFuel || 100) - fuelConsumed);

                    // ガソリン代 (1L 170円換算)
                    cost += fuelConsumed * 170;
                }

                if (cost > 0) {
                    if (user.balance < cost && method !== 'car') {
                        // 金欠で乗れない -> 徒歩になる
                        result.success = false;
                        result.message = 'お金がなくて交通機関を使えませんでした... 徒歩で向かいます。';
                        result.late = true;
                        result.stressChange = 20;
                        return state;
                    }
                    user.balance -= cost;
                    result.cost = cost;
                }

                // ミニゲームボーナス (運転ボーナス)
                if (typeof minigameScore === 'number') {
                    if (minigameScore === 100) {
                        const bonus = 500;
                        user.balance += bonus;
                        result.minigameBonus = bonus;
                        user.transactions.push({
                            id: crypto.randomUUID(), type: 'income', amount: bonus, senderId: user.id, description: '安全運転ボーナス', timestamp: Date.now()
                        });
                    }
                }

                // 2. イベント判定
                // 該当する移動手段のイベントをフィルタ
                const possibleEvents = COMMUTE_EVENTS.filter(e => e.methods.includes(method));

                // 抽選
                for (const evt of possibleEvents) {
                    // ミニゲームで高スコアなら事故回避
                    if (minigameScore && minigameScore > 50 && (evt.type === 'accident' || evt.type === 'delay')) {
                        continue;
                    }

                    if (Math.random() * 100 < evt.probability) {
                        // イベント発生！
                        result.event = evt;
                        result.message = evt.description;

                        // 効果適用
                        if (evt.effects.late) {
                            // ミニゲーム高スコアなら遅刻回避のチャンスあり？
                            // まあ今回は事故回避だけで十分メリット
                            result.late = true;
                            user.isLate = true;
                        }
                        if (evt.effects.stress) {
                            // user.stress += evt.effects.stress; // stressフィールドないのでhappinessを減らす
                            user.happiness = Math.max(0, (user.happiness || 50) - evt.effects.stress);
                            result.stressChange = evt.effects.stress;
                        }
                        if (evt.effects.cost) {
                            user.balance -= evt.effects.cost;
                            result.cost += evt.effects.cost;

                            // 履歴
                            user.transactions.push({
                                id: crypto.randomUUID(),
                                type: 'payment',
                                amount: evt.effects.cost,
                                senderId: user.id,
                                description: `通勤トラブル: ${evt.type}`,
                                timestamp: Date.now()
                            });
                        }
                        if (evt.effects.health) {
                            user.health = Math.max(0, (user.health || 100) + evt.effects.health);
                        }

                        break; // 1回につき1イベントまで
                    }
                }

                // 3. 履歴保存
                user.lastCommuteTurn = state.turn;
                if (result.cost > 0) {
                    user.transactions.push({
                        id: crypto.randomUUID(),
                        type: 'payment',
                        amount: result.cost,
                        senderId: user.id,
                        description: `通勤費 (${method})`,
                        timestamp: Date.now()
                    });
                }

                return state;
            });

            return NextResponse.json(result);
        }

        if (type === 'update_shop_menu') {
            // details = JSON string of ShopItem[]
            const items = safeParseDetails(details);
            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    user.shopMenu = items;
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        // ガチャを回す
        if (type === 'play_gacha') {
            const { GACHA_ITEMS } = await import('@/lib/gameData');
            let resultItems: any[] = [];

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                const { count } = details ? safeParseDetails(details) : { count: 1 };
                const cost = count * 300; // 1回300円 hardcoded for now

                if (user && user.balance >= cost) {
                    user.balance -= cost;

                    for (let i = 0; i < count; i++) {
                        const rand = Math.random() * 100;
                        let rarity = 'common';
                        if (rand < 5) rarity = 'legendary';
                        else if (rand < 20) rarity = 'epic';
                        else if (rand < 50) rarity = 'rare';

                        const pool = GACHA_ITEMS.filter(item => item.rarity === rarity);
                        // Fallback to common if pool is empty (shouldn't happen)
                        const targetPool = pool.length > 0 ? pool : GACHA_ITEMS.filter(item => item.rarity === 'common');

                        const item = targetPool[Math.floor(Math.random() * targetPool.length)];

                        // Add to user collection
                        if (!user.gachaCollection) user.gachaCollection = [];
                        user.gachaCollection.push(item.id);

                        // Also add to inventory logic if needed, but for now just collection ID
                        // For display, we push full item to result
                        resultItems.push(item);
                    }

                    // Add history
                    if (!user.transactions) user.transactions = [];
                    user.transactions.push({
                        id: crypto.randomUUID(),
                        type: 'payment',
                        amount: cost,
                        senderId: user.id,
                        description: `ガチャ (${count}回)`,
                        timestamp: Date.now()
                    });
                }
                return state;
            });

            if (resultItems.length > 0) {
                return NextResponse.json({ success: true, items: resultItems });
            } else {
                return NextResponse.json({ success: false, error: '資金不足またはエラー' });
            }
        }

        if (type === 'restock_item') {
            const { itemId, quantity } = safeParseDetails(details);
            await updateGameState((state) => {
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
                'FORBIDDEN': 'forbidden_market',
                'タイムマシン': 'timemachine'
            };

            if (SECRET_CODES[code]) {
                await updateGameState((state) => {
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

        await updateGameState((state) => {
            state.requests.push(newRequest);
            return state;
        });

        // クーポン作成
        if (type === 'create_coupon') {
            const { code, discountPercent, minPurchase, maxUses, expiresAt } = safeParseDetails(details);

            await updateGameState((state) => {
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



        // -----------------------------------------------------
        // 銀行 (Bank) - 融資・返済・差し押さえ
        // -----------------------------------------------------
        if (type === 'request_loan') {
            const { amount, duration } = safeParseDetails(details);
            const loanAmount = Number(amount);

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    // Credit Score Check (Simple mock)
                    const score = user.creditScore || 650;
                    const maxLoan = score * 10000; // e.g. 650 -> 6,500,000

                    if (user.loans && user.loans.some((l: any) => l.status === 'active' || l.status === 'overdue')) {
                        // Already has active loan (Simplify: 1 loan at a time for now)
                        // Or check total
                    }

                    if (loanAmount > maxLoan) {
                        // Should reject or error, but let's just allow request and let admin decide?
                        // Or auto-reject. Let's auto-reject for simplicity.
                        // Actually, let's create a pending loan request.
                    }

                    if (!user.loans) user.loans = [];
                    user.loans.push({
                        id: crypto.randomUUID(),
                        name: '融資申請',
                        amount: loanAmount,
                        remainingAmount: loanAmount,
                        interestRate: 0.05, // 5% fixed
                        dueDate: Date.now() + (duration * 24 * 60 * 60 * 1000), // days to ms
                        isFixedRate: true,
                        monthlyPayment: 0,
                        nextPaymentTurn: 0,
                        status: 'pending',
                        borrowedAt: Date.now()
                    });
                }
                return state;
            });
            return NextResponse.json({ success: true, message: '融資申請を行いました。バンカーの承認をお待ちください。' });
        }

        if (type === 'repay_loan') {
            const { loanId, amount } = safeParseDetails(details);
            const repayAmount = Number(amount);

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user && user.loans) {
                    const loan = user.loans.find((l: any) => l.id === loanId);
                    if (loan && loan.status === 'active') {
                        if (user.balance >= repayAmount) {
                            user.balance -= repayAmount;
                            loan.amount -= repayAmount; // Reduce principal (simplified)

                            if (loan.amount <= 0) {
                                loan.amount = 0;
                                loan.status = 'paid_off';
                                // Boost Credit Score
                                user.creditScore = Math.min(850, (user.creditScore || 650) + 10);
                            }

                            if (!user.transactions) user.transactions = [];
                            user.transactions.push({
                                id: crypto.randomUUID(), type: 'payment', amount: repayAmount,
                                senderId: user.id, description: `ローン返済`, timestamp: Date.now()
                            });
                        }
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true, message: '返済を受け付けました' });
        }

        if (type === 'admin_seize_asset') {
            const { targetUserId, amount, reason } = safeParseDetails(details);
            const seizeAmount = Number(amount);

            await updateGameState((state) => {
                // Ensure requester is banker (client side check usually, but good to check role here if we had session)
                const target = state.users.find(u => u.id === targetUserId);
                if (target) {
                    // Seize from deposit first, then balance
                    let remaining = seizeAmount;

                    if (target.deposit > 0) {
                        const take = Math.min(target.deposit, remaining);
                        target.deposit -= take;
                        remaining -= take;
                    }

                    if (remaining > 0 && target.balance > 0) {
                        const take = Math.min(target.balance, remaining);
                        target.balance -= take;
                        remaining -= take;
                    }

                    // Log seizure
                    if (!target.transactions) target.transactions = [];
                    target.transactions.push({
                        id: crypto.randomUUID(), type: 'payment', amount: seizeAmount - remaining,
                        senderId: target.id, description: `【強制徴収】${reason}`, timestamp: Date.now()
                    });

                    // Penalty to credit score
                    target.creditScore = Math.max(300, (target.creditScore || 650) - 50);
                }
                return state;
            });
            return NextResponse.json({ success: true, message: '資産を差し押さえました' });
        }

        // -----------------------------------------------------
        // 資格試験合格 (pass_exam) (NEW)
        // -----------------------------------------------------
        if (type === 'pass_exam') {
            const { qualificationId } = safeParseDetails(details);
            const { QUALIFICATIONS } = require('@/lib/gameData');

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                const qual = QUALIFICATIONS.find((q: any) => q.id === qualificationId);

                if (user && qual) {
                    if (!user.qualifications) user.qualifications = [];
                    if (!user.qualifications.includes(qualificationId)) {
                        user.qualifications.push(qualificationId);

                        // Deduct fee if not already handled by client side logic check
                        // (Assuming client does check, but server enforces cost if we wanted strict logic)
                        // Here we just mark passed for simplicity as mock exam client handles flow

                        // Transaction for passed exam
                        if (!user.transactions) user.transactions = [];
                        user.transactions.push({
                            id: crypto.randomUUID(),
                            type: 'payment',
                            amount: 0, // Fee paid before? Or here? Let's assume paid here for safety
                            senderId: user.id,
                            description: `資格取得: ${qual.name}`,
                            timestamp: Date.now()
                        });

                        // If we want to charge here:
                        if (user.balance >= qual.examFee) {
                            user.balance -= qual.examFee;
                            user.transactions[user.transactions.length - 1].amount = qual.examFee;
                            user.transactions[user.transactions.length - 1].description = `受験料: ${qual.name} (合格)`;
                        }
                    }
                }
                return state;
            });

            return NextResponse.json({ success: true, message: '試験に合格しました！資格を取得しました。' });
        }

        // カタログから仕入れ
        if (type === 'restock_from_catalog') {
            const { catalogType, itemId, cost, price, stock } = safeParseDetails(details);
            let earnedPoints = 0;

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (!user) return state;


                const totalCost = cost * stock;
                if (user.balance < totalCost) return state;

                // 転売チェック (Phase 6)
                const checkResult = checkResalePrice(cost, price);
                if (checkResult !== 'ok') {
                    const message = `転売疑惑: ${stock}個を仕入れ値${cost}円に対して${price}円で販売設定 (倍率: ${(price / cost).toFixed(1)}倍)`;
                    // 警告or重大ログ
                    logAudit(user, 'resale_attempt', JSON.stringify({ itemId, cost, price, stock }), checkResult);
                }

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
                        sellerId: user.id,
                        name: catalogItem.name,
                        emoji: catalogItem.emoji,
                        cost,
                        price,
                        stock,
                        category: catalogType as any,
                        isSold: false,
                        createdAt: Date.now()
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
            const { itemId, pointsCost, itemType, itemData } = safeParseDetails(details);

            await updateGameState((state) => {
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
                        sellerId: user.id,
                        name: itemData.name,
                        emoji: itemData.emoji,
                        cost: 0,
                        price: itemData.price || 1000,
                        stock: 1,
                        category: 'furniture',
                        isSale: false,
                        isSold: false,
                        createdAt: Date.now()
                    });
                } else if (itemType === 'gacha_ticket') {
                    // チケット機能はまだないので、とりあえずgachaCollectionに追加するか、
                    // あるいは所持金に換金するか...ここは一旦「レアアイテム」としてshopMenuに追加
                    if (!user.shopMenu) user.shopMenu = [];
                    user.shopMenu.push({
                        id: itemId,
                        sellerId: user.id,
                        name: itemData.name,
                        emoji: itemData.emoji,
                        cost: 0,
                        price: 0, // 売れない？
                        stock: 1,
                        category: 'other',
                        description: '持っているといいことがあるかも？',
                        isSold: false,
                        createdAt: Date.now()
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
            const { sellerId, cartItems, couponCode } = safeParseDetails(details);

            let totalCost = 0;
            let discount = 0;

            await updateGameState((state) => {
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

        // ==========================================
        // Shop Website Actions (NEW)
        // ==========================================

        if (type === 'create_website') {
            const parsed = safeParseDetails(details);
            const templateId = parsed.templateId || 'simple';
            const shopName = parsed.shopName || '';
            const description = parsed.description || '';
            const colors = parsed.colors || { primary: '#3b82f6', secondary: '#10b981' };

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (!user) return state;

                // Create Website
                user.shopWebsite = {
                    id: crypto.randomUUID(),
                    ownerId: user.id,
                    templateId,
                    customization: {
                        primaryColor: colors.primary || '#3b82f6',
                        secondaryColor: colors.secondary || '#10b981',
                        shopDescription: description,
                        welcomeMessage: `Welcome to ${shopName}!`,
                        showProducts: true,
                        showCoupons: true,
                        layout: 'grid'
                    },
                    isPublished: true,
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };

                // Update Shop Name
                user.shopName = shopName;

                return state;
            });

            return NextResponse.json({ success: true, message: 'ホームページを作成しました！' });
        }

        if (type === 'city_build_place') {
            const { landId, name, type: placeType } = safeParseDetails(details);

            if (!landId || !name || !placeType) {
                return NextResponse.json({ error: 'Missing build details' }, { status: 400 });
            }

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                const land = state.lands.find(l => l.id === landId);

                if (user && land) {
                    // バリデーション
                    if (land.ownerId !== user.id) return state; // 自分の土地でない
                    if (land.placeId) return state; // 既に建物がある

                    const COST_MAP: Record<string, number> = {
                        'restaurant': 5000000,
                        'retail': 4000000,
                        'office': 8000000,
                        'service': 3000000,
                        'factory': 10000000
                    };
                    const cost = COST_MAP[placeType] || 5000000;

                    if (user.balance < cost) return state;

                    // 支払い
                    user.balance -= cost;

                    // Place生成
                    const newPlaceId = crypto.randomUUID();
                    const newPlace: any = { // Place型に合わせて詳細化が必要だが一旦anyで回避
                        id: newPlaceId,
                        ownerId: user.id,
                        name,
                        type: placeType,
                        location: {
                            lat: land.location.lat,
                            lng: land.location.lng,
                            address: land.address,
                            landId: land.id
                        },
                        status: 'construction', // 最初は建設中
                        level: 1,
                        employees: [],
                        stats: {
                            capital: cost, // 初期資本＝建設費とする
                            sales: 0,
                            expenses: 0,
                            profit: 0,
                            reputation: 3,
                            customerCount: 0
                        },
                        licenses: [],
                        insurances: []
                    };

                    // データ更新
                    if (!state.places) state.places = [];
                    state.places.push(newPlace);

                    land.placeId = newPlaceId;

                    if (!user.ownedPlaces) user.ownedPlaces = [];
                    user.ownedPlaces.push(newPlaceId);

                    // 履歴追加
                    if (!user.transactions) user.transactions = [];
                    user.transactions.push({
                        id: crypto.randomUUID(),
                        type: 'payment',
                        amount: cost,
                        senderId: user.id,
                        description: `施設建設 (${name})`,
                        timestamp: Date.now()
                    });

                    logAudit(user, 'high_value_transaction', `施設建設: ${name} (${cost}円)`, 'info');
                }
                return state;
            });
            return NextResponse.json({ success: true, message: '建設を開始しました' });
        }

        // =====================================================
        // PHASE 4: 銀行・シミュレーション
        // =====================================================

        // -----------------------------------------------------
        // 融資申し込み (bank_loan_apply)
        // -----------------------------------------------------
        if (type === 'bank_loan_apply') {
            const { amount, purpose, months } = safeParseDetails(details);
            const loanAmount = Number(amount);

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                const { calculateCreditScore } = require('@/lib/simulation'); // Dynamic import to avoid circular dependency if any

                if (user) {
                    // 信用スコア更新
                    user.creditScore = calculateCreditScore(user);
                    const score = user.creditScore || 500;

                    // 審査ロジック
                    const maxLoan = score * 10000; // 500点 -> 500万, 800点 -> 800万
                    let interestRate = state.economy.interestRate + (1000 - score) / 100; // ベース金利 + リスクプレミアム

                    // 不正スコアによるペナルティ
                    if (user.suspicionScore && user.suspicionScore > 0) {
                        interestRate += user.suspicionScore * 0.1; // 金利上乗せ
                        if (user.suspicionScore > 50 && Math.random() < 0.8) {
                            // 疑惑が高いと高確率で審査落ち
                            return state;
                        }
                    }

                    if (loanAmount > maxLoan) {
                        return state; // 審査落ち (Reject response handled by returning unchanged state logic limitation? Need better error handling but ok for now)
                    }

                    // 監査ログ (高額融資の場合)
                    if (loanAmount >= 10000000) {
                        logAudit(user, 'high_value_transaction', `高額融資実行: ${loanAmount}円`, 'info');
                    }

                    // 融資実行
                    user.balance += loanAmount;

                    if (!user.loans) user.loans = [];
                    const totalInterest = loanAmount * (interestRate / 100) * (months / 12); // Simple interest for now
                    const totalRepay = loanAmount + totalInterest;

                    user.loans.push({
                        id: crypto.randomUUID(),
                        name: purpose || '一般融資',
                        amount: loanAmount,
                        remainingAmount: totalRepay,
                        interestRate: interestRate,
                        isFixedRate: true,
                        monthlyPayment: Math.ceil(totalRepay / months),
                        nextPaymentTurn: state.turn + 1,
                        status: 'active',
                        borrowedAt: Date.now()
                    });

                    user.transactions.push({
                        id: crypto.randomUUID(), type: 'income', amount: loanAmount, senderId: 'BANK', description: `融資実行: ${purpose}`, timestamp: Date.now()
                    });

                    // --- Phase 8: Record Idempotency ---
                    if (idempotencyKey) state.processedIdempotencyKeys.push(idempotencyKey);

                    // --- Phase 8: Global Notification ---
                    eventToBroadcast = {
                        type: 'ADMIN_MESSAGE',
                        payload: {
                            message: `🏦 ${user.name}様に ${loanAmount.toLocaleString()}円 の融資が実行されました。`,
                            severity: 'info'
                        },
                        timestamp: Date.now(),
                        revision: 0
                    };
                }
                return state;
            });

            if (eventToBroadcast) {
                eventManager.broadcast(eventToBroadcast);
                eventManager.broadcast({ type: 'STATE_SYNC', payload: { type: 'loan_approved' }, timestamp: Date.now(), revision: 0 });
            }

            return NextResponse.json({ success: true, message: '融資審査が完了しました' });
        }

        // -----------------------------------------------------
        // 任意返済 (bank_repay)
        // -----------------------------------------------------
        if (type === 'bank_repay') {
            const { loanId, repaymentAmount } = safeParseDetails(details);
            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user && user.loans) {
                    const loan = user.loans.find(l => l.id === loanId);
                    if (loan && loan.status === 'active') {
                        const pay = Math.min(Number(repaymentAmount), loan.remainingAmount, user.balance);
                        if (pay > 0) {
                            user.balance -= pay;
                            loan.remainingAmount -= pay;
                            if (loan.remainingAmount <= 0) {
                                loan.remainingAmount = 0;
                                loan.status = 'paid_off';
                                if (!user.creditScore) user.creditScore = 500;
                                user.creditScore += 20; // Bonus
                            }

                            user.transactions.push({
                                id: crypto.randomUUID(), type: 'repay', amount: pay, senderId: user.id, description: `繰り上げ返済: ${loan.name}`, timestamp: Date.now()
                            });

                            // --- Phase 8: Record Idempotency ---
                            if (idempotencyKey) state.processedIdempotencyKeys.push(idempotencyKey);
                        }
                    }
                }
                return state;
            });

            // --- Phase 8: Event Broadcast ---
            eventManager.broadcast({
                type: 'STATE_SYNC',
                payload: { type: 'loan_repaid', requesterId },
                timestamp: Date.now(),
                revision: 0
            });

            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // 銀行振込 (bank_transfer)
        // -----------------------------------------------------
        if (type === 'bank_transfer') {
            const { targetId, transferAmount } = safeParseDetails(details);
            const val = Number(transferAmount);

            await updateGameState((state) => {
                const sender = state.users.find(u => u.id === requesterId);
                const receiver = state.users.find(u => u.id === targetId);

                if (sender && receiver && sender.balance >= val) {
                    sender.balance -= val;
                    receiver.balance += val; // Direct to balance? or Deposit? Let's say balance for simplicity

                    sender.transactions.push({
                        id: crypto.randomUUID(), type: 'transfer', amount: val, senderId: sender.id, receiverId: receiver.id, description: `振込送信 -> ${receiver.name}`, timestamp: Date.now()
                    });
                    receiver.transactions.push({
                        id: crypto.randomUUID(), type: 'income', amount: val, senderId: sender.id, receiverId: receiver.id, description: `振込受信 <- ${sender.name}`, timestamp: Date.now()
                    });
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // 保険加入 (insurance_buy)
        // -----------------------------------------------------
        if (type === 'insurance_buy') {
            const { insuranceType } = safeParseDetails(details);
            // hardcoded definitions for now
            const INSURANCE_PLANS = {
                'fire': { name: '火災保険', premium: 5000, coverage: 10000000 },
                'health': { name: '医療保険', premium: 3000, coverage: 500000 },
                'worker_comp': { name: '労災保険', premium: 1000, coverage: 2000000 }
            };
            const plan = INSURANCE_PLANS[insuranceType as keyof typeof INSURANCE_PLANS];

            if (plan) {
                await updateGameState((state) => {
                    const user = state.users.find(u => u.id === requesterId);
                    if (user) {
                        if (!user.insurances) user.insurances = [];
                        if (user.insurances.some(i => i.type === insuranceType && (!i.expiresAt || i.expiresAt > Date.now()))) {
                            return state; // Already joined
                        }

                        // Initial payment? Or just sign contract? Let's take first premium
                        if (user.balance >= plan.premium) {
                            user.balance -= plan.premium;
                            user.insurances.push({
                                id: crypto.randomUUID(),
                                type: insuranceType as any,
                                name: plan.name,
                                premium: plan.premium,
                                coverageAmount: plan.coverage,
                                joinedAt: Date.now(),
                                expiresAt: null // ongoing
                            });
                            user.transactions.push({
                                id: crypto.randomUUID(), type: 'payment', amount: plan.premium, senderId: user.id, description: `保険加入: ${plan.name}`, timestamp: Date.now()
                            });

                            if (insuranceType === 'health') {
                                user.isInsured = true; // Legacy flag sync
                            }
                        }
                    }
                    return state;
                });
                return NextResponse.json({ success: true });
            }
            return NextResponse.json({ success: false, message: 'Invalid plan' });
        }

        // -----------------------------------------------------
        // 店舗別ポイント交換アイテム設定 (update_point_exchange_items)
        // -----------------------------------------------------
        if (type === 'update_point_exchange_items') {
            const { items } = safeParseDetails(details);
            // items: PointExchangeItem[]

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    user.pointExchangeItems = items;
                }
                return state;
            });
            return NextResponse.json({ success: true, message: '交換アイテムを更新しました' });
        }

        // -----------------------------------------------------
        // 店舗別ポイント交換実行 (exchange_shop_item)
        // -----------------------------------------------------
        if (type === 'exchange_shop_item') {
            const { shopOwnerId, itemId } = safeParseDetails(details);

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                const shopOwner = state.users.find(u => u.id === shopOwnerId);

                if (!user || !shopOwner) return state;

                // 対象のポイントカードを探す
                const card = user.pointCards?.find(c => c.shopOwnerId === shopOwnerId);
                if (!card) return state; // ポイントカードを持っていない

                // 交換アイテムを探す
                const item = shopOwner.pointExchangeItems?.find(i => i.id === itemId);
                if (!item) return state; // アイテムが存在しない

                // コストチェック
                if (card.points < item.pointCost) return state;

                // 在庫チェック (在庫管理する場合)
                if (item.stock !== undefined && item.stock <= 0) return state;

                // ポイント消費
                card.points -= item.pointCost;

                // 在庫減少
                if (item.stock !== undefined) {
                    item.stock -= 1;
                    item.exchangedCount = (item.exchangedCount || 0) + 1;
                }

                // ユーザーにアイテム付与
                // NOTE: ここでは簡略化のため inventory に追加するロジックにするが、
                // 実際には category に応じて furniture, pets, recipes など適切な場所に追加すべき
                // 今回は inventory に統一、または category別処理を入れる

                // とりあえずインベントリへ
                if (!user.inventory) user.inventory = [];
                // 既存アイテムがあればスタック、なければ新規
                // itemId は UUID なのでユニーク前提だが、同じアイテムIDの場合はスタック
                const existingInv = user.inventory.find(inv => inv.itemId === item.id); // item.id is unique exchange item id

                // 交換アイテムのIDは交換所内でのIDなので、実体アイテムとしてのIDが必要かもしれない
                // ここでは「交換アイテムそのもの」をインベントリに入れる（名前と説明をコピー）
                if (existingInv) {
                    existingInv.quantity += 1;
                } else {
                    user.inventory.push({
                        id: crypto.randomUUID(),
                        itemId: item.id, // source id
                        name: item.name,
                        quantity: 1,
                        // type: item.category // need to extend InventoryItem type if strictly typed
                    });
                }

                // 履歴
                if (!user.transactions) user.transactions = [];
                user.transactions.push({
                    id: crypto.randomUUID(),
                    type: 'payment',
                    amount: 0,
                    description: `ポイント交換: ${item.name} (${shopOwner.shopName || shopOwner.name}) -${item.pointCost}pt`,
                    timestamp: Date.now()
                });

                // オーナー側にも通知履歴入れる？ (任意)

                return state;
            });

            return NextResponse.json({ success: true, message: '交換が完了しました' });
        }

        // -----------------------------------------------------
        // SNS (post_sns, like_sns)
        // -----------------------------------------------------
        if (type === 'post_sns') {
            const { content } = safeParseDetails(details);
            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    if (!state.snsPosts) state.snsPosts = [];
                    state.snsPosts.unshift({
                        id: crypto.randomUUID(),
                        authorId: user.id,
                        authorName: user.name,
                        content: (content || '').slice(0, 280), // Limit length
                        likes: 0,
                        likedBy: [],
                        timestamp: Date.now()
                    });
                }
                return state;
            });
            return NextResponse.json({ success: true, message: '投稿しました' });
        }

        if (type === 'like_sns') {
            const { postId } = safeParseDetails(details);
            await updateGameState((state) => {
                const post = state.snsPosts?.find(p => p.id === postId);
                if (post) {
                    if (post.likedBy.includes(requesterId)) {
                        // Unlike
                        post.likedBy = post.likedBy.filter(id => id !== requesterId);
                        post.likes--;
                    } else {
                        // Like
                        post.likedBy.push(requesterId);
                        post.likes++;
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        // -----------------------------------------------------
        // Video App (upload_video, watch_video)
        // -----------------------------------------------------
        if (type === 'upload_video') {
            const { title, description, tags, url, color } = safeParseDetails(details);
            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    if (!state.videos) state.videos = [];
                    state.videos.unshift({
                        id: crypto.randomUUID(),
                        uploaderId: user.id,
                        uploaderName: user.name,
                        title: (title || '').slice(0, 50),
                        description: description || '',
                        tags: tags || [],
                        url: url || '', // Store the file path
                        thumbnailColor: color || '#ff0000',
                        views: 0,
                        likes: 0,
                        timestamp: Date.now()
                    });
                }
                return state;
            });
            return NextResponse.json({ success: true, message: '動画をアップロードしました' });
        }

        // -----------------------------------------------------
        // ターン経過処理 (next_turn)
        // -----------------------------------------------------
        if (type === 'next_turn') {
            const { simulateTurn } = require('@/lib/simulation');
            const { EVENT_TEMPLATES, PLAYER_EVENT_TEMPLATES, EVENT_SPAWN_RATES } = require('@/lib/eventData');

            await updateGameState((state) => {
                // 1. Increment Turn
                state.turn += 1;

                // 2. Run Simulation
                const newState = simulateTurn(state);

                if (!newState.activeEvents) newState.activeEvents = [];
                if (!newState.news) newState.news = [];

                if (Math.random() < EVENT_SPAWN_RATES.global) {
                    const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
                    const isDuplicate = newState.activeEvents.some((e) => e.type === template.type && !e.targetUserId);
                    if (!isDuplicate) {
                        newState.activeEvents.push({
                            ...template,
                            id: crypto.randomUUID(),
                            startTime: Date.now()
                        });
                        newState.news.unshift({
                            id: crypto.randomUUID(),
                            type: 'global_event',
                            message: `📢 グローバルイベント: ${template.name}`,
                            timestamp: Date.now()
                        });
                    }
                }

                newState.users
                    .filter((u) => u.role === 'player')
                    .forEach((user) => {
                        if (Math.random() >= EVENT_SPAWN_RATES.player) return;
                        const template = PLAYER_EVENT_TEMPLATES[Math.floor(Math.random() * PLAYER_EVENT_TEMPLATES.length)];
                        const existsForUser = newState.activeEvents.some(
                            (e) => e.type === template.type && e.targetUserId === user.id
                        );
                        if (existsForUser) return;
                        newState.activeEvents.push({
                            ...template,
                            id: crypto.randomUUID(),
                            startTime: Date.now(),
                            targetUserId: user.id
                        });
                        newState.news.unshift({
                            id: crypto.randomUUID(),
                            type: 'player_event',
                            message: `🎯 ${user.name}にイベント: ${template.name}`,
                            timestamp: Date.now()
                        });
                    });

                // 3. Reset Timer (if needed by client logic, or client calls timer_reset separately)
                // Let's reset interval helpers
                newState.timeRemaining = newState.settings.turnDuration;
                newState.lastTick = Date.now();

                return newState;
            });
            return NextResponse.json({ success: true, message: '新しいターンが始まりました' });
        }

        // -----------------------------------------------------
        // カタログアイテム購入 (buy_catalog_item)
        // -----------------------------------------------------
        if (type === 'buy_catalog_item') {
            const catalogItemId = details;

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                const catalogItem = state.catalogInventory?.find(c => c.id === catalogItemId);

                if (!user || !catalogItem) return state;

                const cost = catalogItem.wholesalePrice || catalogItem.price;
                if (user.balance < cost) {
                    throw new Error('残高不足');
                }

                // Deduct balance
                user.balance -= cost;

                // Add to myRoomItems
                if (!user.myRoomItems) user.myRoomItems = [];
                user.myRoomItems.push({
                    id: crypto.randomUUID(),
                    catalogItemId: catalogItem.id,
                    purchasedAt: Date.now(),
                    isPlaced: false
                });

                // Add to shopMenu (Auto-sell)
                if (!user.shopMenu) user.shopMenu = [];
                user.shopMenu.push({
                    id: crypto.randomUUID(),
                    sellerId: user.id,
                    name: catalogItem.name,
                    price: catalogItem.price, // 定価で自動出品
                    cost: catalogItem.wholesalePrice || catalogItem.price,
                    stock: 1, // Initial stock
                    description: catalogItem.description,
                    emoji: catalogItem.emoji,
                    imageUrl: catalogItem.imageUrl,
                    category: catalogItem.category,
                    isSold: false,
                    createdAt: Date.now(),
                    condition: 'new'
                });

                // Decrease catalog stock if applicable
                if (catalogItem.stock !== undefined && catalogItem.stock > 0) {
                    catalogItem.stock--;
                }

                return state;
            });

            return NextResponse.json({ success: true, message: 'アイテムを購入しました' });
        }

        // -----------------------------------------------------
        // マイルームアイテム配置 (place_item_in_room)
        // -----------------------------------------------------
        if (type === 'place_item_in_room') {
            const ownedItemId = details;

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (!user || !user.myRoomItems) return state;

                const item = user.myRoomItems.find(i => i.id === ownedItemId);
                if (item) {
                    item.isPlaced = true;
                }

                return state;
            });

            return NextResponse.json({ success: true, message: 'アイテムを配置しました' });
        }

        // -----------------------------------------------------
        // レビュー投稿 (submit_review)
        // -----------------------------------------------------
        if (type === 'submit_review') {
            const { purchaseId, rating, comment } = safeParseDetails(details);

            await updateGameState((state) => {
                const reviewer = state.users.find(u => u.id === requesterId);
                if (!reviewer) return state;

                // Find receipt
                const receipt = reviewer.receipts?.find(r => r.id === purchaseId);
                if (!receipt || receipt.hasReview) return state;

                const shopOwner = state.users.find(u => u.id === receipt.shopOwnerId);
                if (!shopOwner) return state;

                // Create review
                const review = {
                    id: crypto.randomUUID(),
                    shopOwnerId: receipt.shopOwnerId,
                    reviewerId: requesterId,
                    reviewerName: reviewer.name,
                    rating: Number(rating) as 1 | 2 | 3 | 4 | 5,
                    comment,
                    purchaseId,
                    timestamp: Date.now()
                };

                // Add to reviewer's reviews
                if (!reviewer.reviews) reviewer.reviews = [];
                reviewer.reviews.push(review);

                // Add to shop owner's received reviews
                if (!shopOwner.receivedReviews) shopOwner.receivedReviews = [];
                shopOwner.receivedReviews.push(review);

                // Mark receipt as reviewed
                receipt.hasReview = true;

                // Update shop owner's popularity based on average rating
                const avgRating = shopOwner.receivedReviews.reduce((sum, r) => sum + r.rating, 0) / shopOwner.receivedReviews.length;
                const basePopularity = shopOwner.popularity || 0;
                shopOwner.popularity = Math.max(0, Math.floor(basePopularity + (avgRating - 3) * 10));

                return state;
            });

            return NextResponse.json({ success: true, message: 'レビューを投稿しました' });
        }

        // -----------------------------------------------------
        // forbidden_market / stock_trade
        // -----------------------------------------------------

        if (type === 'buy_stock') {
            const stockId = details;
            const quantity = Number(amount);

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                const stock = state.stocks.find(s => s.id === stockId);

                if (user && stock) {
                    const cost = stock.price * quantity;
                    if (user.balance >= cost) {
                        user.balance -= cost;

                        // Add to appropriate portfolio
                        if (stock.isForbidden) {
                            if (!user.forbiddenStocks) user.forbiddenStocks = {};
                            user.forbiddenStocks[stockId] = (user.forbiddenStocks[stockId] || 0) + quantity;
                        } else {
                            if (!user.stocks) user.stocks = {};
                            user.stocks[stockId] = (user.stocks[stockId] || 0) + quantity;
                        }

                        // Transaction
                        if (!user.transactions) user.transactions = [];
                        user.transactions.push({
                            id: crypto.randomUUID(),
                            type: 'buy_stock',
                            amount: cost,
                            senderId: user.id,
                            description: `株購入: ${stock.name} x${quantity}`,
                            timestamp: Date.now()
                        });
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true, message: '株を購入しました' });
        }

        if (type === 'sell_stock') {
            const stockId = details;
            const quantity = Number(amount);

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                const stock = state.stocks.find(s => s.id === stockId);

                if (user && stock) {
                    // Check ownership
                    let currentOwned = 0;
                    if (stock.isForbidden) {
                        currentOwned = user.forbiddenStocks?.[stockId] || 0;
                    } else {
                        currentOwned = user.stocks?.[stockId] || 0;
                    }

                    if (currentOwned >= quantity) {
                        // Remove from portfolio
                        if (stock.isForbidden) {
                            user.forbiddenStocks![stockId] -= quantity;
                        } else {
                            user.stocks![stockId] -= quantity;
                        }

                        const gain = stock.price * quantity;
                        user.balance += gain;

                        // Transaction
                        if (!user.transactions) user.transactions = [];
                        user.transactions.push({
                            id: crypto.randomUUID(),
                            type: 'sell_stock',
                            amount: gain,
                            senderId: user.id,
                            description: `株売却: ${stock.name} x${quantity}`,
                            timestamp: Date.now()
                        });
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true, message: '株を売却しました' });
        }

        if (type === 'buy_forbidden_item') {
            const { itemId } = safeParseDetails(details);

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (!user) return state;

                // Simple check for now, ideally fetch item price from backend config
                const price = Number(amount);

                if (user.balance >= price) {
                    user.balance -= price;

                    if (!user.inventory) user.inventory = [];
                    // Check if already has unique items? Or stack them?
                    // Let's stack or add new instance.
                    user.inventory.push({
                        id: crypto.randomUUID(),
                        itemId: itemId,
                        quantity: 1,
                        name: itemId === 'fake_id' ? '偽造ID' : (itemId === 'hacking_tool' ? 'ハッキングツール' : 'ウイルスUSB'),
                    });

                    // Log (Secret?)
                    if (!user.transactions) user.transactions = []; // Avoid details in legit history?
                    // Or use a cryptic name
                    user.transactions.push({
                        id: crypto.randomUUID(),
                        type: 'payment',
                        amount: price,
                        senderId: user.id,
                        description: 'SYSTEM_PAYMENT_ERR_404',
                        timestamp: Date.now()
                    });
                }
                return state;
            });
            return NextResponse.json({ success: true, message: '取引完了' });
        }

        if (type === 'complete_job') {
            const { score, job } = safeParseDetails(details);
            let reward = 0;
            let message = '';

            await updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                const jobConfig = JOB_GAME_CONFIGS[job as JobType];

                if (user && jobConfig) {
                    // Global Multiplier
                    const moneyMultiplier = state.settings?.moneyMultiplier || 1;

                    // Base Reward Calculation
                    // Formula: Score * Job Multiplier * Global Multiplier
                    const baseReward = Math.floor(Number(score) * (jobConfig.rewardMultiplier || 1));
                    reward = Math.floor(baseReward * moneyMultiplier);

                    if (reward > 0) {
                        user.balance += reward;

                        // Transaction History
                        if (!user.transactions) user.transactions = [];
                        user.transactions.push({
                            id: crypto.randomUUID(),
                            type: 'income',
                            amount: reward,
                            senderId: 'JOB',
                            description: `仕事報酬: ${jobConfig.name} (Score: ${score})`,
                            timestamp: Date.now()
                        });

                        message = `報酬 ${reward.toLocaleString()}枚 を獲得しました！`;
                    } else {
                        message = '報酬なし... もっと頑張ろう！';
                    }
                }
                return state;
            });

            return NextResponse.json({ success: true, message });
        }

        // 既存の汎用リクエスト保存処理 (他のアクション用)

        if (type === 'submit_review') {
            await updateGameState((state) => {
                const { targetId, rating, comment, reviewerName } = safeParseDetails(details);
                const target = state.users.find(u => u.id === targetId);

                if (target) {
                    if (!target.receivedReviews) target.receivedReviews = [];

                    const newReview = {
                        id: uuidv4(),
                        shopOwnerId: target.id,
                        reviewerId: requesterId,
                        reviewerName: reviewerName || '匿名',
                        rating: Number(rating) as 1 | 2 | 3 | 4 | 5,
                        comment: comment || '',
                        purchaseId: 'visitor_review',
                        timestamp: Date.now()
                    };

                    target.receivedReviews.push(newReview);

                    // Recalculate Average Rating
                    const totalScore = target.receivedReviews.reduce((acc: number, r: any) => acc + r.rating, 0);
                    target.rating = Number((totalScore / target.receivedReviews.length).toFixed(1));

                    // Boost Popularity slightly
                    if (!target.popularity) target.popularity = 0;
                    target.popularity += 1;
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: true, request: newRequest });
    } catch (error) {
        console.error('Action error:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error', details: String(error) }, { status: 500 });
    }
}


export const dynamic = 'force-static';

