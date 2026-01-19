'use client';

import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function MyRoomPage({ params }: { params: { id: string } }) {
    const { gameState, sendRequest, currentUser } = useGame();
    const router = useRouter();

    if (!currentUser || currentUser.id !== params.id) {
        router.push(`/player/${params.id}`);
        return null;
    }

    const myItems = currentUser.myRoomItems || [];
    const catalogInventory = gameState?.catalogInventory || [];

    const handlePlace = async (ownedItemId: string) => {
        try {
            await sendRequest('place_item_in_room', 0, ownedItemId);
            alert('アイテムを配置しました！');
        } catch (error) {
            console.error(error);
            alert('配置に失敗しました');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-gray-800 mb-2">🏠 マイルーム</h1>
                    <p className="text-gray-600">購入したアイテムを表示・配置できます</p>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {myItems.map(ownedItem => {
                        const catalogItem = catalogInventory.find(c => c.id === ownedItem.catalogItemId);
                        if (!catalogItem) return null;

                        return (
                            <Card key={ownedItem.id} padding="md" className={ownedItem.isPlaced ? 'border-2 border-green-400' : ''}>
                                <div className="flex items-start gap-3">
                                    <div className="text-4xl">{catalogItem.emoji || '📦'}</div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg mb-1">{catalogItem.name}</h3>
                                        <p className="text-sm text-gray-600 mb-2">{catalogItem.description}</p>
                                        <div className="text-xs text-gray-400 mb-2">
                                            購入日: {new Date(ownedItem.purchasedAt).toLocaleDateString()}
                                        </div>
                                        {ownedItem.isPlaced ? (
                                            <div className="text-green-600 font-bold text-sm">✅ 配置済み</div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                className="w-full"
                                                onClick={() => handlePlace(ownedItem.id)}
                                            >
                                                配置する
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>

                {myItems.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <div className="text-6xl mb-4">📦</div>
                        <p>アイテムがありません</p>
                        <p className="text-sm mt-2">カタログから購入してみましょう！</p>
                    </div>
                )}
            </div>
        </div>
    );
}
