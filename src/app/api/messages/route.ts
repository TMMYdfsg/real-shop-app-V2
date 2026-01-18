import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/messages
 * メッセージ一覧を取得
 * Query params:
 *  - userId: 対話相手のID（指定すると特定ユーザーとの会話を取得）
 */
export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const playerId = cookieStore.get('playerId')?.value;

        if (!playerId) {
            return NextResponse.json(
                { error: 'ログインが必要です' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(req.url);
        const otherUserId = searchParams.get('userId');

        if (otherUserId) {
            // 特定ユーザーとの会話を取得
            const messages = await prisma.message.findMany({
                where: {
                    OR: [
                        { senderId: playerId, receiverId: otherUserId },
                        { senderId: otherUserId, receiverId: playerId },
                    ],
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            playerIcon: true,
                        },
                    },
                    receiver: {
                        select: {
                            id: true,
                            name: true,
                            playerIcon: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'asc',
                },
            });

            // 受信メッセージを既読にする
            await prisma.message.updateMany({
                where: {
                    senderId: otherUserId,
                    receiverId: playerId,
                    isRead: false,
                },
                data: {
                    isRead: true,
                },
            });

            return NextResponse.json(messages);
        } else {
            // 全会話のリストを取得（最新メッセージのみ）
            const messages = await prisma.message.findMany({
                where: {
                    OR: [
                        { senderId: playerId },
                        { receiverId: playerId },
                    ],
                },
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            playerIcon: true,
                        },
                    },
                    receiver: {
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
            });

            // 会話ごとに最新のメッセージのみを抽出
            const conversations = new Map();
            messages.forEach((msg) => {
                const otherId = msg.senderId === playerId ? msg.receiverId : msg.senderId;
                if (!conversations.has(otherId)) {
                    conversations.set(otherId, msg);
                }
            });

            return NextResponse.json(Array.from(conversations.values()));
        }
    } catch (error) {
        console.error('[API] Error fetching messages:', error);
        return NextResponse.json(
            { error: 'メッセージの取得に失敗しました' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/messages
 * メッセージを送信
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

        const body = await req.json();
        const { receiverId, content } = body;

        if (!receiverId || !content) {
            return NextResponse.json(
                { error: '必須フィールドが不足しています' },
                { status: 400 }
            );
        }

        const message = await prisma.message.create({
            data: {
                senderId: playerId,
                receiverId,
                content,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        playerIcon: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        playerIcon: true,
                    },
                },
            },
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error('[API] Error sending message:', error);
        return NextResponse.json(
            { error: 'メッセージの送信に失敗しました' },
            { status: 500 }
        );
    }
}
