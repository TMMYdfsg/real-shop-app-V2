'use client';

import React from 'react';
import { ShopItem } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';

interface ProductDetailModalProps {
    item: ShopItem | null;
    isOpen: boolean;
    onClose: () => void;
    onPurchase?: (item: ShopItem) => void;
    canPurchase?: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
    item,
    isOpen,
    onClose,
    onPurchase,
    canPurchase = false
}) => {
    if (!item) return null;

    const handlePurchase = () => {
        if (onPurchase) {
            onPurchase(item);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="商品詳細">
            <div className="space-y-6">
                {/* 商品画像/絵文字 */}
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-8xl mb-4"
                    >
                        {item.emoji || '📦'}
                    </motion.div>
                </div>

                {/* 商品名 */}
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">{item.name}</h2>
                    {item.category && (
                        <span className="inline-block bg-gray-200 text-gray-800 text-xs px-3 py-1 rounded-full">
                            {item.category}
                        </span>
                    )}
                </div>

                {/* 価格情報 */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-700 font-semibold">販売価格</span>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-indigo-600">
                                {item.price.toLocaleString()}枚
                            </div>
                            {item.originalPrice && item.originalPrice !== item.price && (
                                <div className="text-sm text-gray-500 line-through">
                                    {item.originalPrice.toLocaleString()}枚
                                </div>
                            )}
                        </div>
                    </div>

                    {item.isSale && item.discount && (
                        <div className="text-center">
                            <span className="inline-block bg-red-500 text-white text-sm font-bold px-3 py-1 rounded">
                                {item.discount}% OFF セール中！
                            </span>
                        </div>
                    )}
                </div>

                {/* 在庫情報 */}
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="font-semibold text-gray-700">在庫数</span>
                    <span className={`text-xl font-bold ${item.stock === 0 ? 'text-red-500' : 'text-green-600'}`}>
                        {item.stock}個
                    </span>
                </div>

                {/* 仕入れ値（ショップオーナーの場合のみ表示） */}
                {item.cost !== undefined && (
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                        <span className="font-semibold text-gray-700">仕入れ値</span>
                        <span className="text-lg font-bold text-yellow-700">
                            {item.cost.toLocaleString()}枚
                        </span>
                    </div>
                )}

                {/* 商品説明（もし追加したい場合） */}
                {item.description && (
                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                        <h3 className="font-semibold text-gray-700 mb-2">商品説明</h3>
                        <p className="text-gray-600">{item.description}</p>
                    </div>
                )}

                {/* アクションボタン */}
                <div className="flex gap-3 pt-4">
                    <Button onClick={onClose} variant="secondary" fullWidth>
                        閉じる
                    </Button>
                    {canPurchase && onPurchase && (
                        <Button
                            onClick={handlePurchase}
                            variant="primary"
                            fullWidth
                            disabled={item.stock === 0}
                        >
                            {item.stock === 0 ? '在庫切れ' : '購入する'}
                        </Button>
                    )}
                </div>
            </div>
        </Modal>
    );
};
