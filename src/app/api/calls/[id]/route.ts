import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

/**
 * PATCH /api/calls/:id
 * 通話ステータスを更新
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

        const body = await req.json();
        const { status, duration } = body;

        const call = await prisma.voiceCall.findUnique({
            where: { id },
        });

        if (!call) {
            return NextResponse.json(
                { error: '通話が見つかりません' },
                { status: 404 }
            );
        }

        // 権限チェック
        if (call.callerId !== playerId && call.receiverId !== playerId) {
            return NextResponse.json(
                { error: '権限がありません' },
                { status: 403 }
            );
        }

        const updateData: any = {};
        if (status) updateData.status = status;
        if (duration !== undefined) updateData.duration = duration;
        if (status === 'ENDED' || status === 'DECLINED' || status === 'MISSED') {
            updateData.endedAt = new Date();
        }

        const updatedCall = await prisma.voiceCall.update({
            where: { id },
            data: updateData,
        });

        // 応答時(ACTIVE)ならトークンを生成して返す
        let token = undefined;
        if (status === 'ACTIVE') {
            token = generateRtcToken(id, 0);
        }

        return NextResponse.json({ ...updatedCall, token });
    } catch (error) {
        console.error('[API] Error updating call:', error);
        return NextResponse.json(
            { error: '通話の更新に失敗しました' },
            { status: 500 }
        );
    }
}

/**
 * Agora RTC Token Generator
 */
import { RtcTokenBuilder, RtcRole } from 'agora-token';

function generateRtcToken(channelName: string, uid: number): string {
    const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
    const appCertificate = process.env.AGORA_APP_CERTIFICATE;

    if (!appId || !appCertificate) {
        // App Certificateがない場合はダミートークン
        return 'dummy-token';
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
