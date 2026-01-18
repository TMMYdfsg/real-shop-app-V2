'use client';

import React, { useState } from 'react';
import { ShopWebsite, User } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { SimpleTemplate } from './templates/SimpleTemplate';
import { ModernTemplate } from './templates/ModernTemplate';
import { ColorfulTemplate } from './templates/ColorfulTemplate';
import { ElegantTemplate } from './templates/ElegantTemplate';

interface WebsiteEditorProps {
    currentWebsite?: ShopWebsite;
    owner: User;
    onSave: (website: ShopWebsite) => void;
}

type TemplateType = 'simple' | 'modern' | 'colorful' | 'elegant';

export const WebsiteEditor: React.FC<WebsiteEditorProps> = ({ currentWebsite, owner, onSave }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>(
        (currentWebsite?.templateId as TemplateType) || 'simple'
    );
    const [primaryColor, setPrimaryColor] = useState(currentWebsite?.customization.primaryColor || '#6366f1');
    const [secondaryColor, setSecondaryColor] = useState(currentWebsite?.customization.secondaryColor || '#8b5cf6');
    const [welcomeMessage, setWelcomeMessage] = useState(currentWebsite?.customization.welcomeMessage || '');
    const [shopDescription, setShopDescription] = useState(currentWebsite?.customization.shopDescription || '');
    const [showProducts, setShowProducts] = useState(currentWebsite?.customization.showProducts ?? true);
    const [showCoupons, setShowCoupons] = useState(currentWebsite?.customization.showCoupons ?? true);
    const [layout, setLayout] = useState<'single' | 'grid' | 'list'>(currentWebsite?.customization.layout || 'grid');
    const [isPublished, setIsPublished] = useState(currentWebsite?.isPublished ?? false);

    const [previewMode, setPreviewMode] = useState(false);

    const templates = [
        { id: 'simple' as const, name: 'シンプル', emoji: '📄', description: 'クリーンで読みやすい' },
        { id: 'modern' as const, name: 'モダン', emoji: '✨', description: 'スタイリッシュで洗練された' },
        { id: 'colorful' as const, name: 'カラフル', emoji: '🎨', description: 'ポップで元気な' },
        { id: 'elegant' as const, name: 'エレガント', emoji: '👔', description: '高級感のある' }
    ];

    const handleSave = () => {
        const website: ShopWebsite = {
            id: currentWebsite?.id || `website-${Date.now()}`,
            ownerId: owner.id,
            templateId: selectedTemplate,
            customization: {
                primaryColor,
                secondaryColor,
                welcomeMessage,
                shopDescription,
                showProducts,
                showCoupons,
                layout
            },
            isPublished,
            createdAt: currentWebsite?.createdAt || Date.now(),
            updatedAt: Date.now()
        };
        onSave(website);
    };

    const previewWebsite: ShopWebsite = {
        id: currentWebsite?.id || `website-${Date.now()}`,
        ownerId: owner.id,
        templateId: selectedTemplate,
        customization: {
            primaryColor,
            secondaryColor,
            welcomeMessage,
            shopDescription,
            showProducts,
            showCoupons,
            layout
        },
        isPublished,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };

    const renderTemplate = () => {
        const props = { website: previewWebsite, owner };
        switch (selectedTemplate) {
            case 'simple':
                return <SimpleTemplate {...props} />;
            case 'modern':
                return <ModernTemplate {...props} />;
            case 'colorful':
                return <ColorfulTemplate {...props} />;
            case 'elegant':
                return <ElegantTemplate {...props} />;
        }
    };

    if (previewMode) {
        return (
            <div>
                <div className="mb-4 flex justify-between items-center bg-gray-900 text-white p-4 rounded-lg">
                    <h2 className="text-xl font-bold">プレビューモード</h2>
                    <Button onClick={() => setPreviewMode(false)}>編集に戻る</Button>
                </div>
                {renderTemplate()}
            </div>
        );
    }

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* 編集パネル */}
            <div>
                <motion.h2
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-2xl font-bold mb-6"
                >
                    🎨 ホームページ編集
                </motion.h2>

                {/* テンプレート選択 */}
                <Card padding="lg" className="mb-6">
                    <h3 className="text-lg font-bold mb-4">テンプレート選択</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {templates.map((template) => (
                            <motion.div
                                key={template.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedTemplate(template.id)}
                                className={`
                                    cursor-pointer p-4 rounded-lg border-2 transition-all
                                    ${selectedTemplate === template.id
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                    }
                                `}
                            >
                                <div className="text-3xl mb-2 text-center">{template.emoji}</div>
                                <div className="text-center font-semibold">{template.name}</div>
                                <div className="text-xs text-gray-600 text-center mt-1">
                                    {template.description}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Card>

                {/* カラー設定 */}
                <Card padding="lg" className="mb-6">
                    <h3 className="text-lg font-bold mb-4">カラー設定</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                プライマリカラー
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-300"
                                />
                                <input
                                    type="text"
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="#6366f1"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                セカンダリカラー
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={secondaryColor}
                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                    className="w-16 h-16 rounded-lg cursor-pointer border-2 border-gray-300"
                                />
                                <input
                                    type="text"
                                    value={secondaryColor}
                                    onChange={(e) => setSecondaryColor(e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="#8b5cf6"
                                />
                            </div>
                        </div>
                    </div>
                </Card>

                {/* テキスト設定 */}
                <Card padding="lg" className="mb-6">
                    <h3 className="text-lg font-bold mb-4">テキスト設定</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                ウェルカムメッセージ
                            </label>
                            <input
                                type="text"
                                value={welcomeMessage}
                                onChange={(e) => setWelcomeMessage(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                placeholder="ようこそ！"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                ショップ説明
                            </label>
                            <textarea
                                value={shopDescription}
                                onChange={(e) => setShopDescription(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg h-24 resize-none"
                                placeholder="お店の紹介文を入力..."
                            />
                        </div>
                    </div>
                </Card>

                {/* 表示設定 */}
                <Card padding="lg" className="mb-6">
                    <h3 className="text-lg font-bold mb-4">表示設定</h3>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showProducts}
                                onChange={(e) => setShowProducts(e.target.checked)}
                                className="w-5 h-5"
                            />
                            <span>商品を表示</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showCoupons}
                                onChange={(e) => setShowCoupons(e.target.checked)}
                                className="w-5 h-5"
                            />
                            <span>クーポンを表示</span>
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={isPublished}
                                onChange={(e) => setIsPublished(e.target.checked)}
                                className="w-5 h-5"
                            />
                            <span className="font-semibold">ホームページを公開</span>
                        </label>
                    </div>
                </Card>

                {/* アクションボタン */}
                <div className="space-y-3">
                    <Button onClick={() => setPreviewMode(true)} className="w-full">
                        👁️ プレビュー
                    </Button>
                    <Button onClick={handleSave} className="w-full">
                        💾 保存
                    </Button>
                </div>
            </div>

            {/* リアルタイムプレビュー */}
            <div className="hidden lg:block">
                <h2 className="text-2xl font-bold mb-6">リアルタイムプレビュー</h2>
                <div className="border-4 border-gray-300 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-2 text-xs text-gray-600 text-center">
                        プレビュー（実際のサイズとは異なる場合があります）
                    </div>
                    <div className="h-[600px] overflow-y-auto">
                        {renderTemplate()}
                    </div>
                </div>
            </div>
        </div>
    );
};
