import { NextResponse } from 'next/server';
import { updateGameState } from '@/lib/dataStore';
import { User, Role } from '@/types';
// import { v4 as uuidv4 } from 'uuid'; // Removed


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, role, job } = body;

        if (!name || !role) {
            return NextResponse.json({ error: 'Name and Role are required' }, { status: 400 });
        }

        const newUser: User = {
            id: crypto.randomUUID(), // Node 19+ or available in Edge/Workers
            name,
            role: role as Role,
            balance: role === 'banker' ? 1000000 : 100, // 銀行員は多めに、プレイヤーは少なめ
            deposit: 0,
            debt: 0,
            job: job || 'unemployed',
            popularity: 50,
            happiness: 50,
            items: [],
            stocks: {},
            forbiddenStocks: {},
            isForbiddenUnlocked: false
        };

        updateGameState((state) => {
            // 重複チェックなどは省略
            state.users.push(newUser);
            return state;
        });

        return NextResponse.json({ success: true, user: newUser });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
