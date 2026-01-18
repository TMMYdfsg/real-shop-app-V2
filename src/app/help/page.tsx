'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function HelpPage() {
    const router = useRouter();
    const [openSection, setOpenSection] = useState<string | null>('beginner');

    const toggleSection = (id: string) => {
        setOpenSection(openSection === id ? null : id);
    };

    const contactAdmin = () => {
        // 管理者ID（実際にはDBから取得するか定数定義）
        const ADMIN_ID = 'admin-user-id';
        router.push(`/smartphone?app=messenger&userId=${ADMIN_ID}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-blue-600 text-white py-12 px-6">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-4">ヘルプセンター</h1>
                    <p className="text-blue-100 text-lg">
                        Real Shop App の使い方、機能一覧、トラブルシューティング
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* お問い合わせカード */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-l-4 border-yellow-400 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">
                            困ったときは？
                        </h2>
                        <p className="text-gray-600">
                            不具合報告や質問は、管理者へ直接メッセージを送ってください。
                        </p>
                    </div>
                    <button
                        onClick={contactAdmin}
                        className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-yellow-600 transition shadow-sm"
                    >
                        管理者に連絡する 📩
                    </button>
                </div>

                {/* マニュアルセクション */}
                <div className="space-y-4">
                    <HelpSection
                        id="beginner"
                        title="🔰 はじめての方へ（チュートリアル）"
                        isOpen={openSection === 'beginner'}
                        onToggle={() => toggleSection('beginner')}
                    >
                        <div className="space-y-4">
                            <h3 className="font-bold">1. 土地を購入しよう</h3>
                            <p>
                                まずは「マイショップ」メニューから、自分の土地を購入しましょう。
                                土地がないと店舗や会社を設立できません。
                            </p>
                            <h3 className="font-bold">2. 資金を稼ごう</h3>
                            <p>
                                銀行でアルバイトをしたり、不用品を売却して初期資金を貯めましょう。
                                株取引で増やすことも可能です。
                            </p>
                            <h3 className="font-bold">3. スマホを活用しよう</h3>
                            <p>
                                画面下のスマホアイコンから、他のプレイヤーと連絡を取ったり、
                                最新ニュースを確認できます。
                            </p>
                        </div>
                    </HelpSection>

                    <HelpSection
                        id="myshop"
                        title="🏪 マイショップ・経営"
                        isOpen={openSection === 'myshop'}
                        onToggle={() => toggleSection('myshop')}
                    >
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong>土地購入:</strong> エリアを選んで購入できます。価格は立地により異なります。
                            </li>
                            <li>
                                <strong>店舗設立:</strong> 土地を取得すると、コンビニ、カフェ、会社などを建設できます。
                            </li>
                            <li>
                                <strong>商品管理:</strong> 在庫の管理や価格設定を行えます（開発中）。
                            </li>
                        </ul>
                    </HelpSection>

                    <HelpSection
                        id="smartphone"
                        title="📱 スマートフォン・通信機能"
                        isOpen={openSection === 'smartphone'}
                        onToggle={() => toggleSection('smartphone')}
                    >
                        <ul className="list-disc pl-5 space-y-2">
                            <li>
                                <strong>メッセージ:</strong> リアルタイムでテキストチャットが可能です。
                            </li>
                            <li>
                                <strong>電話:</strong> ボイスチャットで通話できます。着信時は通知が表示されます。
                            </li>
                            <li>
                                <strong>銀行アプリ:</strong> 残高確認や送金が可能です。
                            </li>
                        </ul>
                    </HelpSection>

                    <HelpSection
                        id="trouble"
                        title="❓ こんなときは？（トラブルシューティング）"
                        isOpen={openSection === 'trouble'}
                        onToggle={() => toggleSection('trouble')}
                    >
                        <div className="space-y-4">
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="font-bold text-red-600">Q. 画面が更新されない</p>
                                <p>A. 通信機能は自動更新されますが、反映されない場合はリロードをお試しください。</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded">
                                <p className="font-bold text-red-600">Q. 音声通話が聞こえない</p>
                                <p>A. マイクの許可設定を確認してください。また、音量がゼロになっていないか確認してください。</p>
                            </div>
                        </div>
                    </HelpSection>

                    <HelpSection
                        id="status"
                        title="🚧 機能実装ステータス"
                        isOpen={openSection === 'status'}
                        onToggle={() => toggleSection('status')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-bold mb-2">✅ 実装済み</h4>
                                <ul className="text-green-700 space-y-1">
                                    <li>• ユーザー認証</li>
                                    <li>• 銀行システム</li>
                                    <li>• 土地購入</li>
                                    <li>• メッセージ・通話</li>
                                    <li>• 株取引</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-bold mb-2">🏗️ 開発中/予定</h4>
                                <ul className="text-gray-500 space-y-1">
                                    <li>• 詳細な店舗経営</li>
                                    <li>• 家具・ハウジング</li>
                                    <li>• ペットシステム</li>
                                    <li>• コレクション機能</li>
                                </ul>
                            </div>
                        </div>
                    </HelpSection>
                </div>
            </div>
        </div>
    );
}

function HelpSection({ title, children, isOpen, onToggle }: any) {
    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-5 text-left bg-white hover:bg-gray-50 transition"
            >
                <span className="text-lg font-bold text-gray-800">{title}</span>
                <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>
            {isOpen && (
                <div className="p-5 border-t border-gray-100 text-gray-700 bg-gray-50 bg-opacity-50">
                    {children}
                </div>
            )}
        </div>
    );
}
