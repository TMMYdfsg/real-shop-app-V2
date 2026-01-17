'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { QRCodeSVG } from 'qrcode.react';
import { QRScanner } from '@/components/ui/QRScanner';

export default function PaymentPage() {
    const { gameState, currentUser } = useGame();
    const [payAmount, setPayAmount] = useState('');
    const [targetId, setTargetId] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [mode, setMode] = useState<'pay' | 'transfer' | 'bill'>('pay');
    const [showQR, setShowQR] = useState(false);
    const [showScanner, setShowScanner] = useState(false);

    // 事前にカメラ権限をリクエストする (ユーザー要望)
    React.useEffect(() => {
        const requestCameraPermission = async () => {
            // Check if mediaDevices API is available
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                console.log('MediaDevices API not available (HTTP or unsupported browser)');
                return;
            }

            try {
                // ストリームを一瞬だけ取得して権限ダイアログを出す
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                // 取得できたらすぐに停止して解放する
                stream.getTracks().forEach(track => track.stop());
            } catch (e) {
                // 拒否されたりエラーが出ても、ここでは特に何もしない（スキャンボタン押下時に詳細エラーが出るため）
                console.log('Pre-check camera permission failed:', e);
            }
        };

        requestCameraPermission();
    }, []);

    if (!gameState || !currentUser) return <div>Loading...</div>;

    const unpaidTax = currentUser.unpaidTax || 0;

    const playSound = async () => {
        try {
            const audio = new Audio('/sounds/peipei.mp3');
            await audio.play().catch(() => { });
            await new Promise(r => setTimeout(r, 800));
        } catch (e) { }
    };

    const handleAction = async () => {
        const amount = Number(payAmount);
        if (amount <= 0) return;

        if (mode === 'transfer' && !targetId) {
            alert('相手のIDを入力してください');
            return;
        }

        if (mode === 'transfer' && currentUser.balance < amount) {
            alert('残高不足です');
            return;
        }

        if (!confirm('実行しますか？')) return;

        setIsProcessing(true);
        await playSound();

        let type = 'pay_tax';
        // Default fallback, but logic below sets correct type
        // Actually we used 'pay_tax' for paying tax.
        // We need to distinguish mode.

        if (mode === 'pay') {
            // This is generic payment (vanishing money? or simple bill pay?)
            // In previous implementation, 'other' was 'bill'.
            // But now 'bill' mode is requesting money.
            // Let's call generic payment 'bill' (self-payment) or 'tax' (if strictly tax).
            // If it's tax payment:
            // We have specific tax section.
            // If this general form is used for tax?
            await fetch('/api/action', {
                method: 'POST',
                body: JSON.stringify({
                    type: 'bill', // General payment (reduces balance)
                    requesterId: currentUser.id,
                    amount: amount,
                    details: 'Self Payment'
                })
            });
        } else if (mode === 'transfer') {
            await fetch('/api/action', {
                method: 'POST',
                body: JSON.stringify({
                    type: 'transfer',
                    requesterId: currentUser.id,
                    amount: amount,
                    details: targetId // Target User ID
                })
            });
        } else if (mode === 'bill') {
            await fetch('/api/action', {
                method: 'POST',
                body: JSON.stringify({
                    type: 'bill',
                    requesterId: currentUser.id,
                    amount: amount,
                    details: targetId
                })
            });
        }

        alert('Peipei♪ (申請完了)');
        setIsProcessing(false);
        setPayAmount('');
        setTargetId('');
        window.location.reload();
    };

    const handlePayTax = async () => {
        setIsProcessing(true);
        await playSound();
        await fetch('/api/action', {
            method: 'POST',
            body: JSON.stringify({
                type: 'pay_tax',
                requesterId: currentUser.id,
                amount: unpaidTax,
                details: 'Tax Payment'
            })
        });
        alert('納税完了！Peipei♪');
        setIsProcessing(false);
        window.location.reload();
    };

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.5rem', textAlign: 'center' }}>Peipei ウォレット</h2>

            {/* Peipei Card */}
            <div style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                borderRadius: '16px',
                padding: '1.5rem',
                color: 'white',
                marginBottom: '2rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>残高</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{(currentUser.balance || 0).toLocaleString()}</div>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    <Button size="sm" variant="ghost" style={{ color: 'white', background: 'rgba(255,255,255,0.2)' }} onClick={() => setShowQR(true)}>
                        QR表示
                    </Button>
                    <Button size="sm" variant="ghost" style={{ color: 'white', background: 'rgba(255,255,255,0.2)' }} onClick={() => setShowScanner(true)}>
                        スキャン
                    </Button>
                    <Button size="sm" variant="ghost" style={{ color: 'white', background: 'rgba(255,255,255,0.2)' }} onClick={() => { setMode('transfer'); document.getElementById('action-area')?.scrollIntoView({ behavior: 'smooth' }); }}>
                        送金
                    </Button>
                    <Button size="sm" variant="ghost" style={{ color: 'white', background: 'rgba(255,255,255,0.2)' }} onClick={() => { setMode('bill'); document.getElementById('action-area')?.scrollIntoView({ behavior: 'smooth' }); }}>
                        請求
                    </Button>
                </div>
            </div>

            {showQR && (
                <Modal isOpen={true} onClose={() => setShowQR(false)} title="マイQRコード">
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                        {/* Real QR Code */}
                        <div style={{ background: 'white', padding: '1rem', display: 'inline-block', borderRadius: '8px' }}>
                            {/* @ts-ignore */}
                            <QRCodeSVG value={currentUser.id} size={200} />
                        </div>
                        <div style={{ marginTop: '1rem', fontSize: '1.2rem', fontWeight: 'bold', wordBreak: 'break-all' }}>{currentUser.id}</div>
                        <p style={{ marginTop: '0.5rem', color: '#666' }}>これを相手に見せてください</p>
                        <Button onClick={() => setShowQR(false)} style={{ marginTop: '1rem' }}>閉じる</Button>
                    </div>
                </Modal>
            )}

            {/* QR Scanner */}
            <QRScanner
                isOpen={showScanner}
                onClose={() => setShowScanner(false)}
                onScan={(decodedText) => {
                    setTargetId(decodedText);
                    setMode('transfer'); // スキャンしたら自動で送金モードへ
                    setShowScanner(false);
                    // スキャン成功音の代わりにバイブレーションなどができればベストだがWebでは制限あり
                    // 代わりにフォームへスクロール
                    setTimeout(() => {
                        document.getElementById('action-area')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }}
            />

            {/* Tax Alert */}
            {unpaidTax > 0 && (
                <Card padding="lg" style={{ border: '2px solid #ef4444', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <h3 style={{ color: '#ef4444', fontWeight: 'bold' }}>未払いの税金</h3>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{(unpaidTax || 0).toLocaleString()}枚</div>
                        </div>
                        <Button
                            style={{ background: '#ef4444', color: 'white' }}
                            onClick={handlePayTax}
                            disabled={isProcessing}
                        >
                            払う
                        </Button>
                    </div>
                </Card>
            )}

            {/* Action Area */}
            <Card padding="lg" id="action-area">
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                    <Button
                        variant={mode === 'pay' ? 'primary' : 'ghost'}
                        onClick={() => setMode('pay')}
                        fullWidth
                    >
                        支払い (消失)
                    </Button>
                    <Button
                        variant={mode === 'transfer' ? 'primary' : 'ghost'}
                        onClick={() => setMode('transfer')}
                        fullWidth
                    >
                        送金
                    </Button>
                    <Button
                        variant={mode === 'bill' ? 'primary' : 'ghost'}
                        onClick={() => setMode('bill')}
                        fullWidth
                    >
                        請求
                    </Button>
                </div>

                <div>
                    {mode === 'pay' && <p style={{ marginBottom: '1rem' }}>お店への支払いや、お金を消滅させる時に使います。</p>}
                    {mode === 'transfer' && <p style={{ marginBottom: '1rem' }}>相手のIDを指定して送金します。</p>}
                    {mode === 'bill' && <p style={{ marginBottom: '1rem' }}>相手のIDを指定して請求を送ります (銀行員承認後に強制徴収)。</p>}

                    {(mode === 'transfer' || mode === 'bill') && (
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>相手のID</label>
                            <input
                                type="text"
                                value={targetId}
                                onChange={e => setTargetId(e.target.value)}
                                placeholder="相手のQRコード(ID)を入力"
                                style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc' }}
                            />
                        </div>
                    )}

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>金額</label>
                        <input
                            type="number"
                            value={payAmount}
                            onChange={e => setPayAmount(e.target.value)}
                            placeholder="金額を入力"
                            style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1.2rem' }}
                        />
                    </div>

                    {mode === 'transfer' ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <Button
                                fullWidth
                                size="lg"
                                onClick={handleAction}
                                disabled={isProcessing || !payAmount || !targetId}
                                style={{ background: '#3b82f6', color: 'white' }}
                            >
                                {isProcessing ? '処理中...' : '送金する'}
                            </Button>
                            <Button
                                fullWidth
                                size="lg"
                                onClick={() => targetId && (window.location.href = `/player/${currentUser.id}/visit/${targetId}`)}
                                disabled={!targetId}
                                variant="secondary"
                            >
                                店へ行く
                            </Button>
                        </div>
                    ) : (
                        <Button
                            fullWidth
                            size="lg"
                            onClick={handleAction}
                            disabled={isProcessing || !payAmount || ((mode !== 'pay') && !targetId)}
                            style={{ background: mode === 'bill' ? '#f59e0b' : '#ef4444', color: 'white' }}
                        >
                            {isProcessing ? 'Peipei...' : mode === 'bill' ? '請求する' : '支払う'}
                        </Button>
                    )}
                </div>
            </Card>

            {/* User List for ease of use (Debugging / Local play helper) */}
            <div style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.5 }}>
                <p style={{ fontSize: '0.8rem' }}>近くのユーザー (IDコピー用)</p>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {gameState.users.filter(u => u.role === 'player' && u.id !== currentUser.id).map(u => (
                        <span key={u.id} style={{ padding: '0.2rem 0.5rem', background: '#eee', borderRadius: '4px', fontSize: '0.7rem', cursor: 'pointer' }} onClick={() => setTargetId(u.id)}>
                            {u.name}: {u.id.slice(0, 4)}...
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
