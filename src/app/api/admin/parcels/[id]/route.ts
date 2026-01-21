import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

// export const dynamic = 'force-dynamic';

/**
 * PATCH /api/admin/parcels/:id
 * 土地情報を更新（管理者のみ）
 */
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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
        const { addressNormalized, lat, lng, price, status } = body;

        // 更新データを構築
        const updateData: any = {};
        if (addressNormalized !== undefined) updateData.addressNormalized = addressNormalized;
        if (lat !== undefined) updateData.lat = parseFloat(lat);
        if (lng !== undefined) updateData.lng = parseFloat(lng);
        if (price !== undefined) updateData.price = parseInt(price);
        if (status !== undefined) updateData.status = status;

        const parcel = await prisma.parcel.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(parcel);
    } catch (error) {
        console.error('[API] Error updating parcel:', error);
        return NextResponse.json(
            { error: '土地の更新に失敗しました' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/parcels/:id
 * 土地を削除（管理者のみ）
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
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

        await prisma.parcel.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[API] Error deleting parcel:', error);
        return NextResponse.json(
            { error: '土地の削除に失敗しました' },
            { status: 500 }
        );
    }
}
