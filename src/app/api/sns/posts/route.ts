import { NextResponse } from 'next/server';
import { getGameState } from '@/lib/dataStore';

// // export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const state = await getGameState();
        const posts = state.snsPosts || [];
        return NextResponse.json(posts);
    } catch (error) {
        console.error('API /api/sns/posts error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
