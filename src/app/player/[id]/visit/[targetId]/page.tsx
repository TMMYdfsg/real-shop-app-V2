'use client';

import React, { useState, useMemo } from 'react';
import { useGame } from '@/context/GameContext';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Coupon } from '@/types';

export default function VisitShopPage() {
    const params = useParams();
    const targetId = params.targetId as string;

    const { gameState, currentUser } = useGame();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    // Cart & Coupon State
    // Record<itemId, quantity>
    const [cartItems, setCartItems] = useState<Record<string, number>>({});
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [couponError, setCouponError] = useState('');

    if (!gameState || !currentUser) return <div>Loading...</div>;

    const seller = gameState.users.find(u => u.id === targetId);
    const isBanker = currentUser.role === 'banker';

    if (!seller) {
        return (
            <div className="p-8 text-center">
                <p>ショップが見つかりません (ID: {targetId})</p>
                <Button onClick={() => router.back()} className="mt-4">戻る</Button>
            </div>
        );
    }

    const availableItems = (seller.shopMenu || []).filter(item => item.stock > 0);

    // Cart Calculations
    const cartTotal = useMemo(() => {
        let total = 0;
        Object.entries(cartItems).forEach(([itemId, quantity]) => {
            const item = availableItems.find(i => i.id === itemId);
            if (item) {
                total += item.price * quantity;
            }
        });
        return total;
    }, [availableItems, cartItems]);

    const discountAmount = useMemo(() => {
        if (!appliedCoupon) return 0;
        return Math.floor(cartTotal * (appliedCoupon.discountPercent / 100));
    }, [cartTotal, appliedCoupon]);

    const finalPrice = Math.max(0, cartTotal - discountAmount);
    // Banker can buy even if balance is low (debt increases)
    const canAfford = isBanker || currentUser.balance >= finalPrice;

    // Handlers
    const addToCart = (itemId: string, quantity: number = 1) => {
        setCartItems(prev => {
            const currentQty = prev[itemId] || 0;
            const item = availableItems.find(i => i.id === itemId);
            if (!item) return prev;

            // Check stock limit
            const newQty = Math.min(item.stock, currentQty + quantity);
            if (newQty <= 0) {
                const { [itemId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [itemId]: newQty };
        });
    };

    const removeFromCart = (itemId: string) => {
        setCartItems(prev => {
            const { [itemId]: _, ...rest } = prev;
            return rest;
        });
    };

    const handleApplyCoupon = () => {
        setCouponError('');
        setAppliedCoupon(null);

        if (!couponCode) return;
        if (!seller.coupons) {
            setCouponError('このお店はクーポンを発行していません');
            return;
        }

        const coupon = seller.coupons.find(c => c.code === couponCode && c.isActive);

        if (!coupon) {
            setCouponError('無効なクーポンコードです');
            return;
        }

        // Validity Checks
        if (coupon.expiresAt && coupon.expiresAt < Date.now()) {
            setCouponError('クーポンの有効期限が切れています');
            return;
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            setCouponError('クーポンの使用上限に達しています');
            return;
        }
        if (coupon.minPurchase && cartTotal < coupon.minPurchase) {
            setCouponError(`最低${coupon.minPurchase}枚から利用可能です`);
            return;
        }

        setAppliedCoupon(coupon);
    };

    const handlePurchase = async (singleItem?: { id: string, amount: number }) => {
        // If singleItem is provided, we bypass cart and buy just that item
        const purchaseItems = singleItem ? { [singleItem.id]: 1 } : cartItems;
        const purchaseTotal = singleItem ? singleItem.amount : finalPrice;

        if (Object.keys(purchaseItems).length === 0) return;

        if (!isBanker && currentUser.balance < purchaseTotal) {
            alert('お金が足りません');
            return;
        }

        const message = singleItem
            ? 'この商品を今すぐ購入しますか？'
            : `${Object.values(cartItems).reduce((a, b) => a + b, 0)}点の商品を合計${finalPrice}枚で購入しますか？${isBanker ? '\n(銀行員権限行使)' : ''}`;

        if (!confirm(message)) return;

        setIsProcessing(true);
        try {
            // For single purchase, we don't apply coupon automatically unless logic is added, 
            // but user requested "Buy Now" button usually implies skipping cart flow.
            // If we want coupon for single buy, we'd need to calculate it. 
            // Currently assuming single buy = no coupon for simplicity, or we can use appliedCoupon if valid.
            // To be safe, let's use the same API which handles coupons if we pass code.

            const apiCode = (!singleItem && appliedCoupon) ? appliedCoupon.code : undefined;

            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'bulk_purchase_shop_items',
                    requesterId: currentUser.id,
                    amount: 0,
                    details: JSON.stringify({
                        sellerId: seller.id,
                        cartItems: purchaseItems,
                        couponCode: apiCode
                    })
                })
            });

            const data = await res.json();
            if (res.ok && data.success) {
                alert(`購入完了！\n支払額: ${data.total}枚 (割引: ${data.discount}枚)`);
                window.location.reload();
            } else {
                alert(`購入失敗: ${data.message || '不明なエラー'}`);
            }
        } catch (error) {
            console.error(error);
            alert('エラーが発生しました');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="pb-24">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-50 z-10 py-2 shadow-sm px-2 -mx-2">
                <div>
                    <h2 className="text-2xl font-bold">
                        {seller.shopName || `${seller.name}のショップ`}
                    </h2>
                    <div className="text-sm text-gray-600">店主: {seller.name}</div>
                </div>
                <div className="flex gap-2 items-center">
                    {isBanker && <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded font-bold">銀行員権限ON</span>}
                    <Button onClick={() => router.back()} variant="secondary" size="sm">戻る</Button>
                </div>
            </div>

            {/* Item List */}
            {availableItems.length === 0 ? (
                <Card padding="lg" className="text-center text-gray-500">
                    <p>現在販売中の商品はありません</p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {availableItems.map(item => {
                        const quantityInCart = cartItems[item.id] || 0;
                        const isMaxStock = quantityInCart >= item.stock;

                        return (
                            <Card key={item.id} padding="md" className="relative">
                                {/* Sale Badge */}
                                {item.isSale && (
                                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-2 py-1 rounded-bl-lg rounded-tr-lg font-bold">
                                        {item.discount}% OFF
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <div className="text-4xl flex items-center justify-center bg-gray-100 rounded-lg w-16 h-16">
                                        {item.emoji || '📦'}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">{item.name}</h3>
                                        <div className="text-sm text-gray-500 mb-2 line-clamp-2">
                                            {item.description}
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div>
                                                <div className="text-sm text-gray-600">在庫: {item.stock}</div>
                                                {item.isSale && item.originalPrice && (
                                                    <div className="text-xs text-gray-400 line-through">{item.originalPrice}枚</div>
                                                )}
                                                <div className={`font-bold text-xl ${item.isSale ? 'text-red-600' : 'text-indigo-600'}`}>
                                                    {item.price.toLocaleString()}枚
                                                </div>
                                            </div>

                                            {/* Quantity Controls in Card */}
                                            {quantityInCart > 0 ? (
                                                <div className="flex items-center gap-2 bg-indigo-50 p-1 rounded-lg border border-indigo-200">
                                                    <button
                                                        onClick={() => addToCart(item.id, -1)}
                                                        className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-indigo-600 font-bold hover:bg-indigo-100"
                                                    >-</button>
                                                    <span className="font-bold w-4 text-center">{quantityInCart}</span>
                                                    <button
                                                        onClick={() => addToCart(item.id, 1)}
                                                        disabled={isMaxStock}
                                                        className={`w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-indigo-600 font-bold hover:bg-indigo-100 ${isMaxStock ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >+</button>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="primary"
                                                        onClick={() => handlePurchase({ id: item.id, amount: item.price })}
                                                    >
                                                        1個買う
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        onClick={() => addToCart(item.id, 1)}
                                                    >
                                                        カートへ
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {/* Review Section */}
            <div className="mt-12 mb-20 mx-1">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        ⭐ レビュー
                        <span className="text-sm font-normal text-slate-500">({seller?.receivedReviews?.length || 0}件)</span>
                    </h3>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                            // Simple prompt for now, can be improved to modal later
                            const scoreStr = prompt('評価を1〜5で入力してください:', '5');
                            if (!scoreStr) return;
                            const score = parseInt(scoreStr);
                            if (isNaN(score) || score < 1 || score > 5) {
                                alert('評価は1〜5の数字で入力してください');
                                return;
                            }

                            const comment = prompt('コメントを入力してください:', '素敵なお店でした！');
                            if (!comment) return;

                            try {
                                const res = await fetch('/api/action', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        type: 'submit_review',
                                        requesterId: currentUser!.id,
                                        details: JSON.stringify({
                                            targetId: seller.id,
                                            rating: score,
                                            comment: comment,
                                            reviewerName: currentUser!.name
                                        })
                                    })
                                });
                                const data = await res.json();
                                if (data.success) {
                                    alert('レビューを投稿しました！');
                                    window.location.reload();
                                } else {
                                    alert('エラー: ' + data.message);
                                }
                            } catch (e) {
                                alert('送信エラーが発生しました');
                            }
                        }}
                    >
                        ✍️ レビューを書く
                    </Button>
                </div>

                <div className="space-y-4">
                    {(!seller?.receivedReviews || seller.receivedReviews.length === 0) ? (
                        <div className="text-center py-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                            <p className="text-slate-500 text-sm">まだレビューはありません。<br />最初のお客様になりましょう！</p>
                        </div>
                    ) : (
                        seller.receivedReviews.slice().reverse().map((r: any) => (
                            <div key={r.id || Math.random()} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <div className="font-bold text-yellow-400 text-sm">{'⭐'.repeat(r.rating)}<span className="text-slate-200">{'⭐'.repeat(5 - r.rating)}</span></div>
                                        <span className="text-sm font-bold text-slate-700">{r.reviewerName || '匿名ユーザー'}</span>
                                    </div>
                                    <div className="text-xs text-slate-400">{new Date(r.timestamp).toLocaleDateString()}</div>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-2 rounded">{r.comment}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Cart Summary Bar */}
            {
                Object.keys(cartItems).length > 0 && (
                    <div className="fixed bottom-16 left-0 right-0 p-4 bg-white border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-20 animate-slide-up">
                        <div className="max-w-2xl mx-auto">
                            {/* Coupon Section */}
                            <div className="mb-3 flex gap-2">
                                <input
                                    type="text"
                                    placeholder="クーポンコード"
                                    className={`flex-1 p-2 text-sm border rounded ${couponError ? 'border-red-500 bg-red-50' : ''}`}
                                    value={couponCode}
                                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                                />
                                <Button size="sm" variant="secondary" onClick={handleApplyCoupon}>
                                    適用
                                </Button>
                            </div>
                            {couponError && <p className="text-xs text-red-500 mb-2">{couponError}</p>}
                            {appliedCoupon && (
                                <div className="text-xs text-green-600 font-bold mb-2 flex justify-between">
                                    <span>適用中: {appliedCoupon!.code} ({appliedCoupon!.discountPercent}% OFF)</span>
                                    <span>-{discountAmount}枚</span>
                                </div>
                            )}

                            {/* Total & Action */}
                            <div className="flex justify-between items-center gap-4">
                                <div>
                                    <div className="text-xs text-gray-500">
                                        {Object.values(cartItems).reduce((a, b) => a + b, 0)}点を選択中
                                    </div>
                                    <div className="text-xl font-bold text-indigo-700">
                                        合計: {finalPrice.toLocaleString()}枚
                                    </div>
                                    {isBanker && currentUser!.balance < finalPrice && (
                                        <div className="text-xs text-orange-600 font-bold">
                                            (残高不足でも購入可)
                                        </div>
                                    )}
                                </div>
                                <Button
                                    onClick={() => handlePurchase()}
                                    disabled={isProcessing || !canAfford}
                                    className="flex-1 max-w-[200px]"
                                    variant="primary"
                                >
                                    {isProcessing ? '処理中...' : 'まとめて購入'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
