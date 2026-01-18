import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/calls
 * 通話履歴を取得
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

        const calls = await prisma.voiceCall.findMany({
            where: {
                OR: [
                    { callerId: playerId },
                    { receiverId: playerId },
                ],
            },
            include: {
                caller: {
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
                startedAt: 'desc',
            },
            take: 50,
        });

        return NextResponse.json(calls);
    } catch (error) {
        console.error('[API] Error fetching calls:', error);
        return NextResponse.json(
            { error: '通話履歴の取得に失敗しました' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/calls
 * 通話を開始
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
        const { receiverId } = body;

        if (!receiverId) {
            return NextResponse.json(
                { error: 'receiverIdが必要です' },
                { status: 400 }
            );
        }

        // 通話レコードを作成
        const call = await prisma.voiceCall.create({
            data: {
                callerId: playerId,
                receiverId,
                status: 'PENDING',
            },
            include: {
                caller: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Agoraトークン生成（簡易版：本番環境では別APIに分離推奨）
        const token = generateDummyToken(call.id);

        return NextResponse.json({
            call,
            token,
            channelId: call.id,
        });
    } catch (error) {
        console.error('[API] Error initiating call:', error);
        return NextResponse.json(
            { error: '通話の開始に失敗しました' },
            { status: 500 }
        );
    }
}

// 簡易トークン生成（開発用）
// 本番環境ではagora-access-tokenを使用してサーバーサイドで生成
function generateDummyToken(channelId: string): string {
    // 実際のAgoraトークンは別APIで生成
    return `dummy_token_${channelId}_${Date.now()}`;
}
