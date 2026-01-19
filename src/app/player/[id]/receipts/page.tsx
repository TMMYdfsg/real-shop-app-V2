'use client';

import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ReceiptsPage({ params }: { params: { id: string } }) {
    const { gameState, sendRequest, currentUser } = useGame();
    const [reviewModal, setReviewModal] = useState<{ purchaseId: string; shopName: string } | null>(null);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const router = useRouter();

    if (!currentUser || currentUser.id !== params.id) {
        router.push(`/player/${params.id}`);
        return null;
    }

    const receipts = currentUser.receipts || [];

    const handleSubmitReview = async () => {
        if (!reviewModal) return;
        if (!comment.trim()) return alert('コメントを入力してください');

        try {
            await sendRequest('submit_review', 0, JSON.stringify({
                purchaseId: reviewModal.purchaseId,
                rating,
                comment
            }));
            alert('レビューを投稿しました！');
            setReviewModal(null);
            setComment('');
            setRating(5);
        } catch (error) {
            console.error(error);
            alert('レビュー投稿に失敗しました');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-gray-800 mb-2">🧾 購入履歴・レシート</h1>
                    <p className="text-gray-600">他店舗での買い物履歴とレビューを管理</p>
                </div>

                <div className="space-y-4">
                    {receipts.map(receipt => (
                        <Card key={receipt.id} padding="md">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-lg">{receipt.shopOwnerName || 'ショップ'}</h3>
                                    <p className="text-sm text-gray-500">{new Date(receipt.timestamp).toLocaleString()}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-indigo-600">{receipt.total.toLocaleString()}枚</div>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="border-t pt-3 mb-3">
                                {receipt.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm py-1">
                                        <span>{item.name} x{item.quantity}</span>
                                        <span>{(item.price * item.quantity).toLocaleString()}枚</span>
                                    </div>
                                ))}
                            </div>

                            {/* Review Button */}
                            {receipt.hasReview ? (
                                <div className="text-green-600 font-bold text-sm">✅ レビュー投稿済み</div>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="warning"
                                    onClick={() => setReviewModal({ purchaseId: receipt.id, shopName: receipt.shopOwnerName || 'ショップ' })}
                                >
                                    ⭐ レビューを書く
                                </Button>
                            )}
                        </Card>
                    ))}
                </div>

                {receipts.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-6xl mb-4">🧾</div>
                        <p>購入履歴がありません</p>
                    </div>
                )}

                {/* Review Modal */}
                {reviewModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <Card className="max-w-md w-full" padding="lg">
                            <h2 className="text-2xl font-bold mb-4">⭐ レビューを書く</h2>
                            <p className="text-gray-600 mb-4">{reviewModal.shopName}</p>

                            {/* Star Rating */}
                            <div className="mb-4">
                                <label className="block font-bold mb-2">評価</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            className={`text-4xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                        >
                                            ⭐
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Comment */}
                            <div className="mb-4">
                                <label className="block font-bold mb-2">コメント</label>
                                <textarea
                                    className="w-full border rounded p-3 h-24"
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                    placeholder="お店の感想を書いてください..."
                                />
                            </div>

                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={() => setReviewModal(null)} className="flex-1">キャンセル</Button>
                                <Button onClick={handleSubmitReview} className="flex-1">投稿する</Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
}
