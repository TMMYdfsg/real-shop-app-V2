'use client';

import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
import { Button } from './Button';

interface QRScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScan: (decodedText: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, onScan }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [error, setError] = useState<string>('');
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        let animationFrameId: number;
        let stream: MediaStream | null = null;

        const startScan = async () => {
            if (!isOpen) return;
            setError('');
            setIsScanning(true);

            // Check if mediaDevices API is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                setError('このブラウザ・環境ではカメラ機能が利用できません。HTTPSでアクセスしてください。');
                setIsScanning(false);
                return;
            }

            try {
                // リアカメラを優先
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    // iOS等での自動再生ポリシー対応
                    videoRef.current.setAttribute('playsinline', 'true');
                    await videoRef.current.play();
                    requestAnimationFrame(tick);
                }
            } catch (err: any) {
                console.error('Camera Access Error:', err);
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    setError('カメラの使用が許可されませんでした。');
                } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    setError('カメラが見つかりませんでした。');
                } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                    setError('カメラにアクセスできませんでした。他のアプリで使用中かもしれません。');
                } else {
                    setError('カメラの起動に失敗しました。');
                }
                setIsScanning(false);
            }
        };

        const tick = () => {
            if (!videoRef.current || !canvasRef.current || !isOpen || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
                // まだ準備ができていない、または閉じている場合は次フレームへ
                if (isOpen) animationFrameId = requestAnimationFrame(tick);
                return;
            }

            const video = videoRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            if (!ctx) return;

            // キャンバスサイズをビデオに合わせる
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // 描画
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // QR解析
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
            });

            if (code && code.data) {
                // スキャン成功
                // 音を鳴らす？ (任意)
                // new Audio('/sounds/scan.mp3').play().catch(() => {});
                stopScan();
                onScan(code.data);
            } else {
                // 次のフレームへ
                animationFrameId = requestAnimationFrame(tick);
            }
        };

        const stopScan = () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                stream = null;
            }
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            setIsScanning(false);
        };

        if (isOpen) {
            startScan();
        } else {
            stopScan();
        }

        return () => {
            stopScan();
        };
    }, [isOpen, onScan]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: 'black',
            display: 'flex', flexDirection: 'column'
        }}>
            {/* スキャンビューエリア (全画面) */}
            <div style={{ position: 'relative', flex: 1, overflow: 'hidden' }}>
                <video
                    ref={videoRef}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    muted
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {/* オーバーレイUI */}
                <div style={{
                    position: 'absolute', inset: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    {/* 暗い背景 (マスク) */}
                    <div style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.5)',
                        // 中央だけ透明にくり抜くための clip-path (簡易版)
                        // clipPath: 'polygon(0% 0%, 0% 100%, 25% 100%, 25% 25%, 75% 25%, 75% 75%, 25% 75%, 25% 100%, 100% 100%, 100% 0%)' 
                        // -> 難しいので、4つのdivで囲むか、SVG overlayを使うのが一般的。
                        // 今回は単純に中央に枠を表示するだけにする。
                    }} />

                    {/* スキャン枠 */}
                    <div style={{
                        width: '250px', height: '250px',
                        border: '4px solid #00ff00',
                        borderRadius: '20px',
                        boxShadow: '0 0 20px rgba(0, 255, 0, 0.5)',
                        zIndex: 10,
                        position: 'relative'
                    }}>
                        {/* スキャンバーアニメーション */}
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                            background: '#00ff00', opacity: 0.7,
                            animation: 'scanMove 2s infinite linear'
                        }} />
                    </div>

                    <p style={{
                        position: 'absolute', bottom: '15%',
                        color: 'white', fontWeight: 'bold', textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                        zIndex: 10
                    }}>
                        QRコードを枠に合わせてください
                    </p>
                </div>
            </div>

            {/* 権限・エラー表示 UI */}
            {error && (
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'rgba(0,0,0,0.9)', color: 'white',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    padding: '2rem', textAlign: 'center', zIndex: 30
                }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📷</div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem' }}>カメラの権限が必要です</h3>
                    <p style={{ marginBottom: '2rem', opacity: 0.8 }}>
                        {error}
                        <br />
                        <span style={{ fontSize: '0.8rem', display: 'block', marginTop: '0.5rem' }}>
                            ブラウザの設定でカメラへのアクセスを許可してから、<br />再度お試しください。
                        </span>
                    </p>
                    <Button
                        onClick={() => window.location.reload()}
                        variant="primary"
                        style={{ marginBottom: '1rem' }}
                    >
                        ページを再読み込み
                    </Button>
                    <Button onClick={onClose} variant="secondary">
                        閉じる
                    </Button>
                </div>
            )}

            {/* 閉じるボタンエリア */}
            <div style={{ padding: '1.5rem', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', zIndex: 20 }}>
                <Button onClick={onClose} variant="ghost" style={{ color: 'white', borderColor: 'white', width: '100%' }}>
                    閉じる
                </Button>
            </div>

            <style jsx>{`
                @keyframes scanMove {
                    0% { top: 0; }
                    50% { top: 100%; }
                    100% { top: 0; }
                }
            `}</style>
        </div>
    );
};
