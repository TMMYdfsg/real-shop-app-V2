'use client';

import React, { useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export function RealEstateManager() {
    const { gameState } = useGame();
    const [activeTab, setActiveTab] = useState<'properties' | 'lands'>('properties');

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
        } catch (e) {
            console.error(e);
            alert('エラーが発生しました');
        }
    };

    return (
        <div className="space-y-6">
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
                    🗺️ 市街地 (土地)
                </button>
            </div>

            {/* Properties Tab */}
            {activeTab === 'properties' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* List */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg">市街地データ ({gameState.lands?.length || 0})</h3>
                        <p className="text-xs text-gray-500">※ここでの追加はマニュアル登録です。通常は初期生成されます。</p>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto">
                            {gameState.lands?.slice(0, 50).map(l => (
                                <Card key={l.id} padding="sm">
                                    <div className="flex justify-between">
                                        <div className="font-bold">{l.address} <span className="text-xs text-gray-400">({l.id})</span></div>
                                        <div className="text-right">
                                            <div>{l.price.toLocaleString()}円</div>
                                            <div className="text-xs">{l.zoning} / {l.size}m²</div>
                                        </div>
                                    </div>
                                    {l.ownerId && <div className="text-xs text-green-600 mt-1">所有者: {gameState.users.find(u => u.id === l.ownerId)?.name}</div>}
                                </Card>
                            ))}
                            {gameState.lands && gameState.lands.length > 50 && (
                                <div className="text-center text-gray-500 text-sm">他 {gameState.lands.length - 50} 件...</div>
                            )}
                        </div>
                    </div>

                    {/* Form */}
                    <Card title="土地データ手動追加">
                        <div className="space-y-4">
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
            )}
        </div>
    );
}
