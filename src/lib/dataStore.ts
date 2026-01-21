import { prisma } from '@/lib/db';
import { GameState, User, Stock, Crypto, Request, Product, Transaction, Place, Land, NPC, GameEvent, Property, NewsItem, RouletteResult, CatalogItem } from '@/types';
import { generateLands, BASE_LAT, BASE_LNG } from '@/lib/cityData';

// Re-export INITIAL_STATE for reference, though logic uses DB defaults
const INITIAL_STATE_VALUES: GameState = {
    users: [],
    stocks: [
        { id: 's1', name: 'テック・フューチャー', price: 1000, previousPrice: 1000, volatility: 0.1, isForbidden: false },
        { id: 's2', name: 'ハッピー・フーズ', price: 500, previousPrice: 500, volatility: 0.05, isForbidden: false },
        { id: 's3', name: 'ミラクル建設', price: 800, previousPrice: 800, volatility: 0.08, isForbidden: false },
        // Forbidden Stocks
        { id: 'f1', name: 'シャドウ・コーポレーション', price: 5000, previousPrice: 5000, volatility: 0.5, isForbidden: true },
        { id: 'f2', name: 'ブラックバイオ研究所', price: 2000, previousPrice: 2000, volatility: 0.8, isForbidden: true },
        { id: 'f3', name: 'ネオカルト証券', price: 10000, previousPrice: 10000, volatility: 1.0, isForbidden: true },
    ],
    cryptos: [],
    requests: [],
    marketStatus: 'open',
    turn: 1,
    isDay: true,
    isTimerRunning: true,
    lastTick: Date.now(),
    timeRemaining: 5 * 60 * 1000,
    settings: {
        taxRate: 0.1,
        insuranceRate: 100,
        interestRate: 0.05,
        salaryAutoSafeRate: 0.5,
        turnDuration: 5 * 60 * 1000,
        moneyMultiplier: 1.0
    },
    news: [],
    roulette: { // Note: Currently not in DB schema explicitly as object, might need to store in GameSettings or separate
        items: [
            { id: 1, text: '宝くじ 1等 (1000枚)', effect: 'bonus_1000', weight: 1 },
            { id: 2, text: '宝くじ はずれ', effect: 'none', weight: 5 },
            { id: 3, text: '風邪をひいた (治療費 -50)', effect: 'sick_cold', weight: 3 },
            { id: 4, text: '臨時ボーナス (300枚)', effect: 'bonus_300', weight: 2 },
            { id: 5, text: '財布を落とした (-100枚)', effect: 'lost_100', weight: 3 },
            { id: 6, text: '人気者になった (人気+10)', effect: 'pop_up', weight: 2 },
        ],
        currentResult: null
    },
    season: 'spring',
    products: [],
    activeNPCs: [],
    npcTemplates: [
        {
            id: 'guest',
            name: '一般客',
            description: '普通のお客さん。何か買ってくれるかも？',
            duration: 60 * 1000,
            spawnRate: 30, // 30% per check
            actionType: 'buy',
            minPayment: 100,
            maxPayment: 500
        },
        {
            id: 'thief',
            name: '怪しい男',
            description: 'キョロキョロしている...泥棒かもしれない。',
            duration: 3 * 60 * 1000,
            spawnRate: 5,
            actionType: 'steal_money',
            minStealAmount: 1000,
            maxStealAmount: 5000
        },
        {
            id: 'scammer',
            name: '自称投資家',
            description: 'うまい儲け話を持ちかけてくる。',
            duration: 2 * 60 * 1000,
            spawnRate: 5,
            actionType: 'scam',
            minStealAmount: 2000,
            maxStealAmount: 10000
        },
        {
            id: 'rich_guest',
            name: '富豪',
            description: '金払いの良いお客さん。期待大！',
            duration: 60 * 1000,
            spawnRate: 2,
            actionType: 'buy',
            minPayment: 5000,
            maxPayment: 20000
        }
    ],
    activeEvents: [],
    properties: [],
    lands: generateLands(),
    places: [
        {
            id: 'place_dealer',
            ownerId: 'system',
            name: 'カーディーラー・丸の内',
            type: 'retail',
            location: { // In DB: flattened to lat, lng, address, landId
                lat: BASE_LAT,
                lng: BASE_LNG,
                address: '東京都千代田区丸の内 6-6',
                landId: 'tokyo'
            },
            status: 'active',
            level: 3,
            employees: [],
            stats: { capital: 100000000, sales: 0, expenses: 0, profit: 0, reputation: 5, customerCount: 0 },
            licenses: [],
            insurances: []
        },
        // ... (other places omitted for brevity in code, will handle in init)
    ],
    economy: {
        status: 'normal',
        interestRate: 5.0,
        priceIndex: 100,
        marketTrend: 'stable',
        taxRateAdjust: 0,
        lastUpdateTurn: 0
    },
    environment: {
        weather: 'sunny',
        temperature: 20,
        season: 'spring',
        cityInfrastructure: { power: 100, water: 100, network: 100 },
        securityLevel: 100
    },
    eventRevision: 0,
    processedIdempotencyKeys: []
};

// ==========================================
// Utility Functions
// ==========================================

/**
 * オブジェクト内のすべてのBigIntをNumberに変換
 * JSON.stringify() で安全にシリアライズできるようにする
 */
export function convertBigIntToNumber<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'bigint') {
        return Number(obj) as unknown as T;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => convertBigIntToNumber(item)) as unknown as T;
    }

    if (typeof obj === 'object') {
        const converted: any = {};
        for (const key in obj) {
            converted[key] = convertBigIntToNumber(obj[key]);
        }
        return converted;
    }

    return obj;
}

// ==========================================
// Initialization Logic
// ==========================================

async function initializeDatabase() {
    console.log('Initializing Database with Default Data...');

    // Create Default Settings
    await prisma.gameSettings.upsert({
        where: { id: 'singleton' },
        update: {},
        create: {
            id: 'singleton',
            taxRate: 0.1,
            insuranceRate: 100,
            interestRate: 0.05,
            salaryAutoSafeRate: 0.5,
            turnDuration: 5 * 60 * 1000,
            // @ts-ignore
            moneyMultiplier: 1.0,
            lastTick: BigInt(Date.now()),
            timeRemaining: 5 * 60 * 1000,
            envSeason: 'spring',
            // ... defaults from schema are mostly fine
        }
    });

    // Create Initial Stocks
    for (const s of INITIAL_STATE_VALUES.stocks) {
        await prisma.stock.upsert({
            where: { id: s.id },
            update: {},
            create: {
                id: s.id,
                name: s.name,
                price: s.price,
                previousPrice: s.previousPrice,
                volatility: s.volatility,
                isForbidden: s.isForbidden
            }
        });
    }

    // Create Initial System Places (simplified for Phase 1)
    // NOTE: In a full implementation, we'd sync INITIAL_STATE.places to DB.
    // For now assuming empty DB gets initialized.

    console.log('Database Initialized.');
}

// ==========================================
// DB Access Functions
// ==========================================

export async function getGameState(): Promise<GameState> {
    try {
        const settings = await prisma.gameSettings.findUnique({ where: { id: 'singleton' } });

        if (!settings) {
            await initializeDatabase();
            return getGameState();
        }

        const [
            users,
            stocks,
            requests,
            products,
            lands,
            places,
            npcs,
            events, // Clean single declaration
            news,
            cryptos
        ] = await Promise.all([
            prisma.user.findMany({ include: { transactions: true, requests: true } }),
            prisma.stock.findMany(),
            prisma.request.findMany(),
            prisma.product.findMany(),
            prisma.land.findMany(),
            prisma.place.findMany(),
            prisma.nPC.findMany(),
            prisma.gameEvent.findMany(),
            prisma.news.findMany({ orderBy: { createdAt: 'desc' }, take: 50 }),
            prisma.crypto.findMany()
        ]);

        // Map DB types to GameState types (handling JSON fields)
        const mappedUsers = users.map((u: any) => ({
            ...u,
            createdAt: undefined, updatedAt: undefined,
            transactions: u.transactions?.map((t: any) => ({
                ...t,
                timestamp: Number(t.timestamp),
                createdAt: undefined
            })) || [],
            requests: undefined,
            stocks: (u.stocks as any) || {},
            forbiddenStocks: (u.forbiddenStocks as any) || {},
            inventory: (u.inventory as any) || [],
            shopItems: (u.shopItems as any) || [],
            shopMenu: (u.shopMenu as any) || [],
            pointCards: (u.pointCards as any) || [],
            collection: (u.collection as any) || {},
            ownedLands: (u.ownedLands as any) || [],
            ownedPlaces: (u.ownedPlaces as any) || [],
            ownedVehicles: (u.ownedVehicles as any) || [],
            qualifiedPlaces: (u.qualifiedPlaces as any) || [],
            qualifications: (u.qualifications as any) || [],
            cryptoHoldings: (u.cryptoHoldings as any) || {},
            isOff: u.isOff || false,
            vacationReason: u.vacationReason || null,
            isDebugAuthorized: u.isDebugAuthorized || false,
        })) as unknown as User[];

        const mappedPlaces = places.map((p: any) => ({
            ...p,
            location: {
                lat: p.lat,
                lng: p.lng,
                address: p.address,
                landId: p.landId
            },
            stats: (p.stats as any) || {},
            employees: (p.employees as any) || [],
            licenses: (p.licenses as any) || [],
            insurances: (p.insurances as any) || []
        })) as unknown as Place[];

        return {
            users: mappedUsers,
            stocks: stocks as unknown as Stock[],
            cryptos: cryptos.map((c: any) => ({
                ...c,
                priceHistory: (c.priceHistory as any) || [],
                createdAt: Number(c.createdAt || 0),
                updatedAt: Number(c.updatedAt || 0)
            })) as unknown as Crypto[],
            requests: requests.map((r: any) => ({ ...r, timestamp: Number(r.timestamp) })) as unknown as Request[],
            products: products.map((p: any) => ({ ...p, createdAt: Number(p.createdAt), soldAt: p.soldAt ? Number(p.soldAt) : undefined })) as unknown as Product[],
            lands: lands.map((l: any) => ({
                id: l.id,
                ownerId: l.ownerId,
                price: l.price,
                location: { lat: l.lat, lng: l.lng },
                address: l.address,
                isForSale: l.isForSale ?? true, // Default true if missing
                size: l.size,
                zoning: l.zoning,
                status: l.status,
                polygon: l.polygon as any,

                // New Fields
                maintenanceFee: l.maintenanceFee,
                requiresApproval: l.requiresApproval,
                allowConstruction: l.allowConstruction,
                allowCompany: l.allowCompany
            })) as unknown as Land[],
            places: mappedPlaces,
            activeNPCs: npcs.map((n: any) => ({ ...n, entryTime: Number(n.entryTime), leaveTime: Number(n.leaveTime) })) as unknown as NPC[],
            activeEvents: events.map((e: any) => ({ ...e, startTime: Number(e.startTime) })) as unknown as GameEvent[],

            // Settings & Globals from GameSettings model
            turn: settings.turn,
            isDay: settings.isDay,
            isTimerRunning: settings.isTimerRunning,
            lastTick: Number(settings.lastTick),
            timeRemaining: settings.timeRemaining,
            marketStatus: settings.marketStatus as 'open' | 'closed',
            season: settings.season as any,
            eventRevision: settings.eventRevision,

            settings: {
                taxRate: settings.taxRate,
                insuranceRate: settings.insuranceRate,
                interestRate: settings.interestRate,
                salaryAutoSafeRate: settings.salaryAutoSafeRate,
                turnDuration: settings.turnDuration,
                moneyMultiplier: (settings as any).moneyMultiplier || 1.0,
                isGameStarted: (settings as any).isGameStarted ?? false
            },
            economy: {
                status: settings.economyStatus as any,
                interestRate: settings.economyInterestRate,
                priceIndex: settings.priceIndex,
                marketTrend: settings.marketTrend as any,
                taxRateAdjust: settings.taxRateAdjust,
                lastUpdateTurn: settings.lastUpdateTurn
            },
            environment: {
                weather: settings.envWeather as any,
                temperature: settings.envTemperature,
                season: settings.envSeason as any,
                cityInfrastructure: {
                    power: settings.infraPower,
                    water: settings.infraWater,
                    network: settings.infraNetwork
                },
                securityLevel: settings.securityLevel
            },

            // Static/Aux Data
            news: news.map((n: any) => ({ ...n, timestamp: Number(n.timestamp) })) as unknown as NewsItem[],
            roulette: INITIAL_STATE_VALUES.roulette, // Fallback: Memory only for now
            npcTemplates: INITIAL_STATE_VALUES.npcTemplates, // Static
            properties: [], // Deprecated or load from DB if needed
            processedIdempotencyKeys: [] // Reset on reload in this design
        };
    } catch (error) {
        console.error('getGameState DB Error:', error);
        throw error;
    }
}

// NOTE: This implementation performs a full save of relevant entities.
// In a real app, you would optimize this to only update changed fields.
// For the purpose of "Phase 1 Migration" where we keep the API signature (whole state update),
// we will detect changes by ID and UPSERT.
export async function updateGameState(updater: (state: GameState) => GameState | void): Promise<GameState> {
    const currentState = await getGameState();

    // Apply updater (it mutates currentState in place usually, or returns new one)
    const result = updater(currentState);
    const newState = result || currentState;

    // Increment revision
    newState.eventRevision = (newState.eventRevision || 0) + 1;
    newState.lastTick = Date.now(); // Ensure tick update

    // SAVE BACK TO DB (Critical Phase)
    try {
        // 1. Update Settings
        await prisma.gameSettings.update({
            where: { id: 'singleton' },
            data: {
                turn: newState.turn,
                turnDuration: newState.settings.turnDuration,
                moneyMultiplier: newState.settings.moneyMultiplier,
                taxRate: newState.settings.taxRate,
                insuranceRate: newState.settings.insuranceRate,
                interestRate: newState.settings.interestRate,
                salaryAutoSafeRate: newState.settings.salaryAutoSafeRate,
                isDay: newState.isDay,
                isTimerRunning: newState.isTimerRunning,
                isGameStarted: newState.settings.isGameStarted ?? false,
                lastTick: BigInt(newState.lastTick),
                timeRemaining: newState.timeRemaining,
                marketStatus: newState.marketStatus,
                eventRevision: newState.eventRevision,

                // Economy & Env
                economyStatus: newState.economy.status,
                economyInterestRate: newState.economy.interestRate,
                priceIndex: newState.economy.priceIndex,
                marketTrend: newState.economy.marketTrend,
                taxRateAdjust: newState.economy.taxRateAdjust,
                lastUpdateTurn: newState.economy.lastUpdateTurn,

                envWeather: newState.environment.weather,
                envTemperature: newState.environment.temperature,
                envSeason: newState.environment.season,
                infraPower: newState.environment.cityInfrastructure.power,
                infraWater: newState.environment.cityInfrastructure.water,
                infraNetwork: newState.environment.cityInfrastructure.network,
                securityLevel: newState.environment.securityLevel,
            }
        });

        // 2. Update Users (Iterate and upsert changed users - assuming modification)
        // Optimization: In Phase 1, we just update ALL users in the state. 
        // Sync Deletions: Remove users from DB that are no longer in state
        const currentUserIds = newState.users.map(u => u.id);
        await prisma.user.deleteMany({
            where: { id: { notIn: currentUserIds } }
        });

        for (const user of newState.users) {
            await prisma.user.upsert({
                where: { id: user.id },
                update: {
                    playerIcon: user.playerIcon,
                    name: user.name,
                    shopName: user.shopName,
                    balance: user.balance,
                    deposit: user.deposit,
                    debt: user.debt,
                    inventory: user.inventory as any,
                    stocks: user.stocks as any,
                    // ... Need to map almost ALL fields ...
                    // This is verbose. A better way for Phase 1 is strictly JSON dumping?
                    // But we defined schema. So we map.
                    popularity: user.popularity,
                    happiness: user.happiness,
                    rating: user.rating,
                    job: user.job,
                    jobType: user.jobType,
                    lastJobChangeTurn: user.lastJobChangeTurn,
                    unpaidTax: user.unpaidTax,
                    arrestCount: user.arrestCount,
                    stolenAmount: user.stolenAmount,
                    fanCount: user.fanCount,
                    employmentStatus: user.employmentStatus,
                    currentJobId: user.currentJobId,
                    jobHistory: user.jobHistory as any,
                    shopItems: user.shopItems as any,

                    // Complex JSONs
                    shopMenu: user.shopMenu as any,
                    pointCards: user.pointCards as any,
                    ingredients: user.ingredients as any,
                    collection: user.collection as any,
                    furniture: user.furniture as any,
                    pets: user.pets as any,
                    coupons: user.coupons as any,
                    gachaCollection: user.gachaCollection as any,
                    shopWebsite: user.shopWebsite as any,
                    pointExchangeItems: user.pointExchangeItems as any,
                    ownedLands: user.ownedLands as any,
                    ownedPlaces: user.ownedPlaces as any,
                    ownedVehicles: user.ownedVehicles as any,
                    cryptoHoldings: user.cryptoHoldings as any,
                    qualifications: user.qualifications as any,
                    examHistory: user.examHistory as any,
                    loans: user.loans as any,
                    insurances: user.insurances as any,
                    lifeStats: user.lifeStats as any,
                    family: user.family as any,
                    partners: user.partners as any,
                    smartphone: user.smartphone as any,
                    commuteInfo: user.commuteInfo as any,
                    auditLogs: user.auditLogs as any,
                    isOff: user.isOff,
                    vacationReason: user.vacationReason,
                    isDebugAuthorized: user.isDebugAuthorized,
                } as any,
                create: {
                    id: user.id,
                    playerIcon: user.playerIcon,
                    name: user.name,
                    role: user.role,
                    balance: user.balance, // 必須フィールド
                    deposit: user.deposit || 0,
                    debt: user.debt || 0,
                    popularity: user.popularity || 0,
                    happiness: user.happiness || 50,
                    rating: user.rating || 0,
                    job: user.job || 'unemployed',
                    employmentStatus: user.employmentStatus || 'unemployed',
                    // JSON フィールドのデフォルト値
                    shopItems: (user.shopItems as any) || [],
                    stocks: (user.stocks as any) || {},
                    forbiddenStocks: (user.forbiddenStocks as any) || {},
                    isForbiddenUnlocked: user.isForbiddenUnlocked || false,
                    inventory: (user.inventory as any) || [],
                    shopMenu: (user.shopMenu as any) || [],
                    pointCards: (user.pointCards as any) || [],
                    collection: (user.collection as any) || {},
                    ownedLands: (user.ownedLands as any) || [],
                    ownedPlaces: (user.ownedPlaces as any) || [],
                    ownedVehicles: (user.ownedVehicles as any) || [],
                    cryptoHoldings: (user.cryptoHoldings as any) || {},
                    qualifications: (user.qualifications as any) || [],
                    jobHistory: (user.jobHistory as any) || null,
                    isOff: user.isOff || false,
                    vacationReason: user.vacationReason || null,
                    isDebugAuthorized: user.isDebugAuthorized || false,
                } as any
            });
        }

        // 3. Update Stocks
        for (const stock of newState.stocks) {
            await prisma.stock.update({
                where: { id: stock.id },
                data: {
                    price: stock.price,
                    previousPrice: stock.previousPrice,
                    volatility: stock.volatility,
                    priceHistory: stock.priceHistory as any
                }
            });
        }

        // 4. Update Requests
        const currentRequestIds = newState.requests.map(r => r.id);
        await prisma.request.deleteMany({
            where: { id: { notIn: currentRequestIds } }
        });

        for (const req of newState.requests) {
            // Check if exists to avoid error? upsert is safer
            await prisma.request.upsert({
                where: { id: req.id },
                update: {
                    status: req.status,
                    // other fields might change?
                },
                create: {
                    id: req.id,
                    type: req.type,
                    requesterId: req.requesterId,
                    amount: req.amount,
                    details: typeof req.details === 'object' ? JSON.stringify(req.details) : String(req.details || ''),
                    status: req.status,
                    timestamp: BigInt(req.timestamp),
                    idempotencyKey: req.idempotencyKey
                }
            });
        }

        // 5. Update Places (Sim)
        for (const place of newState.places) {
            await prisma.place.upsert({
                where: { id: place.id },
                update: {
                    status: place.status,
                    level: place.level,
                    stats: place.stats as any,
                    employees: place.employees as any,
                },
                create: {
                    id: place.id,
                    ownerId: place.ownerId,
                    name: place.name,
                    type: place.type,
                    status: place.status,
                    level: place.level,
                    lat: place.location.lat,
                    lng: place.location.lng,
                    address: place.location.address,
                    landId: place.location.landId || '',
                    stats: place.stats as any
                }
            });
        }

        // 6. Update Cryptos
        if (newState.cryptos) {
            for (const c of newState.cryptos) {
                await prisma.crypto.upsert({
                    where: { id: c.id },
                    update: {
                        price: c.price,
                        previousPrice: c.previousPrice,
                        volatility: c.volatility,
                        priceHistory: c.priceHistory as any,
                        updatedAt: new Date()
                    },
                    create: {
                        id: c.id,
                        name: c.name,
                        symbol: c.symbol,
                        price: c.price,
                        previousPrice: c.previousPrice,
                        volatility: c.volatility,
                        description: c.description,
                        creatorId: c.creatorId,
                        priceHistory: c.priceHistory as any,
                        createdAt: new Date(Number(c.createdAt) || Date.now()),
                        updatedAt: new Date()
                    }
                });
            }
        }

        // 7. Update Lands
        if (newState.lands) {
            for (const land of newState.lands) {
                await (prisma.land as any).upsert({
                    where: { id: land.id },
                    update: {
                        ownerId: land.ownerId,
                        price: land.price,
                        isForSale: land.isForSale,
                        status: land.status || 'active',
                        maintenanceFee: land.maintenanceFee || 0,
                        requiresApproval: land.requiresApproval || false,
                        allowConstruction: land.allowConstruction ?? true,
                        allowCompany: land.allowCompany ?? true,
                        polygon: land.polygon as any
                    },
                    create: {
                        id: land.id,
                        lat: land.location.lat,
                        lng: land.location.lng,
                        address: land.address,
                        price: land.price,
                        ownerId: land.ownerId,
                        type: 'land',
                        size: land.size,
                        zoning: land.zoning,
                        status: land.status || 'active',
                        isForSale: land.isForSale,
                        maintenanceFee: land.maintenanceFee || 0,
                        requiresApproval: land.requiresApproval || false,
                        allowConstruction: land.allowConstruction ?? true,
                        allowCompany: land.allowCompany ?? true,
                        polygon: land.polygon as any
                    }
                });
            }
        }

    } catch (err) {
        console.error('Failed to save GameState to DB:', err);
        throw err;
    }

    return newState;
}

// Legacy save function - internal use only or deprecated
export function saveGameState(state: GameState): void {
    console.warn('saveGameState() called directly. This is deprecated and does nothing in DB mode. use updateGameState.');
}
