'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { useParams, useRouter } from 'next/navigation';
import { WebsiteEditor } from '@/components/shop-website/WebsiteEditor';
import { ShopWebsite } from '@/types';

export default function WebsiteEditPage() {
    const { gameState, currentUser } = useGame();
    const params = useParams();
    const router = useRouter();
    const playerId = params.id as string;

    // 認証チェック: 自分のページのみ編集可能
    if (!currentUser || currentUser.id !== playerId) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">アクセス拒否</h1>
                    <p className="text-gray-600">自分のホームページのみ編集できます</p>
                </div>
            </div>
        );
    }

    const handleSave = async (website: ShopWebsite) => {
        try {
            const response = await fetch('/api/action', {
                method: 'POST',
                body: JSON.stringify({
                    type: currentUser.shopWebsite ? 'update_website' : 'create_website',
                    requesterId: currentUser.id,
                    details: JSON.stringify(website)
                })
            });

            if (response.ok) {
                alert('ホームページを保存しました！');
                router.push(`/player/${playerId}/shop`);
                window.location.reload();
            } else {
                alert('保存に失敗しました');
            }
        } catch (error) {
            console.error('Save error:', error);
            alert('エラーが発生しました');
        }
    };

    return (
        <div className="pb-20">
            <WebsiteEditor
                currentWebsite={currentUser.shopWebsite}
                owner={currentUser}
                onSave={handleSave}
            />
        </div>
    );
}
