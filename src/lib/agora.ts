// Agora RTC クライアント設定
// 本番環境では環境変数から取得

export const AGORA_CONFIG = {
    appId: process.env.NEXT_PUBLIC_AGORA_APP_ID || '',
    // 開発環境ではダミーIDを使用
    isDevelopment: !process.env.NEXT_PUBLIC_AGORA_APP_ID,
};

/**
 * Agora使用可能かチェック
 */
export function isAgoraAvailable(): boolean {
    return !!AGORA_CONFIG.appId || AGORA_CONFIG.isDevelopment;
}

/**
 * ボイスチャット用のチャンネル名を生成
 */
export function generateChannelName(callId: string): string {
    return `call_${callId}`;
}

/**
 * 開発用：ダミーAgoraクライアント
 * 本番環境ではagora-rtc-sdk-ngを使用
 */
export class DummyAgoraClient {
    private channelId: string | null = null;
    private isJoined: boolean = false;

    async join(appId: string, channel: string, token: string | null) {
        console.log('[Dummy Agora] Joining channel:', channel);
        this.channelId = channel;
        this.isJoined = true;
        return Promise.resolve();
    }

    async leave() {
        console.log('[Dummy Agora] Leaving channel:', this.channelId);
        this.isJoined = false;
        this.channelId = null;
        return Promise.resolve();
    }

    async publish(tracks: any[]) {
        console.log('[Dummy Agora] Publishing tracks');
        return Promise.resolve();
    }

    on(event: string, callback: Function) {
        console.log('[Dummy Agora] Listening to event:', event);
    }
}

/**
 * Agoraクライアントを取得
 * 開発環境ではダミークライアント、本番ではagora-rtc-sdk-ngを使用
 */
export async function getAgoraClient() {
    if (AGORA_CONFIG.isDevelopment) {
        console.warn('[Agora] Running in development mode with dummy client');
        return new DummyAgoraClient();
    }

    // 本番環境: agora-rtc-sdk-ngを動的インポート
    try {
        const AgoraRTC = await import('agora-rtc-sdk-ng');
        return AgoraRTC.default.createClient({
            mode: 'rtc',
            codec: 'vp8',
        });
    } catch (error) {
        console.error('[Agora] Failed to load Agora SDK:', error);
        console.warn('[Agora] Falling back to dummy client');
        return new DummyAgoraClient();
    }
}

/**
 * マイクトラックを作成
 */
export async function createMicrophoneTrack() {
    if (AGORA_CONFIG.isDevelopment) {
        console.log('[Agora] Creating dummy microphone track');
        return {
            close: () => console.log('[Dummy] Microphone closed'),
            setMuted: (muted: boolean) => console.log('[Dummy] Microphone muted:', muted),
        };
    }

    try {
        const AgoraRTC = await import('agora-rtc-sdk-ng');
        return await AgoraRTC.default.createMicrophoneAudioTrack();
    } catch (error) {
        console.error('[Agora] Failed to create microphone track:', error);
        return null;
    }
}
