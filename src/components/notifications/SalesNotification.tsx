'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { Transaction, GameState } from '@/types';

interface SaleNotification {
    id: string;
    itemName: string;
    price: number;
    buyerName: string;
    timestamp: number;
}

interface SalesNotificationManagerProps {
    transactions?: Transaction[];
    currentUserId?: string;
    gameState?: GameState;
}

export const SalesNotificationManager: React.FC<SalesNotificationManagerProps> = ({
    transactions,
    currentUserId,
    gameState
}) => {
    const [notifications, setNotifications] = useState<SaleNotification[]>([]);
    const prevLength = useRef(transactions?.length || 0);

    useEffect(() => {
        if (!transactions || !gameState || !currentUserId) return;

        // Skip initial load
        if (prevLength.current === 0 && transactions.length > 0) {
            prevLength.current = transactions.length;
            return;
        }

        // 新しい取引をチェック
        if (transactions.length > prevLength.current) {
            const newTransactions = transactions.slice(prevLength.current);

            newTransactions.forEach(trans => {
                // 売上（プレイヤーまたはNPCが購入）の場合
                if (trans.type === 'income' && (trans.description?.includes('売上:') || trans.description?.includes('NPC') || trans.description?.includes('から'))) {
                    const buyer = gameState.users.find(u => u.id === trans.senderId);

                    // 商品名を抽出
                    let itemName = trans.description || '不明な商品';
                    if (itemName.includes('売上:')) {
                        itemName = itemName.replace('売上: ', '');
                    }

                    // 購入者名を決定
                    let buyerName = '匿名';
                    if (buyer) {
                        buyerName = buyer.name;
                    } else if (trans.description?.includes('NPC')) {
                        buyerName = 'NPCゲスト 👤';
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
    }, [transactions, gameState, currentUserId]);

    return (
        <div style={{
            position: 'fixed',
            top: '100px',
            right: '20px',
            zIndex: 9999,
            maxWidth: '300px',
            pointerEvents: 'none'
        }}>
            <AnimatePresence>
                {notifications.map((notif, idx) => (
                    <motion.div
                        key={notif.id}
                        initial={{ x: 400, opacity: 0, scale: 0.5 }}
                        animate={{
                            x: 0,
                            opacity: 1,
                            scale: 1,
                            y: idx * 100
                        }}
                        exit={{
                            x: 400,
                            opacity: 0,
                            scale: 0.5
                        }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 20
                        }}
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            padding: '1rem',
                            borderRadius: '12px',
                            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4)',
                            border: '2px solid rgba(255,255,255,0.3)',
                            pointerEvents: 'auto'
                        }}
                    >
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 0.5,
                                repeat: Infinity,
                                repeatDelay: 1
                            }}
                            style={{ fontSize: '2rem', textAlign: 'center' }}
                        >
                            🎉💰
                        </motion.div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginTop: '0.5rem' }}>
                            商品が売れました！
                        </div>
                        <div style={{ fontSize: '0.9rem', marginTop: '0.25rem' }}>
                            {notif.itemName}
                        </div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                            購入者: {notif.buyerName}
                        </div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.5rem', color: '#fde047' }}>
                            +{notif.price.toLocaleString()}枚
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};
