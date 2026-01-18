import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * POST /api/parcels/:id/buy
 * 土地を購入する
 */
export async function POST(
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

        // トランザクションで購入処理
        const result = await prisma.$transaction(async (tx) => {
            // 1. 土地確認（ロック取得）
            const parcel = await tx.parcel.findUnique({
                where: { id },
            });

            if (!parcel) {
                throw new Error('土地が見つかりません');
            }

            if (parcel.status !== 'PUBLISHED') {
                throw new Error('この土地は購入できません');
            }

            if (parcel.ownerUserId) {
                throw new Error('この土地は既に売約済みです');
            }

            // 2. ユーザー情報取得
            const user = await tx.user.findUnique({
                where: { id: playerId },
            });

            if (!user) {
                throw new Error('ユーザーが見つかりません');
            }

            // 既に土地を所有しているか確認
            const existingParcel = await tx.parcel.findFirst({
                where: { ownerUserId: playerId },
            });

            if (existingParcel) {
                throw new Error('既に土地を所有しています');
            }

            // 3. 残高確認
            if (user.balance < parcel.price) {
                throw new Error('残高が不足しています');
            }

            // 4. 購入処理
            await tx.user.update({
                where: { id: playerId },
                data: {
                    balance: user.balance - parcel.price,
                },
            });

            const updatedParcel = await tx.parcel.update({
                where: { id },
                data: {
                    ownerUserId: playerId,
                    status: 'SOLD',
                    soldAt: new Date(),
                },
            });

            // 5. 監査ログ（Transactionテーブルに記録）
            await tx.transaction.create({
                data: {
                    id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'payment',
                    amount: parcel.price,
                    senderId: playerId,
                    receiverId: 'system',
                    description: `土地購入: ${parcel.addressNormalized}`,
                    timestamp: BigInt(Date.now()),
                },
            });

            return updatedParcel;
        });

        return NextResponse.json({
            success: true,
            parcel: result,
        });
    } catch (error: any) {
        console.error('[API] Error buying parcel:', error);
        return NextResponse.json(
            { error: error.message || '土地購入に失敗しました' },
            { status: 400 }
        );
    }
}
