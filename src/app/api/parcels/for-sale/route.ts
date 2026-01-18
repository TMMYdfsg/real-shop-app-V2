import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/parcels/for-sale
 * 購入可能な土地一覧を取得
 */
export async function GET() {
    try {
        const parcels = await prisma.parcel.findMany({
            where: {
                status: 'PUBLISHED',
                ownerUserId: null,
            },
            select: {
                id: true,
                addressNormalized: true,
                lat: true,
                lng: true,
                price: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(parcels);
    } catch (error) {
        console.error('[API] Error fetching parcels for sale:', error);
        return NextResponse.json(
            { error: '土地一覧の取得に失敗しました' },
            { status: 500 }
        );
    }
}
