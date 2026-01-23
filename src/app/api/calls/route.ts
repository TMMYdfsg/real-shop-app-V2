import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateChannelName } from '@/lib/agora';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * GET /api/calls
 * 通話履歴を取得
 */
export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const playerIdFromQuery = new URL(req.url).searchParams.get('playerId') || '';
        const playerId = cookieStore.get('playerId')?.value || req.headers.get('x-player-id') || playerIdFromQuery;

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
        const playerId = cookieStore.get('playerId')?.value || req.headers.get('x-player-id') || '';

        if (!playerId) {
            const body = await req.json().catch(() => ({}));
            const fallbackId = body?.playerId as string | undefined;
            if (!fallbackId) {
                return NextResponse.json(
                    { error: 'ログインが必要です' },
                    { status: 401 }
                );
            }
            return handleCreateCall(req, fallbackId, body);
        }

        const body = await req.json();
        return handleCreateCall(req, playerId, body);
    } catch (error) {
        console.error('[API] Error initiating call:', error);
        return NextResponse.json(
            { error: '通話の開始に失敗しました' },
            { status: 500 }
        );
    }
}

async function handleCreateCall(req: NextRequest, playerId: string, body: any) {
    try {
        const { receiverId } = body;

        if (!receiverId) {
            return NextResponse.json(
                { error: 'receiverIdが必要です' },
                { status: 400 }
            );
        }

        const caller = await prisma.user.findUnique({
            where: { id: playerId },
            select: { smartphone: true }
        });

        if (!caller) {
            return NextResponse.json(
                { error: 'ユーザーが見つかりません' },
                { status: 404 }
            );
        }

        const callerApps = Array.isArray((caller.smartphone as any)?.apps) ? (caller.smartphone as any).apps : [];
        if (!callerApps.includes('phone')) {
            return NextResponse.json(
                { error: '電話アプリがインストールされていません' },
                { status: 400 }
            );
        }

        const receiver = await prisma.user.findUnique({
            where: { id: receiverId },
            select: { smartphone: true, name: true }
        });

        if (!receiver) {
            return NextResponse.json(
                { error: '相手のユーザーが見つかりません' },
                { status: 404 }
            );
        }

        const receiverApps = Array.isArray((receiver.smartphone as any)?.apps) ? (receiver.smartphone as any).apps : [];
        if (!receiverApps.includes('phone')) {
            return NextResponse.json(
                { error: '相手のスマホに電話アプリが入っていません' },
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

        // Agoraトークン生成
        const channelName = generateChannelName(call.id);
        const uid = Math.floor(Math.random() * 1000000) + 1;
        const token = generateRtcToken(channelName, uid);

        return NextResponse.json({
            call,
            token,
            channelId: call.id,
            uid,
        });
    } catch (error) {
        console.error('[API] Error initiating call:', error);
        return NextResponse.json(
            { error: '通話の開始に失敗しました' },
            { status: 500 }
        );
    }
}

/**
 * Agora RTC Token Generator
 */
import { RtcTokenBuilder, RtcRole } from 'agora-token';

function generateRtcToken(channelName: string, uid: number): string | null {
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
        console.warn('[Agora] Missing App ID or Certificate. Using static key join.');
        return null;
    }

    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    return RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        uid,
        role,
        expirationTimeInSeconds,
        expirationTimeInSeconds
    );
}

