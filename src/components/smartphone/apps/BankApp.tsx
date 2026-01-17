import React from 'react';
import { useGame } from '@/context/GameContext';
import BankTerminal from '@/components/banking/BankTerminal';

interface BankAppProps {
    onBack: () => void;
}

export const BankApp: React.FC<BankAppProps> = ({ onBack }) => {
    const { currentUser, gameState } = useGame();

    if (!currentUser || !gameState) return null;

    const handleAction = async (type: string, details: any) => {
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
            } else {
                alert(data.error || '処理に失敗しました');
            }
        } catch (e) {
            console.error(e);
            alert('通信エラー');
        }
    };

    return (
        <div className="h-full overflow-hidden">
            <BankTerminal
                user={currentUser}
                economy={gameState.economy}
                onClose={onBack}
                onAction={handleAction}
            />
        </div>
    );
};
