import { NextResponse } from 'next/server';
import { getGameState, updateGameState } from '@/lib/dataStore';
import { processGameTick } from '@/lib/gameLogic';

export const dynamic = 'force-dynamic';

export async function GET() {
    // 時間経過処理
    const currentState = await getGameState();
    const { newState, hasChanged } = processGameTick(currentState);

    let finalState = currentState;
    if (hasChanged) {
        // 変更があれば保存
        finalState = await updateGameState(() => newState);
    }

    return NextResponse.json(finalState, {
        headers: {
            'Cache-Control': 'no-store, max-age=0',
        },
    });
}
