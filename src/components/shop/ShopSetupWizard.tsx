'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useGame } from '@/context/GameContext';

const TEMPLATES = [
    {
        id: 'simple',
        name: 'Simple Clean',
        description: '余計な装飾を排した、商品が際立つミニマルデザイン。',
        colors: { primary: '#3b82f6', secondary: '#f8fafc' },
        previewBg: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)'
    },
    {
        id: 'modern',
        name: 'Modern Dark',
        description: 'スタイリッシュで高級感のあるダークモード基調。',
        colors: { primary: '#1e293b', secondary: '#0f172a' },
        previewBg: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
    },
    {
        id: 'colorful',
        name: 'Pop & Colorful',
        description: '元気で明るい印象を与えるポップなデザイン。',
        colors: { primary: '#f472b6', secondary: '#fff1f2' },
        previewBg: 'linear-gradient(135deg, #fce7f3 0%, #fff1f2 100%)'
    },
    {
        id: 'elegant',
        name: 'Luxury Elegant',
        description: '上品で落ち着いた雰囲気のクラシックデザイン。',
        colors: { primary: '#d4af37', secondary: '#fafaf9' },
        previewBg: 'linear-gradient(135deg, #f5f5f4 0%, #e7e5e4 100%)'
    }
];

export const ShopSetupWizard = ({ onComplete }: { onComplete?: () => void }) => {
    const { currentUser, sendRequest } = useGame();
    const [step, setStep] = useState(1);
    const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
    const [formData, setFormData] = useState({
        shopName: currentUser?.shopName || '',
        description: '',
        primaryColor: TEMPLATES[0].colors.primary,
        secondaryColor: TEMPLATES[0].colors.secondary
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleTemplateSelect = (template: typeof TEMPLATES[0]) => {
        setSelectedTemplate(template);
        setFormData(prev => ({
            ...prev,
            primaryColor: template.colors.primary,
            secondaryColor: template.colors.secondary
        }));
    };

    const handleSubmit = async () => {
        if (!formData.shopName) {
            alert('ショップ名を入力してください');
            return;
        }
        if (!confirm('この内容でホームページを作成しますか？')) return;

        setIsSubmitting(true);
        try {
            await sendRequest('create_website', 0, {
                templateId: selectedTemplate.id,
                shopName: formData.shopName,
                description: formData.description,
                colors: {
                    primary: formData.primaryColor,
                    secondary: formData.secondaryColor
                }
            });
            alert('ホームページを作成しました！');
            if (onComplete) {
                onComplete();
            } else {
                // Force navigation/reload to ensure state is updated
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            alert('作成に失敗しました');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
            <Card className="max-w-4xl w-full mx-auto overflow-hidden shadow-2xl relative" padding="none">
                {/* Progress Bar */}
                <div className="h-2 bg-gray-100 w-full">
                    <motion.div
                        className="h-full bg-indigo-600"
                        initial={{ width: '0%' }}
                        animate={{ width: step === 1 ? '50%' : '100%' }}
                        transition={{ duration: 0.5 }}
                    />
                </div>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {step === 1 ? (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                            >
                                <h2 className="text-3xl font-black mb-2">🎨 デザインを選ぼう</h2>
                                <p className="text-gray-600 mb-8">お店の雰囲気に合ったテンプレートを選んでください。</p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    {TEMPLATES.map(template => (
                                        <motion.div
                                            key={template.id}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => handleTemplateSelect(template)}
                                            className={`
                                                cursor-pointer rounded-xl overflow-hidden border-4 transition-all
                                                ${selectedTemplate.id === template.id ? 'border-indigo-600 shadow-xl' : 'border-transparent opacity-70 hover:opacity-100'}
                                            `}
                                        >
                                            <div
                                                className="h-32 flex items-center justify-center text-2xl font-bold p-4 text-center"
                                                style={{ background: template.previewBg, color: template.id === 'modern' ? 'white' : 'black' }}
                                            >
                                                {template.name}
                                            </div>
                                            <div className="p-4 bg-white">
                                                <p className="text-sm text-gray-600">{template.description}</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={() => setStep(2)} size="lg" className="px-8 shadow-lg shadow-indigo-200">
                                        次へ進む →
                                    </Button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                            >
                                <h2 className="text-3xl font-black mb-2">📝 お店の基本情報</h2>
                                <p className="text-gray-600 mb-8">素敵なお店の名前と説明を入力してください。</p>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">ショップ名 <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={formData.shopName}
                                                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                                                className="w-full text-xl p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition"
                                                placeholder="例: 夢見雑貨店"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">お店の説明</label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none transition min-h-[120px]"
                                                placeholder="お店のコンセプトや特徴を書きましょう..."
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2">テーマカラー</label>
                                            <div className="flex gap-4">
                                                <div className="flex-1">
                                                    <label className="text-xs text-gray-500 mb-1 block">メインカラー</label>
                                                    <div className="flex gap-2 items-center">
                                                        <input
                                                            type="color"
                                                            value={formData.primaryColor}
                                                            onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                                                            className="h-10 w-10 rounded cursor-pointer border-none"
                                                        />
                                                        <span className="text-sm font-mono">{formData.primaryColor}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Live Preview */}
                                    <div className="bg-gray-100 rounded-2xl p-4 border-4 border-gray-200">
                                        <div className="text-xs font-bold text-gray-400 mb-2 text-center">PREVIEW</div>
                                        <div
                                            className="rounded-xl overflow-hidden shadow-lg bg-white min-h-[300px] flex flex-col"
                                            style={{ fontFamily: 'sans-serif' }}
                                        >
                                            {/* Header Preview */}
                                            <div
                                                className="p-4 text-white text-center"
                                                style={{ background: formData.primaryColor }}
                                            >
                                                <h3 className="font-bold text-lg">{formData.shopName || 'ショップ名'}</h3>
                                            </div>
                                            {/* Body Preview */}
                                            <div className="p-6 flex-1 bg-white">
                                                <div className="w-full h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center text-gray-300">
                                                    Header Image
                                                </div>
                                                <p className="text-sm text-gray-600 leading-relaxed">
                                                    {formData.description || 'ここにお店の説明文が表示されます。'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between pt-4 border-t border-gray-100">
                                    <Button onClick={() => setStep(1)} variant="secondary" size="lg">
                                        ← 戻る
                                    </Button>
                                    <Button
                                        onClick={handleSubmit}
                                        size="lg"
                                        disabled={isSubmitting || !formData.shopName}
                                        className="px-8 shadow-lg shadow-green-200 bg-green-500 hover:bg-green-600 text-white"
                                    >
                                        ✨ ホームページ作成！
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </Card>
        </div>
    );
};
