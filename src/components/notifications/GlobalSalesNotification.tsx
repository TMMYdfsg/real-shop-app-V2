'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useGame } from '@/context/GameContext'; // GameContextを使用

interface SaleNotification {
    id: string;
    itemName: string;
    price: number;
    buyerName: string;
    timestamp: number;
}

export const GlobalSalesNotification: React.FC = () => {
    const { gameState, currentUser } = useGame();
    const transactions = currentUser?.transactions;

    const [notifications, setNotifications] = useState<SaleNotification[]>([]);
    const prevLength = useRef(transactions?.length || 0);

    // 初回レンダリング時の同期
    useEffect(() => {
        if (transactions && prevLength.current === 0 && transactions.length > 0) {
            prevLength.current = transactions.length;
        }
    }, [transactions]);

    useEffect(() => {
        if (!transactions || !gameState || !currentUser) return;

        // 新しい取引をチェック
        if (transactions.length > prevLength.current) {
            const newTransactions = transactions.slice(prevLength.current);

            newTransactions.forEach(trans => {
                // 売上（プレイヤーまたはNPCが購入）の場合
                // descriptionに '売上' が含まれていれば対象とする
                if (trans.type === 'income' && trans.description?.includes('売上')) {
                    const buyer = gameState.users.find(u => u.id === trans.senderId);

                    // 商品名を抽出
                    let itemName = trans.description;
                    if (itemName.includes('売上:')) {
                        itemName = itemName.replace('売上: ', '');
                    }

                    // 購入者名を決定
                    let buyerName = '匿名';
                    if (buyer) {
                        buyerName = buyer.name;
                    } else if (trans.senderId === 'customer_sim') {
                        buyerName = '一般客 👥';
                    } else if (trans.description?.includes('NPC')) {
                        buyerName = 'NPCゲスト 👤';
                    } else {
                        // NPC IDからの検索 (activeNPCsまたはテンプレートから名前解決できればベストだが、ここではdescription依存)
                        const npcNameMatch = trans.description.match(/売上: (.*?)が/);
                        if (npcNameMatch) {
                            buyerName = npcNameMatch[1] + ' 👤';
                        }
                    }

                    const notification: SaleNotification = {
                        id: trans.id,
                        itemName,
                        price: trans.amount,
                        buyerName,
                        timestamp: trans.timestamp
                    };

                    setNotifications(prev => [...prev, notification]);

                    // 5秒後に自動削除
                    setTimeout(() => {
                        setNotifications(prev => prev.filter(n => n.id !== trans.id));
                    }, 5000);
                }
            });
        }

        prevLength.current = transactions.length;
    }, [transactions, gameState, currentUser]);

    return (
        <div style={{
            position: 'fixed',
            top: '80px', // 少し上に
            right: '20px',
            zIndex: 9999,
            maxWidth: '300px',
            pointerEvents: 'none'
        }}>
            <AnimatePresence>
                {notifications.map((notif, idx) => (
                    <motion.div
                        key={notif.id}
                        initial={{ x: 300, opacity: 0, scale: 0.8 }}
                        animate={{
                            x: 0,
                            opacity: 1,
                            scale: 1,
                            y: idx * 80 // 少し詰める
                        }}
                        exit={{
                            x: 300,
                            opacity: 0,
                            scale: 0.8
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 25
                        }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            background: 'white',
                            color: '#1f2937', // gray-800
                            padding: '12px',
                            borderRadius: '12px',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            borderLeft: '6px solid #10b981', // green-500
                            pointerEvents: 'auto',
                            width: '280px',
                            marginBottom: '10px'
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">💰</div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-sm truncate">{notif.itemName}</div>
                                <div className="text-xs text-gray-500 truncate">購入者: {notif.buyerName}</div>
                            </div>
                            <div className="font-bold text-green-600">
                                +{notif.price.toLocaleString()}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
