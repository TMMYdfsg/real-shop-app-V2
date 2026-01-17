'use client';

import React from 'react';
import { useGame } from '@/context/GameContext';
import { useParams } from 'next/navigation';
import { WebsiteViewer } from '@/components/shop-website/WebsiteViewer';
import { motion } from 'framer-motion';

export default function WebsiteViewPage() {
    const { gameState } = useGame();
    const params = useParams();
    const playerId = params.id as string;

    const owner = gameState?.users.find(u => u.id === playerId);

    if (!owner) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl text-gray-600">プレイヤーが見つかりません</p>
            </div>
        );
    }

    if (!owner.shopWebsite) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="text-6xl mb-4">🚧</div>
                    <h1 className="text-2xl font-bold mb-2">ホームページ準備中</h1>
                    <p className="text-gray-600">
                        {owner.name || owner.shopName}さんはまだホームページを作成していません
                    </p>
                </motion.div>
            </div>
        );
    }

    if (!owner.shopWebsite.isPublished) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-bold mb-2">非公開</h1>
                    <p className="text-gray-600">
                        このホームページは現在非公開です
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div>
            <WebsiteViewer website={owner.shopWebsite} owner={owner} />
        </div>
    );
}
