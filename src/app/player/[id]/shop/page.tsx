'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { motion } from 'framer-motion';
import { ShopItem, Coupon } from '@/types';
import { FURNITURE_CATALOG, PET_CATALOG, INGREDIENTS } from '@/lib/gameData';

type CatalogTab = 'furniture' | 'pet' | 'ingredient';

import CityMap from '@/components/map/CityMap'; // Import CityMap

// ... imports

export default function ShopPage() {
    const router = useRouter();
    const { gameState, currentUser } = useGame();

    // Tabs State
    const [activeTab, setActiveTab] = useState<'management' | 'property'>('management');

    // Modals State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPriceModalOpen, setIsPriceModalOpen] = useState(false);
    const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
    const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);

    // Data Selection State
    const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
    const [customPrice, setCustomPrice] = useState('');

    // New Item Form (Manual)
    const [newItem, setNewItem] = useState<Partial<ShopItem>>({ name: '', cost: 10, price: 50, stock: 0 });

    // New Coupon Form
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discountPercent: 10,
        maxUses: 10,
        minPurchase: 0
    });

    // Restock Catalog State
    const [restockTab, setRestockTab] = useState<CatalogTab>('furniture');
    const [selectedCatalogItem, setSelectedCatalogItem] = useState<any>(null);
    const [restockConfig, setRestockConfig] = useState({ quantity: 1, price: 0 });

    // Shop Name State
    const [isShopNameModalOpen, setIsShopNameModalOpen] = useState(false);
    const [newShopName, setNewShopName] = useState('');

    // Real Estate State
    const [selectedLand, setSelectedLand] = useState<any>(null); // Type should be Land but using any for loose coupling for now
    const [landEditConfig, setLandEditConfig] = useState({ price: 0, isForSale: false });

    const handleLandUpdate = async () => {
        if (!currentUser || !selectedLand) return;

        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'city_update_land',
                requesterId: currentUser.id,
                details: {
                    landId: selectedLand.id,
                    price: landEditConfig.price,
                    isForSale: landEditConfig.isForSale
                }
            })
        });

        alert('土地情報を更新しました');
        setSelectedLand(null); // Close panel
        // Note: Should ideally trigger a reload of land data
    };

    // Resale Check Helper
    const checkResaleWarning = (cost: number, price: number): boolean => {
        if (cost <= 0) return true;
        const ratio = price / cost;
        if (ratio >= 5) {
            const level = ratio >= 10 ? '【重大】' : '【警告】';
            const message = `${level} 設定価格が適正価格（仕入れ値）を大幅に超えています。\n高額転売とみなされ、信用スコアの低下や監査対象となる可能性があります。\n\nそれでもこの価格で設定しますか？`;
            return confirm(message);
        }
        return true;
    };

    const handleAddItem = async () => {
        if (!currentUser || !newItem.name) return;

        const cost = Number(newItem.cost);
        const price = Number(newItem.price);

        if (!checkResaleWarning(cost, price)) return;

        const currentMenu = currentUser.shopMenu || [];
        const item: ShopItem = {
            id: Math.random().toString(36).substr(2, 9),
            name: newItem.name,
            cost: cost,
            price: price,
            stock: 0,
            description: newItem.description
        };

        const updatedMenu = [...currentMenu, item];

        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'update_shop_menu',
                requesterId: currentUser.id,
                details: JSON.stringify(updatedMenu)
            })
        });

        setIsModalOpen(false);
        setNewItem({ name: '', cost: 10, price: 50, stock: 0 });
    };

    const handleRestock = async (item: ShopItem, quantity: number) => {
        if (!currentUser) return;
        const cost = item.cost * quantity;
        if (currentUser.balance < cost) {
            alert('資金が足りません');
            return;
        }

        if (!confirm(`${item.name}を${quantity}個仕入れますか？\n費用: ${cost}枚`)) return;

        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'restock_item',
                requesterId: currentUser.id,
                details: JSON.stringify({ itemId: item.id, quantity })
            })
        });
    };

    const handleDelete = async (itemId: string) => {
        if (!currentUser || !currentUser.shopMenu) return;
        if (!confirm('この商品をメニューから削除しますか？')) return;

        const updatedMenu = currentUser.shopMenu.filter(i => i.id !== itemId);

        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'update_shop_menu',
                requesterId: currentUser.id,
                details: JSON.stringify(updatedMenu)
            })
        });
    };

    const handlePriceAdjustment = async (item: ShopItem, adjustmentType: 'increase' | 'decrease' | 'reset' | 'custom', percent?: number) => {
        if (!currentUser) return;

        const currentMenu = currentUser.shopMenu || [];

        if (adjustmentType === 'custom' && customPrice) {
            const newCustomPrice = parseInt(customPrice);
            if (!checkResaleWarning(item.cost, newCustomPrice)) return;
        }

        const updatedMenu = currentMenu.map(menuItem => {
            if (menuItem.id !== item.id) return menuItem;

            let newPrice = menuItem.price;
            let originalPrice: number | undefined = menuItem.originalPrice || menuItem.price;
            let isSale = false;
            let discount = 0;

            if (adjustmentType === 'increase') {
                newPrice = Math.round(menuItem.price * (1 + (percent || 10) / 100));
                // 増加後の価格で警告チェック
                if (!checkResaleWarning(menuItem.cost, newPrice)) return menuItem; // キャンセルなら変更しない
            } else if (adjustmentType === 'decrease') {
                newPrice = Math.round(menuItem.price * (1 - (percent || 10) / 100));
                isSale = true;
                discount = percent || 10;
                if (!menuItem.isSale) {
                    originalPrice = menuItem.price;
                }
            } else if (adjustmentType === 'reset') {
                newPrice = menuItem.originalPrice ?? menuItem.price;
                originalPrice = undefined;
                isSale = false;
                discount = 0;
            } else if (adjustmentType === 'custom' && customPrice) {
                newPrice = parseInt(customPrice);
                if (newPrice < menuItem.price) {
                    isSale = true;
                    discount = Math.round(((menuItem.price - newPrice) / menuItem.price) * 100);
                    if (!menuItem.isSale) {
                        originalPrice = menuItem.price;
                    }
                }
            }

            return {
                ...menuItem,
                price: newPrice,
                originalPrice: adjustmentType === 'reset' ? undefined : originalPrice,
                isSale,
                discount
            };
        });

        // 変更がキャンセルされた場合（increaseチェック等で）はAPIを呼ばない判定が必要だが、
        // map内でreturn menuItemしているので変更なしとして送信されるだけなので安全。
        // ただし厳密には変更なし通知を出したいが、ここでは許容する。

        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'update_shop_menu',
                requesterId: currentUser.id,
                details: JSON.stringify(updatedMenu)
            })
        });

        setIsPriceModalOpen(false);
        setCustomPrice('');
    };

    const handleCreateCoupon = async () => {
        if (!currentUser || !newCoupon.code) return;

        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'create_coupon',
                requesterId: currentUser.id,
                details: JSON.stringify(newCoupon)
            })
        });

        setIsCouponModalOpen(false);
        setNewCoupon({ code: '', discountPercent: 10, maxUses: 10, minPurchase: 0 });
    };

    const handleDeleteCoupon = async (code: string) => {
        if (!currentUser || !currentUser.coupons) return;
        if (!confirm('クーポンを削除しますか？')) return;
        alert('クーポンの削除機能は未実装です（期限切れを待ってください）');
    };

    const handleCatalogRestock = async () => {
        if (!currentUser || !selectedCatalogItem) return;
        const totalCost = selectedCatalogItem.price * restockConfig.quantity;

        if (currentUser.balance < totalCost) {
            alert('資金が足りません');
            return;
        }

        if (!checkResaleWarning(selectedCatalogItem.price, restockConfig.price)) return;

        if (!confirm(`仕入れ費用: ${totalCost}枚\n販売価格: ${restockConfig.price}枚\nよろしいですか？`)) return;

        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'restock_from_catalog',
                requesterId: currentUser.id,
                details: JSON.stringify({
                    catalogItemId: selectedCatalogItem.id,
                    category: restockTab,
                    price: restockConfig.price,
                    cost: selectedCatalogItem.price,
                    quantity: restockConfig.quantity,
                    name: selectedCatalogItem.name,
                    emoji: selectedCatalogItem.emoji
                })
            })
        });

        setIsRestockModalOpen(false);
        setSelectedCatalogItem(null);
        setRestockConfig({ quantity: 1, price: 0 });
    };

    const handleShopNameChange = async () => {
        if (!currentUser) return;
        await fetch('/api/action', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: 'update_profile',
                requesterId: currentUser.id,
                details: JSON.stringify({ shopName: newShopName })
            })
        });
        setIsShopNameModalOpen(false);
    };

    // Catalog Data
    const getCatalogItems = () => {
        switch (restockTab) {
            case 'furniture': return FURNITURE_CATALOG;
            case 'pet': return PET_CATALOG;
            case 'ingredient': return INGREDIENTS;
            default: return [];
        }
    };

    const otherShops = gameState?.users.filter(u =>
        (u.role === 'player' || u.role === 'banker') && // Show Banker (God) shops too
        u.id !== currentUser?.id &&
        u.shopMenu &&
        u.shopMenu.length > 0
    ) || [];

    // Initialize shop name from currentUser
    React.useEffect(() => {
        if (currentUser?.shopName) {
            setNewShopName(currentUser.shopName);
        }
    }, [currentUser?.shopName]);

    if (!currentUser) return <div>Loading...</div>;

    const shopMenu = currentUser.shopMenu || [];
    const coupons = currentUser.coupons || [];
    // 土地ランクは現在固定値、将来的に所有地の最大ランクなどを参照する
    const landRank = 1;

    return (
        <div className="pb-20">

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {/* Header Section */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        🛍️ {currentUser.shopName || 'マイショップ管理'}
                    </h2>
                    <Button size="sm" variant="ghost" onClick={() => {
                        setNewShopName(currentUser.shopName || '');
                        setIsShopNameModalOpen(true);
                    }}>
                        ✏️ 店名変更
                    </Button>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
                    <button
                        onClick={() => setActiveTab('management')}
                        className={`px-4 py-2 font-bold transition-colors border-b-2 ${activeTab === 'management'
                            ? 'text-indigo-600 border-indigo-600'
                            : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                    >
                        🏪 店舗管理
                    </button>
                    <button
                        onClick={() => setActiveTab('property')}
                        className={`px-4 py-2 font-bold transition-colors border-b-2 ${activeTab === 'property'
                            ? 'text-indigo-600 border-indigo-600'
                            : 'text-gray-500 border-transparent hover:text-gray-700'
                            }`}
                    >
                        🗺️ 不動産・マップ
                    </button>
                </div>

                {/* MANAGEMENT TAB */}
                {activeTab === 'management' && (
                    <div className="animate-fade-in">
                        <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                            <div>
                                <div className="text-gray-600">店舗ランク (土地)</div>
                                <div className="font-bold text-lg text-indigo-600">Lv.{landRank}</div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="secondary" onClick={() => router.push(`/player/${currentUser.id}/points/exchange`)}>💎 共通交換所</Button>
                                <Button variant="outline" onClick={() => router.push(`/player/${currentUser.id}/shop/exchange`)}>⚙️ 交換所設定</Button>
                                <Button variant="primary" onClick={() => setIsRestockModalOpen(true)}>📦 仕入れカタログ</Button>
                            </div>
                        </div>

                        {/* Popularity & Reviews Preview */}
                        <Card padding="sm" className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-orange-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-center">
                                        <div className="text-xs text-orange-600 font-bold">人気度</div>
                                        <div className="text-2xl font-black text-orange-500">
                                            🔥 {currentUser.popularity || 0}
                                        </div>
                                    </div>
                                    <div className="h-8 w-px bg-orange-200"></div>
                                    <div className="text-center">
                                        <div className="text-xs text-orange-600 font-bold">評価</div>
                                        <div className="text-xl font-bold flex items-center gap-1">
                                            ⭐ {(() => {
                                                const reviews = currentUser.receivedReviews || [];
                                                if (reviews.length === 0) return '-';
                                                return (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);
                                            })()}
                                            <span className="text-xs text-gray-500 font-normal">({(currentUser.receivedReviews || []).length})</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right text-xs text-orange-700">
                                    <p>良いレビューを集めると</p>
                                    <p>人気度が上がり集客アップ！</p>
                                </div>
                            </div>

                            {/* Latest Reviews */}
                            {(currentUser.receivedReviews?.length || 0) > 0 && (
                                <div className="mt-3 pt-3 border-t border-orange-200">
                                    <h4 className="font-bold text-sm mb-2 text-orange-800">最新のレビュー</h4>
                                    <div className="space-y-2">
                                        {(currentUser.receivedReviews || []).slice(-3).reverse().map(review => (
                                            <div key={review.id} className="bg-white/80 p-2 rounded text-sm">
                                                <div className="flex justify-between">
                                                    <span className="font-bold">{'⭐'.repeat(review.rating)}</span>
                                                    <span className="text-gray-500 text-xs">{new Date(review.timestamp).toLocaleDateString()}</span>
                                                </div>
                                                <div className="text-gray-700 mt-1">{review.comment}</div>
                                                <div className="text-right text-xs text-gray-400">- {review.reviewerName || 'お客様'}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                        {/* ... Existing Management Content ... */}

                        {/* Coupons Section */}
                        <div className="mb-8">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold">🎟️ クーポン管理</h3>
                                <Button size="sm" variant="secondary" onClick={() => setIsCouponModalOpen(true)}>+ 発行</Button>
                            </div>
                            {coupons.length === 0 ? (
                                <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded">発行中のクーポンはありません</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {coupons.map(coupon => (
                                        <Card key={coupon.code} padding="sm" className={!coupon.isActive ? 'opacity-50' : ''}>
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <div className="font-bold text-lg tracking-widest">{coupon.code}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {coupon.discountPercent}% OFF (残: {coupon.maxUses ? coupon.maxUses - coupon.usedCount : '∞'})
                                                    </div>
                                                </div>
                                                <Button size="sm" variant="danger" onClick={() => handleDeleteCoupon(coupon.code)}>停止</Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Shop Menu Section */}
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold">商品メニュー</h3>
                            <Button size="sm" onClick={() => setIsModalOpen(true)}>+ 手動登録</Button>
                        </div>

                        {shopMenu.length === 0 ? (
                            <Card padding="lg" className="text-center text-gray-500">
                                <p>商品が登録されていません。</p>
                                <p className="text-sm mt-2">「仕入れカタログ」または「手動登録」から商品を追加しましょう！</p>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {shopMenu.map(item => (
                                    <Card key={item.id} padding="md">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="text-3xl">{item.emoji || '📦'}</div>
                                                <div>
                                                    <h4 className="font-bold text-lg">{item.name}</h4>
                                                    {item.isSale && item.discount && (
                                                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                                                            {item.discount}% OFF
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-xl">{item.price}枚</div>
                                                {item.originalPrice && item.originalPrice !== item.price && (
                                                    <div className="text-xs text-gray-400 line-through">{item.originalPrice}枚</div>
                                                )}
                                                <div className="text-xs text-gray-500">仕入れ: {item.cost}枚</div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between bg-gray-50 p-2 rounded mb-3">
                                            <span className="text-sm font-bold text-gray-600">在庫数</span>
                                            <span className={`text-xl font-bold ${item.stock === 0 ? 'text-red-500' : 'text-blue-600'}`}>
                                                {item.stock}個
                                            </span>
                                        </div>

                                        <div className="flex gap-2 mt-2">
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                fullWidth
                                                onClick={() => handleRestock(item, 5)}
                                                disabled={currentUser.balance < item.cost * 5}
                                            >
                                                入荷 (+5)
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                onClick={() => {
                                                    setSelectedItem(item);
                                                    setIsPriceModalOpen(true);
                                                }}
                                            >
                                                💰 価格
                                            </Button>
                                            <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>
                                                削除
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                        {/* 他の店舗セクション */}
                        {otherShops.length > 0 && (
                            <div className="mt-8">
                                <h3 className="font-bold text-xl mb-4">🏪 他のお店</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {otherShops.map(shop => (
                                        <div
                                            key={shop.id}
                                            className="cursor-pointer"
                                            onClick={() => router.push(`/player/${currentUser.id}/visit/${shop.id}`)}
                                        >
                                            <Card
                                                padding="md"
                                                className="hover:shadow-lg transition-shadow"
                                            >
                                                <div className="text-center">
                                                    <div className="text-3xl mb-2">🏪</div>
                                                    <div className="font-bold">{shop.shopName || `${shop.name}の店`}</div>
                                                    <div className="text-xs text-gray-500">{shop.shopMenu?.length || 0}商品</div>
                                                </div>
                                            </Card>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* PROPERTY TAB */}
                {activeTab === 'property' && (
                    <div className="animate-fade-in h-[600px] border border-gray-200 rounded-lg overflow-hidden relative">
                        <CityMap />
                    </div>
                )}
            </motion.div>

            {/* 新商品登録モーダル (Manual) */}
            < Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="📝 商品手動登録" >
                <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                    <div>
                        <label className="block text-sm font-bold mb-1">商品名</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={newItem.name}
                            onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                            placeholder="例: オリジナルグッズ"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">仕入れ値</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={newItem.cost}
                                onChange={e => setNewItem({ ...newItem, cost: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">販売価格</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={newItem.price}
                                onChange={e => setNewItem({ ...newItem, price: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">説明 (任意)</label>
                        <textarea
                            className="w-full p-2 border rounded"
                            value={newItem.description || ''}
                            onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                        />
                    </div>
                    <div className="pt-4 flex gap-2">
                        <Button fullWidth onClick={handleAddItem} disabled={!newItem.name}>登録</Button>
                        <Button fullWidth variant="ghost" onClick={() => setIsModalOpen(false)}>キャンセル</Button>
                    </div>
                </div>
            </Modal >

            {/* 価格調整モーダル */}
            < Modal isOpen={isPriceModalOpen} onClose={() => setIsPriceModalOpen(false)} title="💰 価格調整" >
                {selectedItem && (
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto p-1">
                        <div className="bg-gray-50 p-3 rounded text-center">
                            <div className="font-bold text-lg">{selectedItem.name}</div>
                            <div className="text-sm text-gray-600">現在の価格: <span className="font-bold">{selectedItem.price}枚</span></div>
                        </div>

                        <div>
                            <h4 className="font-bold mb-2 text-green-600">📈 値上げ</h4>
                            <div className="flex gap-2">
                                <Button onClick={() => handlePriceAdjustment(selectedItem, 'increase', 10)} fullWidth>+10%</Button>
                                <Button onClick={() => handlePriceAdjustment(selectedItem, 'increase', 20)} fullWidth>+20%</Button>
                                <Button onClick={() => handlePriceAdjustment(selectedItem, 'increase', 50)} fullWidth>+50%</Button>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold mb-2 text-red-500">📉 セール (値下げ)</h4>
                            <div className="flex gap-2">
                                <Button onClick={() => handlePriceAdjustment(selectedItem, 'decrease', 10)} variant="secondary" fullWidth>-10%</Button>
                                <Button onClick={() => handlePriceAdjustment(selectedItem, 'decrease', 20)} variant="secondary" fullWidth>-20%</Button>
                                <Button onClick={() => handlePriceAdjustment(selectedItem, 'decrease', 50)} variant="secondary" fullWidth>-50%</Button>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold mb-2">カスタム価格</h4>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    className="flex-1 p-2 border rounded"
                                    value={customPrice}
                                    onChange={e => setCustomPrice(e.target.value)}
                                    placeholder="新しい価格"
                                />
                                <Button onClick={() => handlePriceAdjustment(selectedItem, 'custom')}>適用</Button>
                            </div>
                        </div>

                        {selectedItem.originalPrice && (
                            <Button
                                variant="ghost"
                                fullWidth
                                onClick={() => handlePriceAdjustment(selectedItem, 'reset')}
                                className="border-t mt-4"
                            >
                                🔄 元の価格に戻す
                            </Button>
                        )}
                    </div>
                )}
            </Modal >

            {/* クーポン作成モーダル */}
            < Modal isOpen={isCouponModalOpen} onClose={() => setIsCouponModalOpen(false)} title="🎟️ クーポン発行" >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">クーポンコード (英数字)</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded uppercase"
                            value={newCoupon.code}
                            onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                            placeholder="例: SUMMER2026"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">割引率 (%)</label>
                            <input
                                type="number"
                                max="90"
                                className="w-full p-2 border rounded"
                                value={newCoupon.discountPercent}
                                onChange={e => setNewCoupon({ ...newCoupon, discountPercent: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">使用回数上限</label>
                            <input
                                type="number"
                                className="w-full p-2 border rounded"
                                value={newCoupon.maxUses}
                                onChange={e => setNewCoupon({ ...newCoupon, maxUses: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-bold mb-1">最低購入金額</label>
                        <input
                            type="number"
                            className="w-full p-2 border rounded"
                            value={newCoupon.minPurchase}
                            onChange={e => setNewCoupon({ ...newCoupon, minPurchase: Number(e.target.value) })}
                        />
                    </div>
                    <Button fullWidth onClick={handleCreateCoupon} disabled={!newCoupon.code}>クーポン発行</Button>
                </div>
            </Modal >

            {/* 仕入れモーダル */}
            < Modal isOpen={isRestockModalOpen} onClose={() => setIsRestockModalOpen(false)} title="📦 カタログ仕入れ" >
                <div className="space-y-4 max-h-[80vh] overflow-y-auto p-1">
                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        <button
                            className={`flex-1 py-1 text-sm rounded-md ${restockTab === 'furniture' ? 'bg-white shadow' : ''}`}
                            onClick={() => setRestockTab('furniture')}
                        >家具</button>
                        <button
                            className={`flex-1 py-1 text-sm rounded-md ${restockTab === 'pet' ? 'bg-white shadow' : ''}`}
                            onClick={() => setRestockTab('pet')}
                        >ペット</button>
                        <button
                            className={`flex-1 py-1 text-sm rounded-md ${restockTab === 'ingredient' ? 'bg-white shadow' : ''}`}
                            onClick={() => setRestockTab('ingredient')}
                        >食材</button>
                    </div>

                    {!selectedCatalogItem ? (
                        <div className="grid grid-cols-2 gap-2">
                            {getCatalogItems().map((item: any) => (
                                <motion.div
                                    key={item.id}
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => {
                                        setSelectedCatalogItem(item);
                                        setRestockConfig({ quantity: 1, price: Math.round(item.price * 1.5) });
                                    }}
                                >
                                    <Card padding="sm" className="cursor-pointer h-full border hover:border-indigo-300">
                                        <div className="text-3xl mb-1">{item.emoji}</div>
                                        <div className="font-bold text-sm truncate">{item.name}</div>
                                        <div className="text-xs text-gray-500">{item.price}枚</div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4 animate-slide-up">
                            <div className="bg-gray-50 p-3 rounded flex gap-3 items-center">
                                <div className="text-4xl">{selectedCatalogItem.emoji}</div>
                                <div>
                                    <h4 className="font-bold">{selectedCatalogItem.name}</h4>
                                    <div className="text-sm text-gray-500">仕入れ値: {selectedCatalogItem.price}枚</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">仕入れ個数</label>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-full p-2 border rounded"
                                        value={restockConfig.quantity}
                                        onChange={e => setRestockConfig({ ...restockConfig, quantity: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">販売価格</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded"
                                        value={restockConfig.price}
                                        onChange={e => setRestockConfig({ ...restockConfig, price: Number(e.target.value) })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-between text-sm p-2 bg-yellow-50 rounded">
                                <span>合計費用</span>
                                <span className="font-bold">{selectedCatalogItem.price * restockConfig.quantity}枚</span>
                            </div>
                            <div className="flex justify-between text-sm p-2 bg-green-50 rounded">
                                <span>予想利益 (完売時)</span>
                                <span className="font-bold text-green-700">
                                    {(restockConfig.price - selectedCatalogItem.price) * restockConfig.quantity}枚
                                </span>
                            </div>

                            <div className="flex gap-2">
                                <Button fullWidth onClick={handleCatalogRestock}>仕入れる</Button>
                                <Button fullWidth variant="secondary" onClick={() => setSelectedCatalogItem(null)}>一覧に戻る</Button>
                            </div>
                        </div>
                    )}
                </div >
            </Modal >

            {/* 店名変更モーダル */}
            < Modal isOpen={isShopNameModalOpen} onClose={() => setIsShopNameModalOpen(false)} title="🏪 店名を変更" >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-1">新しい店名</label>
                        <input
                            type="text"
                            className="w-full p-2 border rounded"
                            value={newShopName}
                            onChange={e => setNewShopName(e.target.value)}
                            placeholder="素敵な店名をつけてください"
                        />
                    </div>
                    <Button fullWidth onClick={handleShopNameChange}>変更を保存</Button>
                </div>
            </Modal >
        </div >
    );
}
