import { NextResponse } from 'next/server';
import { updateGameState } from '@/lib/dataStore';
import { User, Role } from '@/types';
// import { v4 as uuidv4 } from 'uuid'; // Removed

export const dynamic = 'force-dynamic';


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, role, job } = body;

        if (!name || !role) {
            return NextResponse.json({ error: 'Name and Role are required' }, { status: 400 });
        }

        // balanceの計算（NaNチェック付き）
        const initialBalance = role === 'banker' ? 1000000 : 100;
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
            shopMenu: []
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
