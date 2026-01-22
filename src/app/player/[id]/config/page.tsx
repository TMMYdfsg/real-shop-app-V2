'use client';

import React, { useEffect, useState } from 'react';
import { useGame } from '@/context/GameContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { IconSelector } from '@/components/ui/IconSelector';
import { motion } from 'framer-motion';
import { TRAITS } from '@/lib/gameData';

export default function ConfigPage() {
    const { currentUser, sendRequest, refresh } = useGame();

    // プロファイル設定
    const [playerName, setPlayerName] = useState(currentUser?.name || '');
    const [shopName, setShopName] = useState(currentUser?.shopName || currentUser?.name || '');
    const [playerIcon, setPlayerIcon] = useState(currentUser?.playerIcon || 'default.png');
    const [traits, setTraits] = useState<string[]>(currentUser?.traits || []);
    const [customIcons, setCustomIcons] = useState<string[]>(currentUser?.smartphone?.settings?.customIcons || []);

    // ショップ・契約設定
    const [cardType, setCardType] = useState<'point' | 'stamp'>(currentUser?.cardType || 'point');
    const [isInsured, setIsInsured] = useState(currentUser?.isInsured || false);
    const [propertyLevel, setPropertyLevel] = useState(currentUser?.propertyLevel || 'none');

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!currentUser) return;
        setPlayerName(currentUser.name || '');
        setShopName(currentUser.shopName || currentUser.name || '');
        setPlayerIcon(currentUser.playerIcon || 'default.png');
        setCardType(currentUser.cardType || 'point');
        setIsInsured(currentUser.isInsured || false);
        setPropertyLevel(currentUser.propertyLevel || 'none');
        setTraits(currentUser.traits || []);
        setCustomIcons(currentUser.smartphone?.settings?.customIcons || []);
    }, [currentUser]);

    if (!currentUser) return <div>Loading...</div>;

    const handleSave = async () => {
        setIsSaving(true);
        await sendRequest('update_profile', 0, {
            name: playerName,
            shopName,
            playerIcon,
            cardType,
            isInsured,
            propertyLevel,
            smartphone: { settings: { customIcons } }
        });
        refresh();
        setIsSaving(false);
    };

    const handleTraitReset = async () => {
        if (!confirm('性格をリセットしますか？次の画面で再選択が必要です。')) return;
        await sendRequest('update_profile', 0, { traits: [], needsTraitSelection: true });
        refresh();
    };

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <motion.h2
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}
            >
                ⚙️ 設定
            </motion.h2>

            {/* プロファイル設定セクション */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card padding="lg" className="mb-6">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#7c3aed' }}>
                        👤 プロファイル設定
                    </h3>

                    {/* プレイヤー名 */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            プレイヤー名
                        </label>
                        <input
                            type="text"
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                fontSize: '1rem',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                            placeholder="例: ともや"
                        />
                        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.3rem' }}>
                            あなたの名前です。他のプレイヤーにも表示されます。
                        </p>
                    </div>

                    {/* プレイヤーアイコン */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            プレイヤーアイコン
                        </label>
                        <IconSelector
                            selectedIcon={playerIcon}
                            customIcons={customIcons}
                            onSelect={(icon) => {
                                if (icon.startsWith('data:image') && !customIcons.includes(icon)) {
                                    setCustomIcons((prev) => [...prev, icon]);
                                }
                                setPlayerIcon(icon);
                            }}
                        />
                        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                            プロフィール画像として使用されます。プリセットまたはカスタム画像を選択できます。
                        </p>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            性格
                        </label>
                        <div style={{ padding: '0.8rem', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#f9fafb' }}>
                            <div style={{ fontWeight: 'bold' }}>{traits?.[0] || '未設定'}</div>
                            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.3rem' }}>
                                {traits?.[0] ? TRAITS[traits[0]]?.description : '性格をリセットすると最初の画面で選べます。'}
                            </div>
                        </div>
                        <Button variant="secondary" onClick={handleTraitReset} style={{ marginTop: '0.8rem' }}>
                            性格をリセット
                        </Button>
                    </div>
                </Card>
            </motion.div>

            {/* ショップ設定セクション */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card padding="lg" className="mb-6">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#059669' }}>
                        🏪 ショップ設定
                    </h3>

                    {/* ショップ名 */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            お店の名前
                        </label>
                        <input
                            type="text"
                            value={shopName}
                            onChange={(e) => setShopName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                fontSize: '1rem',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                            placeholder="例: トモヤの雑貨屋さん"
                        />
                    </div>

                    {/* ポイントカードデザイン */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            ポイントカードのデザイン
                        </label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="cardType"
                                    value="point"
                                    checked={cardType === 'point'}
                                    onChange={() => setCardType('point')}
                                />
                                数値タイプ (Pt)
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="cardType"
                                    value="stamp"
                                    checked={cardType === 'stamp'}
                                    onChange={() => setCardType('stamp')}
                                />
                                スタンプタイプ (個数)
                            </label>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* 契約・生活情報セクション */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card padding="lg" className="mb-6">
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '1rem', color: '#1d4ed8' }}>
                        🏥 契約・生活情報
                    </h3>

                    {/* 医療保険 */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            cursor: 'pointer',
                            fontWeight: 'bold'
                        }}>
                            <input
                                type="checkbox"
                                checked={isInsured}
                                onChange={(e) => setIsInsured(e.target.checked)}
                                style={{ width: '1.2rem', height: '1.2rem' }}
                            />
                            医療保険に加入する (月額 300枚)
                        </label>
                        <p style={{ fontSize: '0.8rem', color: '#666', marginLeft: '1.8rem', marginTop: '0.2rem' }}>
                            加入すると、病気になった際の治療費が大幅に安くなります (5000枚 → 500枚)。
                        </p>
                    </div>

                    {/* 住居契約 */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            住居契約 (土地・家賃)
                        </label>
                        <select
                            value={propertyLevel}
                            // @ts-ignore
                            onChange={(e) => setPropertyLevel(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.8rem',
                                fontSize: '1rem',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        >
                            <option value="none">ホームレス / 実家 (0枚/ターン)</option>
                            <option value="apartment">アパート (500枚/ターン)</option>
                            <option value="house">一軒家 (2,000枚/ターン)</option>
                            <option value="mansion">高級マンション (10,000枚/ターン)</option>
                        </select>
                        <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '0.3rem' }}>
                            良い家に住むと幸福度や評価が上がるかもしれません(未実装)。支払いは毎ターン発生します。
                        </p>
                    </div>

                    {/* 健康状態 */}
                    <div style={{
                        marginBottom: '1.5rem',
                        padding: '1rem',
                        background: '#ecfdf5',
                        borderRadius: '8px'
                    }}>
                        <div style={{ fontWeight: 'bold', color: '#047857' }}>
                            現在の健康状態: {currentUser.health ?? 100}%
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#065f46' }}>
                            30%を下回ると入院・治療費が発生します。
                        </p>
                    </div>
                </Card>
            </motion.div>

            {/* 保存ボタン */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                <Button onClick={handleSave} disabled={isSaving} className="w-full">
                    💾 すべての設定を保存
                </Button>
            </motion.div>
        </div>
    );
}
