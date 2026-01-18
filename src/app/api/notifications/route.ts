import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/notifications
 * 未読メッセージと着信をチェック
 */
export async function GET() {
    try {
        const cookieStore = await cookies();
        const playerId = cookieStore.get('playerId')?.value;

        if (!playerId) {
            return NextResponse.json({
                hasUnreadMessages: false,
                unreadCount: 0,
                incomingCall: null,
            });
        }

        const [unreadMessages, incomingCall] = await Promise.all([
            // 未読メッセージ（最新1件のみ取得して軽量化）
            prisma.message.findMany({
                where: {
                    receiverId: playerId,
                    isRead: false,
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            playerIcon: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: 1,
            }),

            // 着信中の通話
            prisma.voiceCall.findFirst({
                where: {
                    receiverId: playerId,
                    status: 'PENDING',
                },
                include: {
                    caller: {
                        select: {
                            id: true,
                            name: true,
                            playerIcon: true,
                        },
                    },
                },
            }),
        ]);

        const totalUnreadCount = await prisma.message.count({
            where: {
                receiverId: playerId,
                isRead: false,
            },
        });

        return NextResponse.json({
            hasUnreadMessages: totalUnreadCount > 0,
            unreadCount: totalUnreadCount,
            latestMessage: unreadMessages[0] || null,
            incomingCall: incomingCall || null,
        });
    } catch (error) {
        console.error('[API] Error checking notifications:', error);
        return NextResponse.json(
            { error: '通知チェックに失敗しました' },
            { status: 500 }
        );
    }
}
