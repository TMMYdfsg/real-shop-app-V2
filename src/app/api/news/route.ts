import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// // export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const news = await prisma.news.findMany({
            orderBy: {
                timestamp: 'desc',
            },
            take: 50,
        });

        const serializedNews = news.map((item: any) => ({
            id: item.id,
            type: 'system', // Default type
            title: 'ニュース', // Default title
            content: item.message,
            timestamp: Number(item.timestamp),
            // Optional fields
            icon: '📰',
        }));

        // Simple inference for type/title based on content
        const refinedNews = serializedNews.map((item: any) => {
            let type = item.type;
            let title = item.title;
            let icon = item.icon;

            if (item.content.includes('事件') || item.content.includes('警察')) {
                type = 'disaster';
                title = '事件・事故';
                icon = '🚨';
            } else if (item.content.includes('達成') || item.content.includes('クエスト')) {
                type = 'achievement';
                title = '偉業達成';
                icon = '🏆';
            } else if (item.content.includes('経済') || item.content.includes('株')) {
                type = 'economy';
                title = '経済ニュース';
                icon = '📈';
            } else if (item.content.includes('天気') || item.content.includes('時間')) {
                type = 'system';
                title = '気象・時間';
                icon = '☀️';
            } else if (item.content.includes('不動産') || item.content.includes('土地')) {
                type = 'land_sale';
                title = '不動産情報';
                icon = '🏠';
            }

            return { ...item, type, title, icon };
        });

        return NextResponse.json(refinedNews);
    } catch (error) {
        console.error('Error fetching news:', error);
        return NextResponse.json({ error: 'Failed to fetch news' }, { status: 500 });
    }
}
