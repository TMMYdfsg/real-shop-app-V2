import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { moneyMultiplier, startingMoney } = body;

        // Upsert settings (singleton pattern)
        const settings = await prisma.gameSettings.upsert({
            where: { id: 'singleton' },
            create: {
                id: 'singleton',
                taxRate: 0.1,
                insuranceRate: 0.05,
                interestRate: 0.05,
                salaryAutoSafeRate: 0.1,
                turnDuration: 60,
                moneyMultiplier: moneyMultiplier || 1.0,
                lastTick: BigInt(Date.now()),
                timeRemaining: 60,
                season: 'spring',
            },
            update: {
                moneyMultiplier: moneyMultiplier || 1.0,
                // We don't store startingMoney in settings usually, as it's a one-off for user creation.
                // But the client might want to persist it? 
                // For now, only moneyMultiplier is persistent game state.
            }
        });

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error('Settings setup error:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
