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
        const ADMIN_ID = 'admin'; // 実際の管理者IDに合わせて変更してください
        router.push(`/smartphone?app=messenger&userId=${ADMIN_ID}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-12 px-6 shadow-lg">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold mb-4 flex items-center gap-3">
                        <span className="text-5xl">📘</span> ヘルプセンター
                    </h1>
                    <p className="text-blue-100 text-lg">
                        Real Shop App V2 の完全攻略ガイド＆機能マニュアル
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* お問い合わせカード */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-8 border-l-8 border-yellow-400 flex flex-col md:flex-row items-center justify-between gap-4 animate-fade-in">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="text-2xl">🆘</span> 困ったときは？
                        </h2>
                        <p className="text-gray-600">
                            不具合の報告や、わからないことがある場合は、<br className="hidden md:block" />
                            メッセージ機能を使って管理者に直接連絡してください。
                        </p>
                    </div>
                    <button
                        onClick={contactAdmin}
                        className="w-full md:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-3 rounded-full font-bold hover:shadow-lg hover:scale-105 transition transform"
                    >
                        管理者に連絡する 📩
                    </button>
                </div>

                {/* マニュアルセクション */}
                <div className="space-y-4">

                    {/* 1. ゲームの概要 */}
                    <HelpSection
                        id="concept"
                        title="🌍 ゲームの概要・目的"
                        icon="🎓"
                        isOpen={openSection === 'concept'}
                        onToggle={() => toggleSection('concept')}
                    >
                        <div className="space-y-4 text-gray-700">
                            <h3 className="text-lg font-bold text-indigo-700 border-b pb-1">このゲームについて</h3>
                            <p>
                                Real Shop App V2は、リアルな経済活動を体験できるシミュレーションゲームです。
                                プレイヤーは一人の市民として、仕事をし、給料をもらい、税金を払い、
                                自分の店を持ってビジネスを成功させることを目指します。
                            </p>
                            <h3 className="text-lg font-bold text-indigo-700 border-b pb-1">勝利条件</h3>
                            <p>
                                明確なゴールはありませんが、以下の目標を目指しましょう：
                            </p>
                            <ul className="list-disc pl-5 space-y-1">
                                <li><strong>資産家になる:</strong> お金を稼ぎ、長者番付1位を目指す</li>
                                <li><strong>ビジネス王:</strong> 巨大な店舗や会社を経営する</li>
                                <li><strong>コンプリート:</strong> すべてのコレクションや実績を解除する</li>
                            </ul>
                        </div>
                    </HelpSection>

                    {/* 2. 基本的な流れ */}
                    <HelpSection
                        id="beginner"
                        title="🔰 はじめての方へ（チュートリアル）"
                        icon="🐣"
                        isOpen={openSection === 'beginner'}
                        onToggle={() => toggleSection('beginner')}
                    >
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start">
                                <div className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</div>
                                <div>
                                    <h4 className="font-bold">初期資金を確保する</h4>
                                    <p className="text-sm text-gray-600">
                                        まずは「銀行」に行き、お小遣いを確認したり、簡単な仕事（クエスト）でお金を稼ぎましょう。
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</div>
                                <div>
                                    <h4 className="font-bold">土地を購入する</h4>
                                    <p className="text-sm text-gray-600">
                                        「マイショップ」メニューから土地購入画面へ進み、地図から好きな場所を選んで土地を買います。
                                        土地がないとお店は建てられません。
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start">
                                <div className="bg-blue-100 text-blue-800 w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</div>
                                <div>
                                    <h4 className="font-bold">プロフを充実させる</h4>
                                    <p className="text-sm text-gray-600">
                                        自分のアイコンを設定したり、職業を選んでステータスを上げましょう。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </HelpSection>

                    {/* 3. 経済システム */}
                    <HelpSection
                        id="economy"
                        title="💰 経済・金融システム"
                        icon="bank"
                        isOpen={openSection === 'economy'}
                        onToggle={() => toggleSection('economy')}
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-bold text-green-700 mb-2">銀行 (Bank)</h3>
                                <ul className="text-sm space-y-2">
                                    <li><strong>預金・引出:</strong> ATM機能でお金を管理。預金には利子がつきます。</li>
                                    <li><strong>送金:</strong> 他のプレイヤーにお金を送れます。</li>
                                    <li><strong>ローン:</strong> 大きな買い物のために借金ができますが、返済が必要です。</li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-bold text-red-700 mb-2">税金と保険</h3>
                                <ul className="text-sm space-y-2">
                                    <li><strong>消費税:</strong> 買い物時に自動で徴収されます。</li>
                                    <li><strong>所得税:</strong> 給料から引かれます。</li>
                                    <li><strong>保険:</strong> 加入すると、病気やトラブル時の出費を抑えられます。</li>
                                </ul>
                            </div>
                            <div className="col-span-full">
                                <h3 className="font-bold text-purple-700 mb-2">株取引 (Stock Market)</h3>
                                <p className="text-sm">
                                    企業の株を売買できます。株価は「ニュース」やイベントによってリアルタイムに変動します。
                                    安く買って高く売れば、大きな利益を得られます。
                                    <span className="text-red-500 font-bold ml-2">※元本割れのリスクもあります！</span>
                                </p>
                            </div>
                        </div>
                    </HelpSection>

                    {/* 4. マイショップ */}
                    <HelpSection
                        id="myshop"
                        title="🏪 マイショップ・経営・土地"
                        icon="shop"
                        isOpen={openSection === 'myshop'}
                        onToggle={() => toggleSection('myshop')}
                    >
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold border-b pb-1">土地システム</h3>
                            <p className="text-sm">
                                Google Maps上の実際の座標に基づいた土地を購入できます。
                                人気エリア（駅前など）は価格が高いですが、集客が見込めます。
                            </p>

                            <h3 className="text-lg font-bold border-b pb-1">拠点の設立</h3>
                            <div className="bg-gray-50 p-3 rounded text-sm">
                                <p className="mb-2">土地を手に入れたら、以下のいずれかを建設できます：</p>
                                <ul className="list-disc pl-5">
                                    <li><strong>店舗 (Shop):</strong> 商品を販売するお店。コンビニ、カフェなど。</li>
                                    <li><strong>会社 (Company):</strong> サービスを提供したり、他のプレイヤーを雇ったりできます。</li>
                                    <li><strong>自宅 (House):</strong> 住居。家具を置いてカスタマイズできます。</li>
                                </ul>
                            </div>

                            <h3 className="text-lg font-bold border-b pb-1">フリマ・出品</h3>
                            <p className="text-sm">
                                手に入れたアイテムや、拾ったもの（虫・化石など）をマイショップで販売できます。
                                価格は自由に設定できます。
                            </p>
                        </div>
                    </HelpSection>

                    {/* 5. スマホ機能 */}
                    <HelpSection
                        id="smartphone"
                        title="📱 スマートフォン機能"
                        icon="iphone"
                        isOpen={openSection === 'smartphone'}
                        onToggle={() => toggleSection('smartphone')}
                    >
                        <p className="mb-4 text-sm">
                            画面下のドックにあるアイコンから、様々なアプリを起動できます。
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                            <div className="bg-green-50 p-3 rounded">
                                <div className="font-bold text-green-700">📞 電話</div>
                                リアルタイム音声通話が可能です。着信通知が届きます。
                            </div>
                            <div className="bg-blue-50 p-3 rounded">
                                <div className="font-bold text-blue-700">💬 メッセージ</div>
                                LINEのようなチャット機能。画像の送信も予定されています。
                            </div>
                            <div className="bg-red-50 p-3 rounded">
                                <div className="font-bold text-red-700">📰 ニュース</div>
                                ゲーム内の出来事や株価変動の情報をチェックできます。
                            </div>
                            <div className="bg-yellow-50 p-3 rounded">
                                <div className="font-bold text-yellow-700">🏦 ネットバンキング</div>
                                手元で残高確認や送金ができます。
                            </div>
                            <div className="bg-purple-50 p-3 rounded">
                                <div className="font-bold text-purple-700">📍 マップ</div>
                                自分の位置や、他のプレイヤーのお店を探せます。
                            </div>
                            <div className="bg-gray-50 p-3 rounded">
                                <div className="font-bold text-gray-700">⚙️ 設定</div>
                                音量設定や通知のON/OFFができます。
                            </div>
                        </div>
                    </HelpSection>

                    {/* 6. 生活・その他 */}
                    <HelpSection
                        id="life"
                        title="🌲 生活・コレクション"
                        icon="bug"
                        isOpen={openSection === 'life'}
                        onToggle={() => toggleSection('life')}
                    >
                        <div className="space-y-3">
                            <h3 className="font-bold">🪲 採集システム</h3>
                            <p className="text-sm">
                                マップ上には様々な生き物（昆虫・魚）や化石が出現します。
                                捕まえて図鑑に登録したり、博物館に寄贈したり、ショップで売ったりできます。
                            </p>
                            <h3 className="font-bold">🛋 家具・カスタマイズ</h3>
                            <p className="text-sm">
                                家具屋でインテリアを購入し、自宅や店舗に配置できます。
                                レアな家具を集めて自慢のお部屋を作りましょう。
                            </p>
                            <h3 className="font-bold">🐶 ペット</h3>
                            <p className="text-sm">
                                犬や猫などのペットを飼うことができます。
                                餌をあげたり遊んだりして仲良くなりましょう。
                            </p>
                        </div>
                    </HelpSection>

                    {/* 7. トラブルシューティング */}
                    <HelpSection
                        id="trouble"
                        title="❓ FAQ / トラブルシューティング"
                        icon="tool"
                        isOpen={openSection === 'trouble'}
                        onToggle={() => toggleSection('trouble')}
                    >
                        <div className="space-y-4 text-sm">
                            <details className="bg-gray-50 p-3 rounded cursor-pointer">
                                <summary className="font-bold text-gray-800">Q. 画面が動かなくなった / 最新情報にならない</summary>
                                <p className="mt-2 text-gray-600">
                                    A. 通信環境の良い場所で、ブラウザの「再読み込み（リロード）」ボタンを押してください。
                                    通常は自動更新されますが、接続が切れることがあります。
                                </p>
                            </details>
                            <details className="bg-gray-50 p-3 rounded cursor-pointer">
                                <summary className="font-bold text-gray-800">Q. お金が足りなくて何もできない</summary>
                                <p className="mt-2 text-gray-600">
                                    A. 毎日ログインボーナスがあります。また、銀行で「公的融資（初心者救済）」を受けられる場合があります。
                                </p>
                            </details>
                            <details className="bg-gray-50 p-3 rounded cursor-pointer">
                                <summary className="font-bold text-gray-800">Q. 通話の声が聞こえない</summary>
                                <p className="mt-2 text-gray-600">
                                    A. ブラウザのマイク権限を許可しているか確認してください。また、デバイスの音量設定も確認してください。
                                </p>
                            </details>
                        </div>
                    </HelpSection>

                    {/* 8. ステータス */}
                    <HelpSection
                        id="status"
                        title="🚧 現在の実装状況"
                        icon="crane"
                        isOpen={openSection === 'status'}
                        onToggle={() => toggleSection('status')}
                    >
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-2 text-left">カテゴリー</th>
                                        <th className="p-2 text-left">機能名</th>
                                        <th className="p-2 text-center">状態</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    <tr><td className="p-2">基本</td><td className="p-2">ユーザー認証・プロフ</td><td className="p-2 text-center text-green-600 font-bold">✅</td></tr>
                                    <tr><td className="p-2">経済</td><td className="p-2">銀行・送金・ローン</td><td className="p-2 text-center text-green-600 font-bold">✅</td></tr>
                                    <tr><td className="p-2">経済</td><td className="p-2">株式投資</td><td className="p-2 text-center text-green-600 font-bold">✅</td></tr>
                                    <tr><td className="p-2">不動産</td><td className="p-2">土地購入 (Map連携)</td><td className="p-2 text-center text-green-600 font-bold">✅</td></tr>
                                    <tr><td className="p-2">通信</td><td className="p-2">電話 (ボイスチャット)</td><td className="p-2 text-center text-green-600 font-bold">✅</td></tr>
                                    <tr><td className="p-2">通信</td><td className="p-2">メッセージ機能</td><td className="p-2 text-center text-green-600 font-bold">✅</td></tr>
                                    <tr className="bg-yellow-50"><td className="p-2">経営</td><td className="p-2">詳細な店舗運営</td><td className="p-2 text-center text-yellow-600 font-bold">🚧 開発中</td></tr>
                                    <tr className="bg-gray-50"><td className="p-2">生活</td><td className="p-2">家具・採集・ペット</td><td className="p-2 text-center text-gray-400 font-bold">📅 予定</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </HelpSection>

                </div>
            </div>
        </div>
    );
}

// アイコン付きのヘルプセクションコンポーネント
function HelpSection({ title, children, isOpen, onToggle, icon, id }: any) {
    const icons: any = {
        'concept': '🌍',
        'beginner': '🔰',
        'economy': '💰',
        'myshop': '🏪',
        'smartphone': '📱',
        'life': '🌲',
        'trouble': '❓',
        'status': '🚧',
        'bank': '🏦',
        'shop': '🛍',
        'iphone': '📵',
        'bug': '🦋',
        'tool': '🔧',
        'crane': '🏗',
        'grad': '🎓',
        'chick': '🐣'
    };

    const displayIcon = icons[id] || icon || '📄';

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden transform transition-all duration-300 hover:shadow-md">
            <button
                onClick={onToggle}
                className={`w-full flex items-center justify-between p-5 text-left transition-colors ${isOpen ? 'bg-indigo-50' : 'bg-white hover:bg-gray-50'}`}
            >
                <div className="flex items-center gap-3">
                    <span className="text-2xl">{displayIcon}</span>
                    <span className="text-lg font-bold text-gray-800">{title.replace(/^[^\s]+\s/, '')}</span>
                </div>
                <span className={`transform transition-transform duration-300 w-8 h-8 flex items-center justify-center rounded-full ${isOpen ? 'rotate-180 bg-indigo-200 text-indigo-800' : 'bg-gray-100 text-gray-500'}`}>
                    ▼
                </span>
            </button>
            <div
                className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
                <div className="p-6 border-t border-gray-100 text-gray-700 leading-relaxed bg-white">
                    {children}
                </div>
            </div>
        </div>
    );
}
