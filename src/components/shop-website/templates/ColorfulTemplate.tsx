'use client';

import React from 'react';
import { ShopWebsite, User } from '@/types';
import { motion } from 'framer-motion';

interface TemplateProps {
    website: ShopWebsite;
    owner: User;
}

export const ColorfulTemplate: React.FC<TemplateProps> = ({ website, owner }) => {
    const { customization } = website;

    return (
        <div
            className="min-h-screen p-8"
            style={{
                background: `linear-gradient(180deg, ${customization.secondaryColor || '#fef3c7'} 0%, ${customization.primaryColor || '#fbbf24'} 100%)`
            }}
        >
            {/* ポップなヘッダー */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-center mb-12"
            >
                <div className="inline-block bg-white rounded-full px-12 py-6 shadow-2xl transform -rotate-2 mb-4">
                    <h1 className="text-5xl font-black" style={{ color: customization.primaryColor }}>
                        {owner.shopName || owner.name}
                    </h1>
                </div>
                {customization.welcomeMessage && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block bg-white rounded-3xl px-8 py-4 shadow-xl transform rotate-1"
                    >
                        <p className="text-xl font-semibold text-gray-700">
                            {customization.welcomeMessage}
                        </p>
                    </motion.div>
                )}
            </motion.div>

            {/* 説明 */}
            {customization.shopDescription && (
                <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="max-w-3xl mx-auto mb-12"
                >
                    <div className="bg-white rounded-3xl shadow-2xl p-8 border-4 border-gray-900 transform -rotate-1">
                        <h2
                            className="text-3xl font-black mb-4 inline-block px-4 py-2 rounded-lg"
                            style={{
                                backgroundColor: customization.primaryColor,
                                color: 'white'
                            }}
                        >
                            🎉 お店について
                        </h2>
                        <p className="text-lg text-gray-800 whitespace-pre-wrap font-medium">
                            {customization.shopDescription}
                        </p>
                    </div>
                </motion.div>
            )}

            {/* カラフルな商品カード */}
            {customization.showProducts && owner.shopMenu && owner.shopMenu.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="max-w-6xl mx-auto mb-12"
                >
                    <div className="text-center mb-8">
                        <h2 className="inline-block text-4xl font-black bg-white rounded-full px-10 py-4 shadow-xl border-4 border-gray-900"
                            style={{ color: customization.primaryColor }}
                        >
                            🛍️ 商品
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {owner.shopMenu.map((item, index) => {
                            const rotation = index % 2 === 0 ? 'rotate-1' : '-rotate-1';
                            return (
                                <motion.div
                                    key={item.id}
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ delay: 0.7 + index * 0.1, type: 'spring' }}
                                    whileHover={{ scale: 1.1, rotate: 0 }}
                                    className={`bg-white rounded-3xl p-6 shadow-2xl border-4 border-gray-900 transform ${rotation}`}
                                >
                                    <div className="text-6xl text-center mb-4">{item.emoji || '📦'}</div>
                                    <h3 className="text-2xl font-black text-center mb-4 text-gray-900">
                                        {item.name}
                                    </h3>
                                    <div className="flex justify-between items-center">
                                        <span
                                            className="text-3xl font-black px-4 py-2 rounded-full"
                                            style={{
                                                backgroundColor: customization.primaryColor,
                                                color: 'white'
                                            }}
                                        >
                                            ¥{item.price}
                                        </span>
                                        <span className={`text-sm font-bold px-3 py-1 rounded-full ${item.stock > 0 ? 'bg-green-400 text-green-900' : 'bg-red-400 text-red-900'}`}>
                                            在庫 {item.stock}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* クーポン */}
            {customization.showCoupons && owner.coupons && owner.coupons.filter(c => c.expiresAt && new Date(c.expiresAt) > new Date()).length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="text-center mb-8">
                        <h2 className="inline-block text-4xl font-black bg-white rounded-full px-10 py-4 shadow-xl border-4 border-gray-900"
                            style={{ color: customization.primaryColor }}
                        >
                            🎁 クーポン
                        </h2>
                    </div>
                    <div className="space-y-6">
                        {owner.coupons.filter(c => c.expiresAt && new Date(c.expiresAt) > new Date()).map((coupon, index) => (
                            <motion.div
                                key={coupon.id}
                                initial={{ x: index % 2 === 0 ? -100 : 100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.9 + index * 0.1 }}
                                className="bg-white rounded-3xl p-6 shadow-2xl border-4 border-dashed border-gray-900 transform hover:scale-105 transition-transform"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div
                                            className="text-3xl font-black mb-2 inline-block px-4 py-2 rounded-lg"
                                            style={{
                                                backgroundColor: customization.primaryColor,
                                                color: 'white'
                                            }}
                                        >
                                            {coupon.code}
                                        </div>
                                        <p className="text-lg font-bold text-gray-900">クーポンコード</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </div>
    );
};
