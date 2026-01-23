import { NextResponse } from 'next/server';
import { updateGameState } from '@/lib/dataStore';
import { INITIAL_MONEY } from '@/lib/gameData';
import { User, Role } from '@/types';
// import { v4 as uuidv4 } from 'uuid'; // Removed

// // export const dynamic = 'force-dynamic';


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, role, job } = body;

        if (!name || !role) {
            return NextResponse.json({ error: 'Name and Role are required' }, { status: 400 });
        }

        // balanceの計算（NaNチェック付き）
        // リクエストから initialBalance が渡された場合はそれを使用 (初期設定画面からの値)
        const requestedBalance = body.initialBalance !== undefined ? Number(body.initialBalance) : undefined;

        let initialBalance = role === 'banker' ? 1000000 : INITIAL_MONEY;
        if (requestedBalance !== undefined && !isNaN(requestedBalance)) {
            initialBalance = requestedBalance;
            // Banker usually gets infinite or very high, but if specific amount is requested (e.g. for players), use it.
            // If this is a banker, maybe keep the high amount? 
            // Logic: If role is banker, maybe ignore 'Starting Money' setting intended for players?
            // Usually setup screen sends specific amount for players.
            if (role === 'banker') {
                initialBalance = 1000000; // Force banker to have high funds regardless
            }
        } else {
            // Fallback default
            initialBalance = role === 'banker' ? 1000000 : INITIAL_MONEY;
        }

        if (isNaN(initialBalance) || !isFinite(initialBalance)) {
            return NextResponse.json({ error: 'Invalid balance calculation' }, { status: 500 });
        }

        const newUser: User = {
            id: crypto.randomUUID(), // Node 19+ or available in Edge/Workers
            name,
            role: role as Role,
            balance: initialBalance, // 銀行員は多めに、プレイヤーは少なめ
            deposit: 0,
            debt: 0,
            job: job || 'unemployed',
            popularity: 50,
            happiness: 50,
            rating: 3, // 初期評価: 3つ星
            traits: [],
            skills: {},
            needsTraitSelection: false,
            timeEra: 'present',
            inventory: [],
            stocks: {},
            forbiddenStocks: {},
            isForbiddenUnlocked: false,
            transactions: [], // 取引履歴
            pointCards: [], // ポイントカード
            employmentStatus: 'unemployed',
            jobHistory: [],
            shopItems: [],
            ownedLands: [],
            ownedPlaces: [],
            shopMenu: [],
            smartphone: {
                model: 'Android',
                apps: ['shopping'],
                appOrder: ['shopping'],
                broken: false,
                battery: 100,
                settings: {
                    theme: 'system',
                    autoLockSeconds: 0,
                    textScale: 1.0,
                    trueTone: true,
                    uiTheme: 'default',
                    reduceMotion: false,
                    customIcons: []
                }
            }
        };

        await updateGameState((state) => {
            // 重複チェックなどは省略
            state.users.push(newUser);
            return state;
        });

        return NextResponse.json({ success: true, user: newUser });
    } catch (error) {
        console.error('User creation error:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}

export const dynamic = 'force-static';

