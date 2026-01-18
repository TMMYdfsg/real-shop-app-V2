'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { useParams } from 'next/navigation';
import { PointExchangeManager } from '@/components/points/PointExchangeManager';
import { PointExchangeItem } from '@/types';

export default function PointExchangeManagePage() {
    const { currentUser } = useGame();
    const params = useParams();
    const playerId = params.id as string;

    if (!currentUser || currentUser.id !== playerId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl text-gray-600">アクセスできません</p>
            </div>
        );
    }

    const handleUpdate = async (items: PointExchangeItem[]) => {
        try {
            const response = await fetch('/api/action', {
                method: 'POST',
                body: JSON.stringify({
                    type: 'update_exchange_items',
                    requesterId: currentUser.id,
                    details: JSON.stringify(items)
                })
            });

            if (response.ok) {
                alert('更新しました！');
                window.location.reload();
            } else {
                alert('更新に失敗しました');
            }
        } catch (error) {
            console.error('Update error:', error);
            alert('エラーが発生しました');
        }
    };

    return (
        <div className="pb-20">
            <PointExchangeManager
                currentItems={currentUser.pointExchangeItems || []}
                onUpdate={handleUpdate}
                shopOwnerId={currentUser.id}
            />
        </div>
    );
}
