'use client';

import React, { useMemo, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { COLLECTION_ITEMS, FURNITURE_CATALOG, PET_CATALOG, RECIPES } from '@/lib/gameData';
import type { InventoryItem } from '@/types';

type CollectionCategory = 'furniture' | 'pets' | 'recipes' | 'insects' | 'fossils' | 'cards' | 'all';
type CollectionCategoryKey = Exclude<CollectionCategory, 'all'>;
type GachaTicketType = 'normal' | 'rare' | 'ssr' | 'ur';

type CollectionDisplayItem = {
    id: string;
    type: CollectionCategoryKey;
    emoji: string;
    name: string;
    rarity: string;
};

export default function CollectionPage() {
    const { gameState, currentUser, refresh } = useGame();
    const params = useParams();
    const playerId = params.id as string;
    const [selectedCategory, setSelectedCategory] = useState<CollectionCategory>('all');
    const [gachaCategory, setGachaCategory] = useState<CollectionCategoryKey>('cards');
    const [ticketType, setTicketType] = useState<GachaTicketType>('normal');
    const [isRolling, setIsRolling] = useState(false);
    const [resultItem, setResultItem] = useState<any | null>(null);
    const [showResult, setShowResult] = useState(false);

    const player = gameState?.users.find(u => u.id === playerId);

    if (!player) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-xl text-gray-600">プレイヤーが見つかりません</p>
            </div>
        );
    }

    const resolveRarityByPrice = (price: number, thresholds: number[]) => {
        const [commonMax, rareMax, epicMax] = thresholds;
        if (price <= commonMax) return 'common';
        if (price <= rareMax) return 'rare';
        if (price <= epicMax) return 'epic';
        return 'legendary';
    };

    const rarityLabel = (rarity: string) => {
        if (rarity === 'legendary') return 'UR';
        if (rarity === 'epic') return 'SSR';
        if (rarity === 'rare') return 'SR';
        return 'R';
    };

    const rarityBadge = (rarity: string) => {
        if (rarity === 'legendary') return 'bg-yellow-100 text-yellow-700';
        if (rarity === 'epic') return 'bg-purple-100 text-purple-700';
        if (rarity === 'rare') return 'bg-blue-100 text-blue-700';
        return 'bg-slate-100 text-slate-600';
    };

    // コレクションデータ（inventory と catalog から派生）
    const catalog = gameState?.catalogInventory || [];
    const inventory = (player.inventory || []) as InventoryItem[];

    const detectCategory = (itemId: string): CollectionCategoryKey | 'other' => {
        const catalogItem = catalog.find(c => c.id === itemId);
        if (catalogItem) {
            if (catalogItem.category === 'furniture') return 'furniture';
            if (catalogItem.category === 'pet') return 'pets';
            if (catalogItem.category === 'ingredient') return 'recipes';
        }
        // Fallback: prefix-based detection
        if (itemId.startsWith('recipe_')) return 'recipes';
        if (itemId.startsWith('insect_')) return 'insects';
        if (itemId.startsWith('fossil_')) return 'fossils';
        return 'other';
    };

    const gachaCollection = player.gachaCollection || [];
    const gachaItemsById = new Map(COLLECTION_ITEMS.map(item => [item.id, item]));
    const collections: Record<CollectionCategoryKey, string[]> = {
        furniture: player.furniture || [],
        pets: player.pets || [],
        recipes: inventory.filter(i => detectCategory(i.itemId) === 'recipes').map(i => i.itemId),
        insects: gachaCollection.filter(id => gachaItemsById.get(id)?.type === 'insect'),
        fossils: gachaCollection.filter(id => gachaItemsById.get(id)?.type === 'fossil'),
        cards: gachaCollection.filter(id => gachaItemsById.get(id)?.type === 'card')
    };

    const categories = [
        { id: 'all' as const, name: 'すべて', emoji: '📦', count: Object.values(collections).flat().length },
        { id: 'furniture' as const, name: '家具', emoji: '🛋️', count: collections.furniture.length },
        { id: 'pets' as const, name: 'ペット', emoji: '🐶', count: collections.pets.length },
        { id: 'recipes' as const, name: 'レシピ', emoji: '📖', count: collections.recipes.length },
        { id: 'insects' as const, name: '昆虫', emoji: '🦋', count: collections.insects.length },
        { id: 'fossils' as const, name: '化石', emoji: '🦴', count: collections.fossils.length },
        { id: 'cards' as const, name: 'カード', emoji: '🎴', count: collections.cards.length }
    ];

    const itemMetaMap = useMemo(() => {
        const map = new Map<string, { name: string; emoji: string }>();
        FURNITURE_CATALOG.forEach((item) => {
            map.set(item.id, { name: item.name, emoji: item.emoji });
        });
        PET_CATALOG.forEach((item) => {
            map.set(item.id, { name: item.name, emoji: item.emoji });
        });
        RECIPES.forEach((item) => {
            map.set(item.id, { name: item.name, emoji: item.emoji });
        });
        COLLECTION_ITEMS.forEach((item) => {
            map.set(item.id, { name: item.name, emoji: item.emoji });
        });
        return map;
    }, []);

    const rarityMap = useMemo(() => {
        const map = new Map<string, string>();
        FURNITURE_CATALOG.forEach((item) => {
            map.set(item.id, resolveRarityByPrice(item.price || 0, [1000, 3000, 6000]));
        });
        PET_CATALOG.forEach((item) => {
            map.set(item.id, resolveRarityByPrice(item.price || 0, [2000, 3500, 6000]));
        });
        RECIPES.forEach((item) => {
            map.set(item.id, resolveRarityByPrice(item.sellPrice || 0, [300, 500, 700]));
        });
        COLLECTION_ITEMS.forEach((item) => {
            map.set(item.id, item.rarity);
        });
        return map;
    }, []);

    const getDisplayItems = (): CollectionDisplayItem[] => {
        if (selectedCategory === 'all') {
            return [
                ...collections.furniture.map(id => ({
                    id,
                    type: 'furniture' as CollectionCategoryKey,
                    emoji: itemMetaMap.get(id)?.emoji || '🛋️',
                    name: itemMetaMap.get(id)?.name || `家具 #${id}`,
                    rarity: rarityMap.get(id) || 'common'
                })),
                ...collections.pets.map(id => ({
                    id,
                    type: 'pets' as CollectionCategoryKey,
                    emoji: itemMetaMap.get(id)?.emoji || '🐶',
                    name: itemMetaMap.get(id)?.name || `ペット #${id}`,
                    rarity: rarityMap.get(id) || 'common'
                })),
                ...collections.recipes.map(id => ({
                    id,
                    type: 'recipes' as CollectionCategoryKey,
                    emoji: itemMetaMap.get(id)?.emoji || '📖',
                    name: itemMetaMap.get(id)?.name || `レシピ #${id}`,
                    rarity: rarityMap.get(id) || 'common'
                })),
                ...collections.insects.map(id => ({
                    id,
                    type: 'insects' as CollectionCategoryKey,
                    emoji: itemMetaMap.get(id)?.emoji || '🦋',
                    name: itemMetaMap.get(id)?.name || `昆虫 #${id}`,
                    rarity: rarityMap.get(id) || 'common'
                })),
                ...collections.fossils.map(id => ({
                    id,
                    type: 'fossils' as CollectionCategoryKey,
                    emoji: itemMetaMap.get(id)?.emoji || '🦴',
                    name: itemMetaMap.get(id)?.name || `化石 #${id}`,
                    rarity: rarityMap.get(id) || 'common'
                })),
                ...collections.cards.map(id => ({
                    id,
                    type: 'cards' as CollectionCategoryKey,
                    emoji: itemMetaMap.get(id)?.emoji || '🎴',
                    name: itemMetaMap.get(id)?.name || `カード #${id}`,
                    rarity: rarityMap.get(id) || 'common'
                }))
            ] as CollectionDisplayItem[];
        } else {
            const category = selectedCategory as CollectionCategoryKey;
            const categoryMeta = categories.find(c => c.id === category);
            return collections[category].map(id => ({
                id,
                type: category as CollectionCategoryKey,
                emoji: itemMetaMap.get(id)?.emoji || categoryMeta?.emoji || '📦',
                name: itemMetaMap.get(id)?.name || `${categoryMeta?.name || ''} #${id}`,
                rarity: rarityMap.get(id) || 'common'
            })) as CollectionDisplayItem[];
        }
    };

    const displayItems = getDisplayItems();
    const urTicketCount = inventory.find(i => i.itemId === 'ticket_ur')?.quantity || 0;
    const ticketCosts: Record<GachaTicketType, number> = { normal: 100, rare: 500, ssr: 1000, ur: 0 };

    const handleGacha = async () => {
        if (!currentUser) return;
        const cost = ticketCosts[ticketType];
        if (ticketType !== 'ur' && currentUser.balance < cost) {
            alert('お金が足りません');
            return;
        }
        if (ticketType === 'ur' && urTicketCount <= 0) {
            alert('UR確定チケットがありません');
            return;
        }
        setIsRolling(true);
        try {
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'collection_gacha',
                    requesterId: currentUser.id,
                    details: JSON.stringify({
                        ticketType,
                        category: gachaCategory
                    })
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                setResultItem(data.item);
                setShowResult(true);
                await refresh();
            } else {
                alert(data?.error || 'ガチャに失敗しました');
            }
        } catch (error) {
            console.error(error);
            alert('通信エラーが発生しました');
        } finally {
            setIsRolling(false);
        }
    };

    return (
        <div className="pb-20">
            {/* ヘッダー */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">🏆 コレクション</h1>
                <p className="text-gray-600">
                    集めたアイテムを確認できます
                </p>
            </div>

            {/* 統計カード */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <Card padding="md">
                    <div className="text-center">
                        <div className="text-3xl mb-2">📦</div>
                        <div className="text-2xl font-bold text-indigo-600">
                            {Object.values(collections).flat().length}
                        </div>
                        <div className="text-sm text-gray-600">総アイテム数</div>
                    </div>
                </Card>
                <Card padding="md">
                    <div className="text-center">
                        <div className="text-3xl mb-2">🎯</div>
                        <div className="text-2xl font-bold text-green-600">
                            {Object.values(collections).filter(arr => arr.length > 0).length}
                        </div>
                        <div className="text-sm text-gray-600">コンプリート</div>
                    </div>
                </Card>
                <Card padding="md">
                    <div className="text-center">
                        <div className="text-3xl mb-2">⭐</div>
                        <div className="text-2xl font-bold text-yellow-600">
                            {collections.cards.length}
                        </div>
                        <div className="text-sm text-gray-600">レアカード</div>
                    </div>
                </Card>
                <Card padding="md">
                    <div className="text-center">
                        <div className="text-3xl mb-2">🏅</div>
                        <div className="text-2xl font-bold text-orange-600">
                            {Math.floor(Object.values(collections).flat().length / 5)}
                        </div>
                        <div className="text-sm text-gray-600">達成度</div>
                    </div>
                </Card>
            </div>

            {/* ガチャ */}
            <Card padding="md" className="mb-8">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">🎰 コレクションガチャ</h2>
                            <p className="text-sm text-gray-500">カテゴリとチケットを選んで回せます。</p>
                        </div>
                        <div className="text-sm font-bold text-indigo-600">
                            所持金: {(currentUser?.balance || 0).toLocaleString()}枚 / UR券: {urTicketCount}枚
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {(['furniture', 'pets', 'recipes', 'insects', 'fossils', 'cards'] as CollectionCategoryKey[]).map((cat) => {
                            const meta = categories.find(c => c.id === cat);
                            return (
                                <button
                                    key={cat}
                                    onClick={() => setGachaCategory(cat)}
                                    className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all ${gachaCategory === cat
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    {meta?.emoji} {meta?.name}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {(['normal', 'rare', 'ssr', 'ur'] as GachaTicketType[]).map((type) => (
                            <button
                                key={type}
                                onClick={() => setTicketType(type)}
                                className={`px-3 py-2 rounded-lg text-sm font-bold border transition-all ${ticketType === type
                                    ? 'bg-slate-900 text-white border-slate-900'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                    }`}
                            >
                                {type === 'normal' && '🎟️ 通常 (100枚)'}
                                {type === 'rare' && '🎟️ レア (500枚)'}
                                {type === 'ssr' && '🎟️ SSR確定 (1000枚)'}
                                {type === 'ur' && '🎟️ UR確定 (チケット)'}
                            </button>
                        ))}
                    </div>

                    <Button
                        onClick={handleGacha}
                        disabled={isRolling}
                        className="w-full rounded-full bg-indigo-600 text-white font-bold h-12"
                    >
                        {isRolling ? 'ガチャ中...' : 'ガチャを回す'}
                    </Button>
                </div>
            </Card>

            {/* カテゴリータブ */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {categories.map((category) => (
                    <motion.button
                        key={category.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all
                            ${selectedCategory === category.id
                                ? 'bg-indigo-600 text-white shadow-lg'
                                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                            }
                        `}
                    >
                        <span className="text-xl">{category.emoji}</span>
                        <span>{category.name}</span>
                        <span className={`
                            text-xs px-2 py-0.5 rounded-full
                            ${selectedCategory === category.id ? 'bg-white/20' : 'bg-gray-200 text-gray-600'}
                        `}>
                            {category.count}
                        </span>
                    </motion.button>
                ))}
            </div>

            {/* コレクション表示 */}
            <Card padding="md">
                <AnimatePresence mode="wait">
                    {displayItems.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center py-16"
                        >
                            <div className="text-6xl mb-4">📭</div>
                            <p className="text-xl font-semibold text-gray-700 mb-2">
                                まだアイテムがありません
                            </p>
                            <p className="text-gray-500">
                                {selectedCategory === 'all'
                                    ? 'アイテムを集めて、コレクションを充実させましょう！'
                                    : `${categories.find(c => c.id === selectedCategory)?.name}を集めましょう！`}
                            </p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`items-${selectedCategory}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                        >
                            {displayItems.map((item, index) => (
                                <motion.div
                                    key={`${item.type}-${item.id}`}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: index * 0.05 }}
                                    whileHover={{ scale: 1.05, y: -5 }}
                                    className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-200"
                                >
                                    <div className="text-5xl text-center mb-3">
                                        {item.emoji}
                                    </div>
                                    <div className="text-center">
                                        <h3 className="font-semibold text-gray-900 text-sm mb-1">
                                            {item.name}
                                        </h3>
                                        <div className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${rarityBadge(item.rarity)}`}>
                                            {rarityLabel(item.rarity)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            ID: {item.id.substring(0, 8)}...
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>

            {/* フッター統計 */}
            <div className="mt-8 text-center text-sm text-gray-500">
                <p>
                    現在 <span className="font-bold text-indigo-600">{displayItems.length}</span> 個のアイテムを表示中
                </p>
            </div>

            <Modal isOpen={showResult} onClose={() => setShowResult(false)} title="🎉 ガチャ結果">
                {resultItem && (
                    <div className="text-center py-6">
                        <div className="text-7xl mb-4">{resultItem.emoji || '🎁'}</div>
                        <div className="text-xl font-bold mb-2">{resultItem.name}</div>
                        <div className={`inline-block text-xs font-bold px-3 py-1 rounded-full ${rarityBadge(resultItem.rarity)}`}>
                            {rarityLabel(resultItem.rarity)}
                        </div>
                        <div className="mt-6">
                            <Button fullWidth onClick={() => setShowResult(false)}>OK</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
