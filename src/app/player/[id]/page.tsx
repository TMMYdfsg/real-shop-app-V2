'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PlayerIcon } from '@/components/ui/PlayerIcon';

// Standard Imports for Components (Client Components)
import WorldStatus from '@/components/hud/WorldStatus';
import DisasterAlert from '@/components/effects/DisasterAlert';
import BankTerminal from '@/components/banking/BankTerminal';
import { Smartphone } from '@/components/smartphone/Smartphone';
import { JobBoardApp } from '@/components/smartphone/apps/JobBoardApp';
import { LifeStatusApp } from '@/components/smartphone/apps/LifeStatusApp';
import { AuditLogApp } from '@/components/smartphone/apps/AuditLogApp';
import { BankApp } from '@/components/smartphone/apps/BankApp';

export default function PlayerHome({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { gameState, currentUser } = useGame();
    const router = useRouter();
    const [showBank, setShowBank] = useState(false);
    const [newName, setNewName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);
    const [activeApp, setActiveApp] = useState<string | null>(null);

    if (!gameState || !currentUser) return <div>Loading...</div>;


    const handleOpenApp = (appId: string) => {
        if (appId === 'map') router.push(`/player/${id}/map`);
        else setActiveApp(appId);
    };

    const handleBankAction = async (type: string, details: any) => {
        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    requesterId: currentUser.id,
                    details
                })
            });
            const data = await res.json();
            if (data.success) {
                if (data.message) alert(data.message);
                // State update logic is handled by useGame hook polling usually
            } else {
                alert(data.error || '処理に失敗しました');
            }
        } catch (e) {
            console.error(e);
            alert('通信エラー');
        }
    };

    const handleNameChange = async () => {
        if (!newName.trim()) {
            alert('名前を入力してください');
            return;
        }

        try {
            await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'update_profile',
                    requesterId: currentUser.id,
                    details: JSON.stringify({ name: newName.trim() })
                })
            });
            setIsEditingName(false);
        } catch (error) {
            alert('名前の変更に失敗しました');
        }
    };

    // 売上ランキング
    const ranking = [...gameState.users]
        .filter(u => u.role === 'player')
        .sort((a, b) => b.balance - a.balance);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <DisasterAlert gameState={gameState} />

            {/* Header Area with Status */}
            <div className="flex justify-between items-start gap-2">
                <WorldStatus gameState={gameState} />
            </div>

            {/* Player Name Card */}
            <Card padding="md" style={{ background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)', border: '2px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <PlayerIcon playerIcon={currentUser.playerIcon} playerName={currentUser.name} size={64} />
                        <div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>プレイヤー名</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{currentUser.name}</div>
                        </div>
                    </div>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                            setNewName(currentUser.name);
                            setIsEditingName(true);
                        }}
                        style={{ fontSize: '1.2rem' }}
                    >
                        ✏️
                    </Button>
                </div>
            </Card>

            {/* Main Stats */}
            <Card className="glass-panel" padding="lg" style={{ background: 'linear-gradient(135deg, var(--accent-color), #818cf8)', color: 'white', border: 'none' }}>
                <div style={{ marginBottom: '0.5rem', opacity: 0.9 }}>現在の所持金</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                    {(currentUser.balance || 0).toLocaleString()} 枚
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>貯金</div>
                        <div style={{ fontWeight: 'bold' }}>{currentUser.deposit}</div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>借金</div>
                        <div style={{ fontWeight: 'bold' }}>{currentUser.debt}</div>
                    </div>
                </div>
            </Card>

            {/* Status */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <Card padding="sm" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem' }}>😊</div>
                    <div style={{ fontSize: '0.8rem' }}>幸福度</div>
                    <div style={{ fontWeight: 'bold' }}>{currentUser.happiness}</div>
                </Card>
                <Card padding="sm" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2rem' }}>⭐</div>
                    <div style={{ fontSize: '0.8rem' }}>人気度</div>
                    <div style={{ fontWeight: 'bold' }}>{currentUser.popularity}</div>
                </Card>
                <div style={{ cursor: 'pointer' }} onClick={() => setShowBank(true)}>
                    <Card padding="sm" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem' }}>📊</div>
                        <div style={{ fontSize: '0.8rem' }}>信用スコア</div>
                        <div style={{ fontWeight: 'bold' }}>{currentUser.creditScore || 500}</div>
                    </Card>
                </div>
            </div>

            {/* Ranking */}
            <h3 style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>お金持ちランキング</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {ranking.map((user, index) => (
                    <div key={user.id} className="glass-panel" style={{
                        padding: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        background: user.id === currentUser.id ? 'rgba(99, 102, 241, 0.1)' : 'var(--glass-bg)'
                    }}>
                        <div style={{ width: '30px', fontWeight: 'bold', fontSize: '1.2rem', textAlign: 'center', color: index === 0 ? '#fbbf24' : 'inherit' }}>
                            {index + 1}
                        </div>
                        <PlayerIcon playerIcon={user.playerIcon} playerName={user.name} size={40} />
                        <div style={{ flex: 1, fontWeight: user.id === currentUser.id ? 'bold' : 'normal' }}>
                            {user.name}
                            {user.id === currentUser.id && <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', color: 'var(--accent-color)' }}>(あなた)</span>}
                        </div>
                        <div style={{ fontWeight: 'bold' }}>{user.balance}枚</div>
                    </div>
                ))}
            </div>

            {/* Actions */}
            <div className="md:col-span-1 space-y-4">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="font-bold text-gray-700 mb-2">アクション</h2>
                    <div className="grid grid-cols-2 gap-2">
                        <Link href={`/player/${id}/map`} className="col-span-2">
                            <Button fullWidth className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-md transform transition-transform hover:scale-105">
                                🗺️ 街へ出る (マップ)
                            </Button>
                        </Link>

                        <Button
                            onClick={() => setShowBank(true)}
                            className="bg-blue-800 text-white hover:bg-blue-900 border border-blue-900 shadow-md transform transition-transform hover:scale-105 col-span-2"
                            fullWidth
                        >
                            🏦 銀行窓口へ
                        </Button>

                        <Link href={`/player/${id}/items`}>
                            <Button fullWidth variant="outline">持ち物/出品</Button>
                        </Link>
                        <Link href={`/player/${id}/shop`}>
                            <Button fullWidth variant="outline">ショップ経営</Button>
                        </Link>
                        <Link href={`/player/${id}/room`}>
                            <Button fullWidth variant="outline">マイルーム</Button>
                        </Link>
                        <Link href={`/player/${id}/gacha`}>
                            <Button fullWidth variant="outline">ガチャ</Button>
                        </Link>
                        <Link href={`/player/${id}/points`}>
                            <Button fullWidth variant="outline">ポイントカード</Button>
                        </Link>
                        <Link href={`/player/${id}/collection`}>
                            <Button fullWidth variant="secondary">図鑑</Button>
                        </Link>
                        <Link href={`/player/${id}/config`}>
                            <Button fullWidth variant="secondary">設定</Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Name Edit Modal */}
            <Modal isOpen={isEditingName} onClose={() => setIsEditingName(false)} title="名前を変更">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>新しい名前</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="名前を入力してください"
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid var(--glass-border)',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '1rem'
                            }}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') handleNameChange();
                            }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <Button fullWidth onClick={handleNameChange}>変更を保存</Button>
                        <Button fullWidth variant="ghost" onClick={() => setIsEditingName(false)}>キャンセル</Button>
                    </div>
                </div>
            </Modal>

            {/* Bank Terminal Modal */}
            {showBank && (
                <BankTerminal
                    user={currentUser}
                    economy={gameState.economy}
                    onClose={() => setShowBank(false)}
                    onAction={handleBankAction}
                />
            )}

            {/* Smartphone UI */}
            <Smartphone onOpenApp={handleOpenApp} />

            {/* App Modals */}
            <Modal isOpen={activeApp === 'job_board'} onClose={() => setActiveApp(null)} title="求人情報">
                <JobBoardApp onBack={() => setActiveApp(null)} />
            </Modal>
            <Modal isOpen={activeApp === 'status'} onClose={() => setActiveApp(null)} title="ライフステータス">
                <LifeStatusApp onBack={() => setActiveApp(null)} />
            </Modal>
            <Modal isOpen={activeApp === 'audit'} onClose={() => setActiveApp(null)} title="行動記録">
                <AuditLogApp onBack={() => setActiveApp(null)} />
            </Modal>
        </div>
    );
}
