import { NextResponse } from 'next/server';
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

// // export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { channelName, uid } = body;

        if (!channelName) {
            return NextResponse.json({ error: 'channelName is required' }, { status: 400 });
        }

        // 環境変数からAgora認証情報取得
        const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID;
        const appCertificate = process.env.AGORA_APP_CERTIFICATE;

        if (!appId || !appCertificate) {
            console.error('[Agora Token] Missing AGORA_APP_ID or AGORA_APP_CERTIFICATE');
            return NextResponse.json({
                error: 'Agora configuration not found. Please set NEXT_PUBLIC_AGORA_APP_ID and AGORA_APP_CERTIFICATE in .env.local'
            }, { status: 500 });
        }

        // UIDは数値または文字列（0を使用すると自動割り当て）
        const uidNumber = uid ? (typeof uid === 'string' ? parseInt(uid) : uid) : 0;

        // Token有効期限（秒）: デフォルト1時間
        const expirationTimeInSeconds = 3600;
        const currentTimestamp = Math.floor(Date.now() / 1000);
        const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

        // RTC Token生成
        const token = RtcTokenBuilder.buildTokenWithUid(
            appId,
            appCertificate,
            channelName,
            uidNumber,
            RtcRole.PUBLISHER, // 送受信両方可能
            privilegeExpiredTs
        );

        console.log(`[Agora Token] Generated token for channel: ${channelName}, uid: ${uidNumber}, expires in: ${expirationTimeInSeconds}s`);

        return NextResponse.json({
            token,
            expiresIn: expirationTimeInSeconds,
            uid: uidNumber
        });
    } catch (error) {
        console.error('[Agora Token] Generation error:', error);
        return NextResponse.json({
            error: 'Failed to generate token',
            details: (error as Error).message
        }, { status: 500 });
    }
}

export const dynamic = 'force-static';

