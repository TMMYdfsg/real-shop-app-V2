'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function FinancePage() {
    const [grantAmount, setGrantAmount] = useState(1000);
    const [isLoading, setIsLoading] = useState(false);

    const handleGrant = async () => {
        if (!confirm(`全プレイヤーに ${grantAmount} 枚を配布しますか？\n（この操作は元に戻せません）`)) return;

        setIsLoading(true);
        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'distribute_grant',
                    amount: grantAmount,
                    message: '臨時給付金'
                })
            });
            const data = await res.json();
            if (data.success) {
                alert('配布しました！');
            } else {
                alert('エラー: ' + data.error);
            }
        } catch (e) {
            console.error(e);
            alert('通信エラー');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">財務・給付金管理</h2>

            <div className="grid gap-6">
                <Card title="💰 全員に給付金を配布">
                    <p className="text-gray-600 mb-4">
                        すべてのプレイヤー(銀行員を除く)に一律で現金を配布します。<br />
                        景気刺激策や、ゲームバランスの調整に使用してください。
                    </p>

                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-bold mb-2">配布金額 (枚)</label>
                            <input
                                type="number"
                                value={grantAmount}
                                onChange={(e) => setGrantAmount(Number(e.target.value))}
                                className="w-full p-2 border rounded text-lg"
                                min="100"
                                step="100"
                            />
                        </div>
                        <Button
                            onClick={handleGrant}
                            disabled={isLoading}
                            variant="primary"
                        >
                            {isLoading ? '処理中...' : '配布を実行する'}
                        </Button>
                    </div>
                </Card>

                <Card title="📊 経済レポート (未実装)">
                    <p className="text-gray-400">
                        市場に出回っている通貨総量や、インフレ率などをここに表示する予定です。
                    </p>
                </Card>
            </div>
        </div>
    );
}
