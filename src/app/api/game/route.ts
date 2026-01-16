import { NextResponse } from 'next/server';
import { getGameState } from '@/lib/dataStore';

export async function GET() {
    // キャッシュを防ぐためのヘッダー設定が必要かもしれません
    const state = getGameState();
    return NextResponse.json(state, {
        headers: {
            'Cache-Control': 'no-store, max-age=0',
        },
    });
}
