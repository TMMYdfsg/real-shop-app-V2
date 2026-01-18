import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import LandPurchasePhase from '@/components/LandPurchasePhase';

export const dynamic = 'force-dynamic';

export default async function MyShopPage() {
    const cookieStore = await cookies();
    const playerId = cookieStore.get('playerId')?.value;

    if (!playerId) {
        redirect('/');
    }

    // ユーザー情報と所有土地を取得
    const user = await prisma.user.findUnique({
        where: { id: playerId },
        include: {
            ownedParcel: true,
        },
    });

    if (!user) {
        redirect('/');
    }

    // 土地を所有していない場合は土地購入フェーズ
    if (!user.ownedParcel) {
        return <LandPurchasePhase />;
    }

    // 土地を所有している場合は従来のマイショップ
    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold text-gray-800 mb-8">
                    マイショップ
                </h1>

                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h2 className="text-2xl font-bold mb-4">所有土地</h2>
                    <div className="bg-green-50 p-4 rounded">
                        <p className="text-lg">
                            📍 {user.ownedParcel.addressNormalized}
                        </p>
                        <p className="text-sm text-gray-600 mt-2">
                            購入日: {new Date(user.ownedParcel.soldAt || '').toLocaleDateString('ja-JP')}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-4">拠点管理</h2>
                        <p className="text-gray-600 mb-4">
                            店舗や会社を設立できます
                        </p>
                        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                            拠点を設立
                        </button>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-4">フリマ出品</h2>
                        <p className="text-gray-600 mb-4">
                            商品を出品・管理できます
                        </p>
                        <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition">
                            商品を出品
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
