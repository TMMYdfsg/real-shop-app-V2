'use client';

import React from 'react';
import { ShopWebsite, User } from '@/types';
import { motion } from 'framer-motion';

interface TemplateProps {
    website: ShopWebsite;
    owner: User;
}

export const ElegantTemplate: React.FC<TemplateProps> = ({ website, owner }) => {
    const { customization } = website;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* エレガントなヘッダー */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="relative py-24 px-8"
                style={{
                    background: `linear-gradient(to bottom, ${customization.primaryColor || '#1e293b'}, ${customization.secondaryColor || '#334155'})`
                }}
            >
                <div className="max-w-4xl mx-auto text-center text-white">
                    <motion.div
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6"
                    >
                        <div className="inline-block border-b-2 border-white/30 pb-2">
                            <h1 className="text-5xl md:text-6xl font-serif font-light tracking-wider">
                                {owner.shopName || owner.name}
                            </h1>
                        </div>
                    </motion.div>
                    {customization.welcomeMessage && (
                        <motion.p
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-lg md:text-xl font-serif italic text-white/90"
                        >
                            "{customization.welcomeMessage}"
                        </motion.p>
                    )}
                </div>
            </motion.div>

            {/* 説明セクション */}
            {customization.shopDescription && (
                <div className="max-w-4xl mx-auto px-8 py-16">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-white rounded-sm shadow-lg p-10 border-t-4"
                        style={{ borderColor: customization.primaryColor }}
                    >
                        <h2
                            className="text-3xl font-serif mb-8 pb-4 border-b-2"
                            style={{ borderColor: customization.primaryColor, color: customization.primaryColor }}
                        >
                            Our Story
                        </h2>
                        <p className="text-lg text-gray-700 leading-relaxed font-serif whitespace-pre-wrap">
                            {customization.shopDescription}
                        </p>
                    </motion.div>
                </div>
            )}

            {/* 商品セクション */}
            {customization.showProducts && owner.shopMenu && owner.shopMenu.length > 0 && (
                <div className="bg-white py-16">
                    <div className="max-w-6xl mx-auto px-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-center mb-12"
                        >
                            <h2
                                className="text-4xl font-serif mb-4 inline-block border-b-2 pb-2"
                                style={{ borderColor: customization.primaryColor, color: customization.primaryColor }}
                            >
                                Collections
                            </h2>
                        </motion.div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {owner.shopMenu.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1 + index * 0.1 }}
                                    className="group bg-white border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow"
                                >
                                    <div className="aspect-square flex items-center justify-center bg-gray-100 text-8xl">
                                        {item.emoji || '📦'}
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-serif text-gray-900 mb-4">
                                            {item.name}
                                        </h3>
                                        <div className="flex justify-between items-center border-t border-gray-200 pt-4">
                                            <span
                                                className="text-2xl font-serif"
                                                style={{ color: customization.primaryColor }}
                                            >
                                                ¥<span className="font-bold">{item.price.toLocaleString()}</span>
                                            </span>
                                            <span className={`text-xs font-semibold px-3 py-1 ${item.stock > 0 ? 'text-green-800 bg-green-100' : 'text-red-800 bg-red-100'}`}>
                                                {item.stock > 0 ? `在庫あり (${item.stock})` : '在庫切れ'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* クーポンセクション */}
            {customization.showCoupons && owner.coupons && owner.coupons.filter(c => c.expiresAt && new Date(c.expiresAt) > new Date()).length > 0 && (
                <div className="max-w-5xl mx-auto px-8 py-16">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.2 }}
                        className="text-center mb-12"
                    >
                        <h2
                            className="text-4xl font-serif mb-4 inline-block border-b-2 pb-2"
                            style={{ borderColor: customization.primaryColor, color: customization.primaryColor }}
                        >
                            Exclusive Offers
                        </h2>
                    </motion.div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {owner.coupons.filter(c => c.expiresAt && new Date(c.expiresAt) > new Date()).map((coupon, index) => (
                            <motion.div
                                key={coupon.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.3 + index * 0.1 }}
                                className="bg-white p-8 border-2 border-gray-300 relative overflow-hidden group hover:border-gray-400 transition-colors"
                            >
                                <div
                                    className="absolute top-0 right-0 w-24 h-24 opacity-10"
                                    style={{ backgroundColor: customization.primaryColor }}
                                />
                                <div className="relative">
                                    <div className="font-mono text-3xl font-bold mb-3 tracking-wider" style={{ color: customization.primaryColor }}>
                                        {coupon.code}
                                    </div>
                                    <div className="text-2xl font-serif mb-4">
                                        {`${coupon.discountPercent}% Discount`}
                                    </div>
                                    {coupon.maxUses && (
                                        <div className="text-sm text-gray-600 font-serif italic">
                                            Limited to {coupon.maxUses} uses
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* フッター */}
            <div
                className="py-8 text-center text-white"
                style={{ backgroundColor: customization.primaryColor || '#1e293b' }}
            >
                <p className="font-serif italic">
                    © {new Date().getFullYear()} {owner.shopName || owner.name}. All rights reserved.
                </p>
            </div>
        </div>
    );
};
