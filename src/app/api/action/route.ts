import { NextResponse, NextRequest } from 'next/server';
import { updateGameState } from '@/lib/dataStore';
import { Request as GameRequest } from '@/types';
import crypto from 'crypto';

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

        if (type === 'change_job') {
            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    user.job = details || 'unemployed';
                    user.lastJobChangeTurn = state.turn; // 転職ターンを記録
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

        updateGameState((state) => {
            state.requests.push(newRequest);
            return state;
        });

        return NextResponse.json({ success: true, request: newRequest });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit action' }, { status: 500 });
    }
}
