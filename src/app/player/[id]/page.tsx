'use client';

import React, { useState, use } from 'react';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { PlayerIcon } from '@/components/ui/PlayerIcon';

// New Components
import { StatusCard } from '@/components/home/StatusCard';
import { ActionTabs } from '@/components/home/ActionTabs';
import { RankingList } from '@/components/home/RankingList';

// Standard Imports for Components (Client Components)
import WorldStatus from '@/components/hud/WorldStatus';
import DisasterAlert from '@/components/effects/DisasterAlert';
import BankTerminal from '@/components/banking/BankTerminal';

export default function PlayerHome({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { gameState, currentUser } = useGame();
    const [showBank, setShowBank] = useState(false);
    const [newName, setNewName] = useState('');
    const [isEditingName, setIsEditingName] = useState(false);

    if (!gameState || !currentUser) return <div className="p-8 text-center">Loading world data...</div>;

    const handleBankAction = async (type: string, details: any) => {
        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, requesterId: currentUser.id, details })
            });
            const data = await res.json();
            if (data.success) {
                if (data.message) alert(data.message);
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

    return (
        <div className="flex flex-col gap-6 max-w-xl mx-auto pb-20">
            <DisasterAlert gameState={gameState} />

            {/* Header Area */}
            <div className="flex justify-between items-center px-2">
                <WorldStatus gameState={gameState} />
            </div>

            {/* Player Identity & Status */}
            <div className="space-y-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-slate-200/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <PlayerIcon playerIcon={currentUser.playerIcon} playerName={currentUser.name} size={56} />
                        <div>
                            <div className="text-xs text-slate-500 font-bold mb-0.5">PLAYER</div>
                            <h1 className="text-xl font-black text-slate-800">{currentUser.name}</h1>
                        </div>
                    </div>
                    <Button size="sm" variant="ghost" className="rounded-full w-10 h-10 p-0" onClick={() => { setNewName(currentUser.name); setIsEditingName(true); }}>
                        ✎
                    </Button>
                </div>

                <StatusCard user={currentUser} showBank={() => setShowBank(true)} />
            </div>

            {/* Tabbed Actions */}
            <ActionTabs userId={currentUser.id} onOpenBank={() => setShowBank(true)} />

            {/* Ranking */}
            <RankingList users={gameState.users} currentUserId={currentUser.id} />

            {/* Modals */}
            <Modal isOpen={isEditingName} onClose={() => setIsEditingName(false)} title="名前を変更">
                <div className="flex flex-col gap-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">新しい名前</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="w-full p-3 border border-slate-300 rounded-xl font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="名前を入力してください"
                            onKeyDown={(e) => e.key === 'Enter' && handleNameChange()}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button fullWidth onClick={handleNameChange} className="bg-indigo-600 text-white font-bold h-12 rounded-xl">保存</Button>
                        <Button fullWidth variant="ghost" onClick={() => setIsEditingName(false)} className="h-12 rounded-xl">キャンセル</Button>
                    </div>
                </div>
            </Modal>

            {showBank && (
                <BankTerminal
                    user={currentUser}
                    economy={gameState.economy}
                    onClose={() => setShowBank(false)}
                    onAction={handleBankAction}
                />
            )}
        </div>
    );
}
