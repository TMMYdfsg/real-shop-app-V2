'use client';

import React from 'react';
import { ShopWebsite, User } from '@/types';
import { motion } from 'framer-motion';

interface TemplateProps {
    website: ShopWebsite;
    owner: User;
}

export const SimpleTemplate: React.FC<TemplateProps> = ({ website, owner }) => {
    const { customization } = website;

    return (
        <div
            className="min-h-screen p-8"
            style={{ backgroundColor: customization.secondaryColor || '#f9fafb' }}
        >
            {/* ヘッダー */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-12"
            >
                <h1
                    className="text-4xl font-bold mb-2"
                    style={{ color: customization.primaryColor || '#1f2937' }}
                >
                    {owner.shopName || owner.name}の店
                </h1>
                {customization.welcomeMessage && (
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        {customization.welcomeMessage}
                    </p>
                )}
            </motion.div>

            {/* 説明セクション */}
            {customization.shopDescription && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="max-w-3xl mx-auto mb-12"
                >
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <h2
                            className="text-2xl font-semibold mb-4"
                            style={{ color: customization.primaryColor }}
                        >
                            お店について
                        </h2>
                        <p className="text-gray-700 whitespace-pre-wrap">
                            {customization.shopDescription}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* 商品セクション */}
            {customization.showProducts && owner.shopMenu && owner.shopMenu.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="max-w-5xl mx-auto mb-12"
                >
                    <h2
                        className="text-2xl font-semibold mb-6 text-center"
                        style={{ color: customization.primaryColor }}
                    >
                        商品一覧
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {owner.shopMenu.map((item) => (
                            <div
                                key={item.id}
                                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                    <div className="text-2xl">{item.emoji || '📦'}</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-2xl font-bold" style={{ color: customization.primaryColor }}>
                                        ¥{item.price}
                                    </span>
                                    <span className={`text-sm ${item.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        在庫: {item.stock}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* クーポンセクション */}
            {customization.showCoupons && owner.coupons && owner.coupons.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="max-w-3xl mx-auto"
                >
                    <h2
                        className="text-2xl font-semibold mb-6 text-center"
                        style={{ color: customization.primaryColor }}
                    >
                        クーポン
                    </h2>
                    <div className="space-y-4">
                        {owner.coupons.filter(c => c.expiresAt && new Date(c.expiresAt) > new Date()).map((coupon) => (
                            <div
                                key={coupon.id}
                                className="bg-white rounded-lg shadow-sm p-4 border-2"
                                style={{ borderColor: customization.primaryColor }}
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{coupon.code}</h3>
                                        <p className="text-sm text-gray-600">
                                            {`${coupon.discountPercent}% OFF`}
                                        </p>
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {coupon.maxUses && `残り${coupon.maxUses}回`}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};
