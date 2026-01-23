'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Parcel {
    id: string;
    addressNormalized: string;
    lat: number;
    lng: number;
    price: number;
}

export default function LandPurchasePhase() {
    const router = useRouter();
    const [parcels, setParcels] = useState<Parcel[]>([]);
    const [selectedParcel, setSelectedParcel] = useState<Parcel | null>(null);
    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchParcels();
    }, []);

    const fetchParcels = async () => {
        try {
            const res = await fetch('/api/parcels/for-sale');
            if (!res.ok) throw new Error('土地の取得に失敗しました');
            const data = await res.json();
            setParcels(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleBuy = async (parcelId: string) => {
        if (!confirm('この土地を購入しますか？')) return;

        setPurchasing(true);
        setError('');

        try {
            const res = await fetch(`/api/parcels/${parcelId}/buy`, {
                method: 'POST',
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || '購入に失敗しました');
            }

            alert('土地を購入しました！');
            router.refresh(); // ページをリフレッシュして所有状態を更新
        } catch (err: any) {
            setError(err.message);
            alert(`エラー: ${err.message}`);
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
                <div className="text-2xl text-gray-600">読み込み中...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-6 mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        🏡 土地を購入しましょう！
                    </h1>
                    <p className="text-gray-700">
                        店舗や会社を設立するには、まず土地が必要です。
                        下記から購入可能な土地を選んでください。
                    </p>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error}
                    </div>
                )}

                {parcels.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                        <p className="text-xl text-gray-600">
                            現在、購入可能な土地はありません。
                        </p>
                        <p className="text-gray-500 mt-2">
                            管理者が新しい土地を追加するまでお待ちください。
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {parcels.map((parcel) => (
                            <div
                                key={parcel.id}
                                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                            >
                                <div className="bg-gradient-to-r from-green-500 to-blue-500 h-32 flex items-center justify-center">
                                    <span className="text-6xl">🏞️</span>
                                </div>
                                <div className="p-6">
                                    <h3 className="font-bold text-lg mb-2 text-gray-800">
                                        {parcel.addressNormalized}
                                    </h3>
                                    <div className="text-sm text-gray-600 mb-4">
                                        <p>緯度: {parcel.lat}</p>
                                        <p>経度: {parcel.lng}</p>
                                    </div>
                                    <div className="text-2xl font-bold text-green-600 mb-4">
                                        {parcel.price.toLocaleString()}枚
                                    </div>
                                    <button
                                        onClick={() => handleBuy(parcel.id)}
                                        disabled={purchasing}
                                        className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-bold"
                                    >
                                        {purchasing ? '購入中...' : '購入する'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-4">💡 購入の注意事項</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li>• 土地は1人1つまで所有できます</li>
                        <li>• 購入には残高が必要です</li>
                        <li>• 購入後、店舗や会社を設立できます</li>
                        <li>• 土地の売却は現在サポートされていません</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
