import { NextResponse } from 'next/server';
import { getGameState } from '@/lib/dataStore';

// // export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const state = await getGameState();
        const videos = state.videos || [];
        return NextResponse.json(videos);
    } catch (error) {
        console.error('API /api/video/list error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export const dynamic = 'force-static';

