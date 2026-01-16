'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ConfigPage() {
    const { gameState, currentUser } = useGame();
    const [shopName, setShopName] = useState(currentUser?.shopName || currentUser?.name || '');
    const [cardType, setCardType] = useState<'point' | 'stamp'>(currentUser?.cardType || 'point');
    const [isSaving, setIsSaving] = useState(false);

    if (!currentUser) return <div>Loading...</div>;

    const handleSave = async () => {
        setIsSaving(true);
        await fetch('/api/action', {
            method: 'POST',
            body: JSON.stringify({
                type: 'update_profile',
                requesterId: currentUser.id,
                amount: 0,
                details: JSON.stringify({ shopName, cardType })
            })
        });
        alert('保存しました');
        setIsSaving(false);
        // dataStoreの更新を反映させるためにリロード等はContext依存だが、簡易的にはこれでOK
        window.location.reload();
    };

    return (
        <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>ショップ設定</h2>

            <Card padding="lg">
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>お店の名前</label>
                    <input
                        type="text"
                        value={shopName}
                        onChange={(e) => setShopName(e.target.value)}
                        style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                        placeholder="例: トモヤの雑貨屋さん"
                    />
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.3rem' }}>
                        ※ 他のプレイヤーから見たときに表示される名前です。
                    </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>ポイントカードのデザイン</label>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="cardType"
                                value="point"
                                checked={cardType === 'point'}
                                onChange={() => setCardType('point')}
                            />
                            数値タイプ (Pt)
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                                type="radio"
                                name="cardType"
                                value="stamp"
                                checked={cardType === 'stamp'}
                                onChange={() => setCardType('stamp')}
                            />
                            スタンプタイプ (個数)
                        </label>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.3rem' }}>
                        ※ 「数値タイプ」は 1200pt のように数字で表示。<br />
                        ※ 「スタンプタイプ」はハンコが押されるデザイン。
                    </p>
                </div>

                <Button onClick={handleSave} disabled={isSaving}>
                    保存する
                </Button>
            </Card>
        </div>
    );
}
