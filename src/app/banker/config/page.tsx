'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ConfigPage() {
    const [isLoading, setIsLoading] = useState(false);

    const handleResetGame = async () => {
        if (!confirm('【警告】本当にゲームを初期化しますか？\n全プレイヤーの所持金、借金、株、履歴などが全て消去されます。\nこの操作は取り消せません。')) {
            return;
        }
        if (!confirm('完了するにはもう一度OKを押してください。\n本当に実行しますか？')) {
            return;
        }

        setIsLoading(true);
        try {
            await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reset_game' }),
            });
            alert('ゲームデータを初期化しました。');
        } catch (error) {
            console.error(error);
            alert('初期化に失敗しました。');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                ⚙️ システム設定
            </h1>

            <Card padding="lg" style={{ border: '2px solid #ef4444', background: '#fff5f5' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ⚠️ デンジャラスゾーン (Dangerous Zone)
                </h2>
                <p style={{ marginBottom: '1.5rem', color: '#444' }}>
                    ここでの操作はゲーム全体に影響を与え、取り消しができません。慎重に操作してください。
                </p>

                <div style={{ padding: '1rem', border: '1px solid #f87171', borderRadius: '0.5rem', background: 'white' }}>
                    <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>ゲームデータの初期化</h3>
                    <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
                        ユーザーアカウント以外の全てのデータ（所持金、借金、株価、履歴など）を初期状態に戻します。
                        新しいゲームを開始する場合に使用してください。
                    </p>
                    <Button
                        variant="danger"
                        onClick={handleResetGame}
                        disabled={isLoading}
                        style={{ width: '100%', padding: '1rem', fontWeight: 'bold' }}
                    >
                        {isLoading ? '処理中...' : '💣 ゲームを初期化する'}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
