import { NextResponse } from 'next/server';
import { getGameState, updateGameState, convertBigIntToNumber } from '@/lib/dataStore';
import { processGameTick } from '@/lib/gameLogic';

// // export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        // 時間経過処理
        const currentState = await getGameState();
        const { newState, hasChanged } = processGameTick(currentState);

        let finalState = currentState;
        if (hasChanged) {
            // 変更があれば保存
            finalState = await updateGameState(() => newState);
        }

        // BigIntを安全にシリアライズ可能な形式に変換
        const safeState = convertBigIntToNumber(finalState);

        return NextResponse.json(safeState, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            },
        });
    } catch (error: any) {
        console.error('API /api/game Critical Error:', error);
        console.error('Stack:', error.stack);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message || String(error),
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

export const dynamic = 'force-static';

