import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

// // export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/parcels
 * すべての土地を取得（管理者のみ）
 */
export async function GET() {
    try {
        const cookieStore = await cookies();
        const playerId = cookieStore.get('playerId')?.value;

        if (!playerId) {
            return NextResponse.json(
                { error: 'ログインが必要です' },
                { status: 401 }
            );
        }

        // 管理者チェック
        const user = await prisma.user.findUnique({
            where: { id: playerId },
        });

        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { error: '管理者権限が必要です' },
                { status: 403 }
            );
        }

        const parcels = await prisma.parcel.findMany({
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(parcels);
    } catch (error) {
        console.error('[API] Error fetching parcels:', error);
        return NextResponse.json(
            { error: '土地一覧の取得に失敗しました' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/admin/parcels
 * 新しい土地を登録（管理者のみ）
 */
export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const playerId = cookieStore.get('playerId')?.value;

        if (!playerId) {
            return NextResponse.json(
                { error: 'ログインが必要です' },
                { status: 401 }
            );
        }

        // 管理者チェック
        const user = await prisma.user.findUnique({
            where: { id: playerId },
        });

        if (!user || user.role !== 'admin') {
            return NextResponse.json(
                { error: '管理者権限が必要です' },
                { status: 403 }
            );
        }

        const body = await req.json();
        const { addressNormalized, lat, lng, price, status = 'DRAFT' } = body;

        // バリデーション
        if (!addressNormalized || lat === undefined || lng === undefined || !price) {
            return NextResponse.json(
                { error: '必須フィールドが不足しています' },
                { status: 400 }
            );
        }

        const parcel = await prisma.parcel.create({
            data: {
                addressNormalized,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                price: parseInt(price),
                status,
                createdByUserId: playerId,
            },
        });

        return NextResponse.json(parcel);
    } catch (error) {
        console.error('[API] Error creating parcel:', error);
        return NextResponse.json(
            { error: '土地の登録に失敗しました' },
            { status: 500 }
        );
    }
}

export const dynamic = 'force-static';

