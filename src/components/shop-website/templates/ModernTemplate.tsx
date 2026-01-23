'use client';

import React from 'react';
import { ShopWebsite, User } from '@/types';
import { motion } from 'framer-motion';

interface TemplateProps {
    website: ShopWebsite;
    owner: User;
}

export const ModernTemplate: React.FC<TemplateProps> = ({ website, owner }) => {
    const { customization } = website;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
            {/* ヒーローセクション */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative overflow-hidden"
                style={{
                    background: `linear-gradient(135deg, ${customization.primaryColor || '#6366f1'}, ${customization.secondaryColor || '#8b5cf6'})`
                }}
            >
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0 bg-[url('/grid.svg')]" />
                </div>
                <div className="relative px-8 py-24 text-center">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-5xl md:text-6xl font-bold mb-4 drop-shadow-lg"
                    >
                        {owner.shopName || owner.name}
                    </motion.h1>
                    {customization.welcomeMessage && (
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90"
                        >
                            {customization.welcomeMessage}
                        </motion.p>
                    )}
                </div>
            </motion.div>

            {/* 説明セクション */}
            {customization.shopDescription && (
                <div className="max-w-4xl mx-auto px-8 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
                    >
                        <h2
                            className="text-3xl font-bold mb-6"
                            style={{ color: customization.primaryColor }}
                        >
                            About Us
                        </h2>
                        <p className="text-lg text-gray-300 whitespace-pre-wrap">
                            {customization.shopDescription}
                        </p>
                    </motion.div>
                </div>
            )}

            {/* 商品グリッド */}
            {customization.showProducts && owner.shopMenu && owner.shopMenu.length > 0 && (
                <div className="max-w-7xl mx-auto px-8 py-16">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-4xl font-bold mb-12 text-center"
                        style={{ color: customization.primaryColor }}
                    >
                        Our Products
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {owner.shopMenu.map((item, index) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                                className="group relative bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/40 transition-all hover:scale-105"
                            >
                                <div className="text-5xl mb-4 text-center">{item.emoji || '📦'}</div>
                                <h3 className="text-xl font-bold text-center mb-2">{item.name}</h3>
                                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/20">
                                    <span className="text-3xl font-bold" style={{ color: customization.primaryColor }}>
                                        {item.price}枚
                                    </span>
                                    <span className={`text-sm px-3 py-1 rounded-full ${item.stock > 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                        {item.stock > 0 ? `在庫 ${item.stock}` : '売り切れ'}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* クーポンセクション */}
            {customization.showCoupons && owner.coupons && owner.coupons.filter(c => c.expiresAt && new Date(c.expiresAt) > new Date()).length > 0 && (
                <div className="max-w-4xl mx-auto px-8 py-16">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-4xl font-bold mb-12 text-center"
                        style={{ color: customization.primaryColor }}
                    >
                        Special Offers
                    </motion.h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {owner.coupons.filter(c => c.expiresAt && new Date(c.expiresAt) > new Date()).map((coupon) => (
                            <motion.div
                                key={coupon.id}
                                whileHover={{ scale: 1.05 }}
                                className="bg-gradient-to-r p-6 rounded-2xl border-2 border-white/30"
                                style={{
                                    background: `linear-gradient(135deg, ${customization.primaryColor}40, ${customization.secondaryColor}40)`
                                }}
                            >
                                <div className="text-center">
                                    <div className="text-4xl font-black mb-2">{coupon.code}</div>
                                    <div className="text-lg text-white/90 mt-2">クーポンコード</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
