'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

// 土地編集モーダル (Animated)
const LandEditor = ({ land, onClose, onSave, onDelete }: { land: any, onClose: () => void, onSave: (data: any) => void, onDelete: (id: string, e: any) => void }) => {
    const [form, setForm] = useState({
        price: land.price,
        maintenanceFee: land.maintenanceFee || 0,
        isForSale: land.isForSale ?? true,
        requiresApproval: land.requiresApproval || false,
        allowConstruction: land.allowConstruction ?? true,
        allowCompany: land.allowCompany ?? true,
        zoning: land.zoning || 'residential'
    });

    const handleSave = () => {
        onSave({ landId: land.id, ...form });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shrink-0 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">🏙️</div>
                    <h3 className="font-black text-2xl relative z-10">{land.address}</h3>
                    <p className="text-indigo-100 text-sm font-mono relative z-10 opacity-80 mt-1">{land.id}</p>
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors">
                        ✕
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                    {/* Price Section */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">地価</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-400">¥</span>
                                <input
                                    type="number"
                                    className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-gray-700"
                                    value={form.price}
                                    onChange={e => setForm({ ...form, price: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">維持費</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-400">¥</span>
                                <input
                                    type="number"
                                    className="w-full pl-7 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-gray-700"
                                    value={form.maintenanceFee}
                                    onChange={e => setForm({ ...form, maintenanceFee: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Zoning Section */}
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">用途地域</label>
                        <select
                            className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                            value={form.zoning}
                            onChange={e => setForm({ ...form, zoning: e.target.value })}
                        >
                            <option value="residential">🏡 住宅地 (Residential)</option>
                            <option value="commercial">🏢 商業地 (Commercial)</option>
                            <option value="industrial">🏭 工業地 (Industrial)</option>
                            <option value="mixed">🌇 混在 (Mixed)</option>
                            <option value="public">🏛️ 公共 (Public)</option>
                        </select>
                    </div>

                    {/* Toggles */}
                    <div className="bg-gray-50 p-4 rounded-xl space-y-3 border border-gray-100">
                        {[
                            { id: 'chk_sale', label: '販売中 (For Sale)', key: 'isForSale' as const },
                            { id: 'chk_appr', label: '承認制 (Requires Approval)', key: 'requiresApproval' as const },
                            { id: 'chk_cons', label: '建設許可 (Allow Build)', key: 'allowConstruction' as const },
                            { id: 'chk_comp', label: '法人登記 (Allow Company)', key: 'allowCompany' as const },
                        ].map((item) => (
                            <label key={item.id} className="flex items-center justify-between cursor-pointer group">
                                <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{item.label}</span>
                                <div className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={form[item.key]}
                                        onChange={e => setForm({ ...form, [item.key]: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 shrink-0 flex gap-3">
                    <Button
                        variant="danger"
                        onClick={(e) => onDelete(land.id, e)}
                        className="px-4 bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                    >
                        🗑️ 削除
                    </Button>
                    <div className="flex-1"></div>
                    <Button variant="secondary" onClick={onClose}>キャンセル</Button>
                    <Button onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200">設定を保存</Button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// 国名から地域IDを導出するマッピング
const COUNTRY_REGION_MAP: Record<string, string> = {
    "日本": "region_asia", "中国": "region_asia", "インド": "region_asia", "インドネシア": "region_asia", "パキスタン": "region_asia",
    "バングラデシュ": "region_asia", "ロシア": "region_asia", "ベトナム": "region_asia", "フィリピン": "region_asia", "タイ": "region_asia",
    "韓国": "region_asia", "トルコ": "region_asia", "イラン": "region_asia", "サウジアラビア": "region_asia", "イスラエル": "region_asia",
    "マレーシア": "region_asia", "シンガポール": "region_asia", "台湾": "region_asia", "香港": "region_asia", "ミャンマー": "region_asia",
    "オーストラリア": "region_oceania", "ニュージーランド": "region_oceania", "フィジー": "region_oceania", "パプアニューギニア": "region_oceania",
    "アメリカ合衆国": "region_north_america", "カナダ": "region_north_america", "メキシコ": "region_north_america", "キューバ": "region_north_america",
    "ブラジル": "region_south_america", "アルゼンチン": "region_south_america", "コロンビア": "region_south_america", "チリ": "region_south_america", "ペルー": "region_south_america",
    "イギリス": "region_europe", "フランス": "region_europe", "ドイツ": "region_europe", "イタリア": "region_europe", "スペイン": "region_europe",
    "ウクライナ": "region_europe", "ポーランド": "region_europe", "オランダ": "region_europe", "スイス": "region_europe", "ベルギー": "region_europe",
    "スウェーデン": "region_europe", "ノルウェー": "region_europe", "デンマーク": "region_europe", "フィンランド": "region_europe", "オーストリア": "region_europe",
    "ナイジェリア": "region_africa", "エジプト": "region_africa", "南アフリカ": "region_africa", "ケニア": "region_africa", "ルワンダ": "region_africa",
    "モロッコ": "region_africa", "エチオピア": "region_africa", "ガーナ": "region_africa", "アルジェリア": "region_africa", "タンザニア": "region_africa"
};

// 土地のIDまたはaddressからregionIdを導出
const getRegionId = (land: { id: string; address: string; regionId?: string }): string | undefined => {
    // 既にregionIdがあればそれを返す
    if (land.regionId) return land.regionId;

    // 地域マーカーの場合はそのまま
    if (land.id.startsWith('region_')) return land.id;

    // 日本の都道府県（country_で始まらない、region_で始まらない）
    if (!land.id.startsWith('country_') && !land.id.startsWith('region_')) {
        return 'japan';
    }

    // 国の場合、country_XXX から国名を抽出
    if (land.id.startsWith('country_')) {
        const countryName = land.id.replace('country_', '');
        return COUNTRY_REGION_MAP[countryName] || undefined;
    }

    // addressからマッピング
    return COUNTRY_REGION_MAP[land.address] || undefined;
};

interface RealEstateManagerProps {
    isPopup?: boolean;
    onClose?: () => void;
}

export function RealEstateManager({ isPopup = false, onClose }: RealEstateManagerProps = {}) {
    const { gameState, refresh } = useGame();
    const [activeTab, setActiveTab] = useState<'properties' | 'lands'>('properties');
    const [activeRegion, setActiveRegion] = useState<string>('japan');
    const [searchTerm, setSearchTerm] = useState('');
    const [editingLand, setEditingLand] = useState<any>(null);


    // Forms
    const [propForm, setPropForm] = useState({
        name: '',
        type: 'apartment', // 'land' | 'apartment' | 'house' | 'shop' | 'mansion'
        price: 10000,
        income: 500,
        description: ''
    });

    const [landForm, setLandForm] = useState({
        id: '', // Grid ID e.g. "10-10" or custom
        address: '',
        price: 100000,
        size: 100,
        zoning: 'residential' // 'residential', 'commercial', 'industrial'
    });

    if (!gameState) return null;

    const handleAddProperty = async () => {
        if (!propForm.name) return alert('物件名を入力してください');

        try {
            await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add_property',
                    property: {
                        name: propForm.name,
                        type: propForm.type,
                        price: Number(propForm.price),
                        income: Number(propForm.income),
                        description: propForm.description,
                        ownerId: null
                    }
                }),
            });
            alert('物件を追加しました');
            setPropForm({ name: '', type: 'apartment', price: 10000, income: 500, description: '' });
            refresh(); // データを再取得
        } catch (e) {
            console.error(e);
            alert('エラーが発生しました');
        }
    };

    const handleDeleteProperty = async (id: string) => {
        if (!confirm('本当に削除しますか？')) return;
        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete_property', propertyId: id }),
        });
        refresh(); // データを再取得
    };

    const handleAddLand = async () => {
        // if (!landForm.id) return alert('IDを入力してください');
        if (!landForm.address) return alert('住所を入力してください');

        try {
            await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'add_land',
                    land: {
                        id: landForm.id || undefined, // undefined to auto-generate if empty
                        address: landForm.address,
                        price: Number(landForm.price),
                        size: Number(landForm.size),
                        zoning: landForm.zoning,
                        location: { lat: 35.681236, lng: 139.767125 } // Dummy center for now
                    }
                }),
            });
            alert('土地を追加しました');
            setLandForm({ id: '', address: '', price: 100000, size: 100, zoning: 'residential' });
            refresh(); // データを再取得
        } catch (e) {
            console.error(e);
            alert('エラーが発生しました');
        }
    };

    const handleDeleteLand = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('本当にこの土地を削除しますか？\n(注意: この操作は取り消せません)')) return;

        try {
            await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'delete_land', landId: id }),
            });
            alert('土地を削除しました');
            refresh();
        } catch (error) {
            console.error(error);
            alert('削除エラーが発生しました');
        }
    };

    const handleResetJapan = async () => {
        if (!confirm('日本の都道府県および「日本」の不動産データを初期状態に戻しますか？\n(所有者情報や変更された地価もリセットされます。この操作は取り消せません)')) return;

        try {
            const res = await fetch('/api/admin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'reset_japan_lands' }),
            });
            const data = await res.json();
            if (data.success) {
                alert('日本のデータをリセットしました');
                refresh();
            } else {
                alert(`失敗: ${data.error}`);
            }
        } catch (e) {
            console.error(e);
            alert('通信エラーが発生しました');
        }
    };

    const handleUpdateLand = async (updates: any) => {
        try {
            // Admin用の共通Action APIを利用（/api/adminではなく/api/action）
            // 権限管理上は/api/adminが正しいが、route.tsの実装に合わせる
            await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'admin_update_land',
                    requesterId: 'admin', // dummy
                    details: JSON.stringify(updates)
                }),
            });
            alert('設定を保存しました');
            setEditingLand(null);
            refresh();
        } catch (e) {
            console.error(e);
            if (e instanceof Error) alert(`更新エラー: ${e.message}`);
            else alert('更新エラー');
        }
    };

    const content = (
        <div className={`space-y-6 ${isPopup ? 'p-6' : ''}`}>
            {/* Popup Header */}
            {isPopup && (
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h2 className="text-xl font-black text-gray-800">🏠 不動産管理センター</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="flex gap-4 border-b border-gray-200 pb-2">
                <button
                    onClick={() => setActiveTab('properties')}
                    className={`pb-2 font-bold ${activeTab === 'properties' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                >
                    🏢 投資物件リスト
                </button>
                <button
                    onClick={() => setActiveTab('lands')}
                    className={`pb-2 font-bold ${activeTab === 'lands' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
                >
                    🗺️ 地域・土地管理
                </button>
            </div>

            {/* Properties Tab */}
            {activeTab === 'properties' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                    {/* List */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg">登録済み物件 ({gameState.properties?.length || 0})</h3>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {gameState.properties?.map(p => (
                                <Card key={p.id} padding="sm" className="flex justify-between items-center">
                                    <div>
                                        <div className="font-bold">{p.name} <span className="text-xs text-gray-500">({p.type})</span></div>
                                        <div className="text-sm">価格: {p.price.toLocaleString()} / 収益: {p.income.toLocaleString()}</div>
                                        {p.ownerId ? (
                                            <div className="text-xs text-green-600">所有者あり: {gameState.users.find(u => u.id === p.ownerId)?.name}</div>
                                        ) : (
                                            <div className="text-xs text-blue-500">販売中 (銀行所有)</div>
                                        )}
                                    </div>
                                    <Button size="sm" variant="danger" onClick={() => handleDeleteProperty(p.id)}>削除</Button>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Form */}
                    <Card title="新規物件追加">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold mb-1">物件名</label>
                                <input
                                    className="w-full p-2 border rounded"
                                    value={propForm.name}
                                    onChange={e => setPropForm({ ...propForm, name: e.target.value })}
                                    placeholder="例: 六本木ヒルズ VIPルーム"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">タイプ</label>
                                <select
                                    className="w-full p-2 border rounded"
                                    value={propForm.type}
                                    onChange={e => setPropForm({ ...propForm, type: e.target.value })}
                                >
                                    <option value="apartment">アパート</option>
                                    <option value="house">一軒家</option>
                                    <option value="mansion">高級マンション</option>
                                    <option value="shop">店舗</option>
                                    <option value="land">土地のみ</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold mb-1">販売価格</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded"
                                        value={propForm.price}
                                        onChange={e => setPropForm({ ...propForm, price: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">毎ターン収益</label>
                                    <input
                                        type="number"
                                        className="w-full p-2 border rounded"
                                        value={propForm.income}
                                        onChange={e => setPropForm({ ...propForm, income: Number(e.target.value) })}
                                        placeholder="マイナスなら維持費"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold mb-1">説明</label>
                                <textarea
                                    className="w-full p-2 border rounded"
                                    value={propForm.description}
                                    onChange={e => setPropForm({ ...propForm, description: e.target.value })}
                                />
                            </div>
                            <Button onClick={handleAddProperty} className="w-full">追加する</Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Lands Tab */}
            {activeTab === 'lands' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                    {/* Region Sub-Tabs */}
                    <div className="flex flex-wrap gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        {[
                            { id: 'japan', name: '🇯🇵 日本' },
                            { id: 'region_asia', name: '🌏 アジア' },
                            { id: 'region_europe', name: '🇪🇺 欧州' },
                            { id: 'region_africa', name: '🌍 アフリカ' },
                            { id: 'region_oceania', name: '🇦🇺 オセアニア' },
                            { id: 'region_north_america', name: '🇺🇸 北米' },
                            { id: 'region_south_america', name: '🇧🇷 南米' },
                            { id: 'all', name: '🌐 すべて' }
                        ].map(reg => (
                            <button
                                key={reg.id}
                                onClick={() => setActiveRegion(reg.id)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${activeRegion === reg.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'}`}
                            >
                                {reg.name}
                            </button>
                        ))}
                    </div>

                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="国名、都道府県名、IDで検索..."
                            className="w-full p-2 pl-9 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
                        {searchTerm && (
                            <button
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                                onClick={() => setSearchTerm('')}
                            >✕</button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* List */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="font-bold text-lg">土地データリスト</h3>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs text-red-500 hover:bg-red-50"
                                    onClick={handleResetJapan}
                                >
                                    🇯🇵 日本データをリセット
                                </Button>
                            </div>
                            <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                                {(() => {
                                    let filtered = gameState.lands || [];

                                    // 地域フィルター
                                    if (activeRegion !== 'all') {
                                        filtered = filtered.filter(l => {
                                            const landRegion = getRegionId(l);
                                            if (activeRegion === 'japan') {
                                                // 日本（都道府県含む）
                                                return l.id === 'country_日本' || landRegion === 'japan';
                                            }
                                            return landRegion === activeRegion;
                                        });
                                    }

                                    // 検索フィルター
                                    if (searchTerm) {
                                        const s = searchTerm.toLowerCase();
                                        filtered = filtered.filter(l =>
                                            l.address.toLowerCase().includes(s) ||
                                            l.id.toLowerCase().includes(s)
                                        );
                                    }

                                    if (filtered.length === 0) {
                                        return <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-lg border border-dashed">候補が見つかりませんでした</div>;
                                    }

                                    return (
                                        <>
                                            {filtered.slice(0, 100).map(l => (
                                                <div key={l.id}
                                                    className="bg-white border p-3 rounded hover:shadow cursor-pointer transition-shadow"
                                                    onClick={() => setEditingLand(l)}
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <div className="font-bold text-sm">{l.address} <span className="text-xs text-gray-400 font-mono">({l.id})</span></div>
                                                            <div className="flex gap-2 text-xs text-gray-600 mt-1">
                                                                <span>{l.zoning}</span>
                                                                <span>|</span>
                                                                <span>{l.size?.toLocaleString()}m²</span>
                                                                <span>|</span>
                                                                <span className={l.isForSale ? "text-blue-600 font-bold" : "text-red-500"}>
                                                                    {l.isForSale ? '販売中' : '非売品'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex flex-col items-end gap-1">
                                                            <div className="font-bold">{l.price.toLocaleString()}円</div>
                                                            {(l.maintenanceFee || 0) > 0 && (
                                                                <div className="text-xs text-red-500">維持費: {l.maintenanceFee}</div>
                                                            )}
                                                            <Button size="sm" variant="danger" className="text-[10px] py-0.5 h-auto" onClick={(e) => handleDeleteLand(l.id, e)}>削除</Button>
                                                        </div>
                                                    </div>
                                                    {l.ownerId && (
                                                        <div className="text-xs text-green-600 mt-1 pt-1 border-t border-dashed">
                                                            所有者: {gameState.users.find(u => u.id === l.ownerId)?.name || 'Unknown'}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                            {filtered.length > 100 && (
                                                <div className="text-center text-gray-500 text-sm py-2 bg-gray-50 rounded mt-2">
                                                    （他 {filtered.length - 100} 件は省略されています。検索してください）
                                                </div>
                                            )}
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Form */}

                        <Card title="土地データ新規登録" padding="md">
                            <div className="space-y-4">
                                <p className="text-sm text-gray-500 mb-2">手動で特殊な土地を追加する場合に使用します。</p>
                                <div>
                                    <label className="block text-sm font-bold mb-1">ID (任意)</label>
                                    <input
                                        className="w-full p-2 border rounded"
                                        value={landForm.id}
                                        onChange={e => setLandForm({ ...landForm, id: e.target.value })}
                                        placeholder="例: 10-10 (空欄で自動生成)"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">住所/地番</label>
                                    <input
                                        className="w-full p-2 border rounded"
                                        value={landForm.address}
                                        onChange={e => setLandForm({ ...landForm, address: e.target.value })}
                                        placeholder="例: 中央区銀座 1-1"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold mb-1">地価</label>
                                        <input
                                            type="number"
                                            className="w-full p-2 border rounded"
                                            value={landForm.price}
                                            onChange={e => setLandForm({ ...landForm, price: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold mb-1">広さ (m²)</label>
                                        <input
                                            type="number"
                                            className="w-full p-2 border rounded"
                                            value={landForm.size}
                                            onChange={e => setLandForm({ ...landForm, size: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold mb-1">用途地域</label>
                                    <select
                                        className="w-full p-2 border rounded"
                                        value={landForm.zoning}
                                        onChange={e => setLandForm({ ...landForm, zoning: e.target.value })}
                                    >
                                        <option value="residential">住宅地 (Residential)</option>
                                        <option value="commercial">商業地 (Commercial)</option>
                                        <option value="industrial">工業地 (Industrial)</option>
                                    </select>
                                </div>
                                <Button onClick={handleAddLand} className="w-full">土地を追加</Button>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {editingLand && (
                    <LandEditor
                        land={editingLand}
                        onClose={() => setEditingLand(null)}
                        onSave={handleUpdateLand}
                        onDelete={(id, e) => {
                            setEditingLand(null);
                            handleDeleteLand(id, e);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );

    // ポップアップモードの場合はモーダルオーバーレイで包む
    if (isPopup) {
        return (
            <AnimatePresence>
                {isPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {content}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        );
    }

    return content;
}
