import { NextResponse } from 'next/server';
import { updateGameState } from '@/lib/dataStore';
import { INITIAL_MONEY } from '@/lib/gameData';
import { User, Role } from '@/types';
import { prisma } from '@/lib/prisma';

// // export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { users, settings: setupSettings } = body;

        if (!users || !Array.isArray(users) || users.length === 0) {
            return NextResponse.json({ error: 'Users data is required' }, { status: 400 });
        }

        // 1. Update Global Settings
        await prisma.gameSettings.upsert({
            where: { id: 'singleton' },
            create: {
                id: 'singleton',
                taxRate: 0.1,
                insuranceRate: 0.05,
                interestRate: 0.05,
                salaryAutoSafeRate: 0.1,
                turnDuration: 60,
                moneyMultiplier: setupSettings?.moneyMultiplier || 1.0,
                lastTick: BigInt(Date.now()),
                timeRemaining: 60,
                season: 'spring',
                isGameStarted: false,
            },
            update: {
                moneyMultiplier: setupSettings?.moneyMultiplier || 1.0,
                isGameStarted: false,
            }
        });

        // 2. Prepare User objects
        const startingMoney = setupSettings?.startingMoney || INITIAL_MONEY;

        const newUsers: User[] = users.map((u: any, index: number) => {
            const role = u.role || (index === 0 ? 'banker' : 'player');
            let balance = role === 'banker' ? 1000000 : startingMoney;

            // Allow override balance if specified
            if (u.initialBalance !== undefined) {
                balance = Number(u.initialBalance);
            }

            return {
                id: u.id || crypto.randomUUID(),
                name: u.name,
                role: role as Role,
                balance: balance,
                deposit: 0,
                debt: 0,
                job: u.job || 'unemployed',
                popularity: 50,
                happiness: 50,
                rating: 3,
                traits: [],
                skills: {},
                inventory: [],
                stocks: {},
                forbiddenStocks: {},
                isForbiddenUnlocked: false,
                transactions: [],
                pointCards: [],
                employmentStatus: 'unemployed',
                jobHistory: [],
                shopItems: [],
                ownedLands: [],
                ownedPlaces: [],
                shopMenu: [],
                isOff: false,
                vacationReason: '',
                smartphone: {
                    model: 'Android',
                    apps: ['shopping'],
                    appOrder: ['shopping'],
                    broken: false,
                    battery: 100
                }
            };
        });

        // 3. Batch Update Game State
        await updateGameState((state) => {
            // Replace users entirely since this is "setup"
            state.users = newUsers;
            state.requests = [];
            state.turn = 1;
            state.isDay = true;
            return state;
        });

        return NextResponse.json({ success: true, users: newUsers });
    } catch (error) {
        console.error('Full setup error:', error);
        return NextResponse.json({ error: 'Failed to perform full setup' }, { status: 500 });
    }
}

export const dynamic = 'force-static';

