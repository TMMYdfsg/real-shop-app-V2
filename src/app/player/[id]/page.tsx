'use client';

export const dynamic = "force-dynamic";

import React, { use, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useGame } from '@/context/GameContext';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { DataTable } from '@/components/ui/DataTable';
import { StatCard } from '@/components/kpi/StatCard';
import nextDynamic from 'next/dynamic';

// Dynamic import for BankTerminal to avoid SSR issues if any
const BankTerminal = nextDynamic(() => import('@/components/banking/BankTerminal'), { ssr: false });

const SOUND_LIBRARY = [
    'BGM1.mp3',
    'BGM2.mp3',
    'BGM3.mp3',
    'BGM4.mp3',
    'BGM5.wav',
    'BGM6.mp3',
    'BGM7.mp3',
    'BGM8.mp3',
    'BGM9.mp3',
    'BGM10.mp3',
    'BGM11.mp3',
    'BGM12.mp3',
    'BGM13.mp3',
    'fbi-open-up-.mp3',
    'FFの勝利音.mp3',
    'JOJO.mp3',
    'To be Conte.mp3',
    'WATTS？？？？？？.mp3',
    'Wiiショップ.mp3',
    'Wiiチャンネル.mp3',
    'いええええええええええい.mp3',
    'いかゲーム.mp3',
    'いびき1.mp3',
    'うんち！.mp3',
    'でぇん！1.mp3',
    'でぇん！2.mp3',
    'でぇん！3.mp3',
    'でぇん！4.mp3',
    'でぇん！5.mp3',
    'でぇん！6.mp3',
    'でぇん！7.mp3',
    'なにぃ！？.mp3',
    'にゃうにゃうにゃう.mp3',
    'ﾊﾞﾝﾊﾞﾝﾊﾞﾝ.wav',
    'ﾌﾞﾘｭｭｭｭｭ.mp3',
    'へー.mp3',
    'ﾍﾟﾛﾝｯ.mp3',
    'みこちのあんだぉ.mp3',
    'みこちのやんのかってぇ.mp3',
    'みんな大好きみこちのあんだぉ.mp3',
    'はぁ？.mp3',
    'あきらめんなよ、修造.mp3',
    'あつ森の声.mp3',
    'しぃ〜.wav',
    'エセドラえもん.mp3',
    'サイコ.wav',
    'ジュルッ.mp3',
    'スター🌟.mp3',
    'クワッ.wav',
    'ウィンドゥーズエラー音.mp3',
    'ウィンドゥーズシャットダウン.mp3',
    'ウィンドゥーズ起動音.mp3',
    'ウワァァァァァァ.mp3',
    'わぁお.mp3',
    'ヤメローシニタクナーイ！ .mp3',
    'テレポート.mp3',
    'デゥ.mp3',
    'デデドン.mp3',
    'リコーダーでタイタニック.mp3',
    'ワタファ！？.mp3',
    'ロブロックス ウゥ！.mp3',
    'ムスカ 3分間.mp3',
    'ムスカ どこへ行こうと.mp3',
    'ムスカ お静かに.mp3',
    'ムスカ ラピュタは滅びぬ.mp3',
    'ムスカ ロボットの兵隊.mp3',
    'ムスカ 人がゴミ.mp3',
    'ムスカ 何をする.mp3',
    'ムスカ 大砲で.mp3',
    'ムスカ 時間だ.mp3',
    'ムスカ 最高のショー.mp3',
    'ムスカ 焼き払う.mp3',
    'ムスカ 私をあまり怒らせないで.mp3',
    'ムスカ 聖域.mp3',
    'ムスカ 言葉を慎み.mp3',
    'ムスカ 読める.mp3',
    'ムスカ 雷.mp3',
    'ムスカ 鬼ごっこ.mp3',
    'トムの叫び声.mp3',
    'トゥーサウザンドアワーズレイター.mp3',
    'ドラクエ MISS.mp3',
    'ナイス.wav',
    'ニワトリの鳴き声1.mp3',
    'ハリーポッターの下手なフルート.wav',
    'ハロー？.mp3',
    'ハローデェア.mp3',
    'ハッピーハッピーハーピッー.mp3',
    'ババイ.mp3',
    'ビーバーの叫び声.mp3',
    'ピプゥ.mp3',
    'ピー音.mp3',
    'ピュゥー.wav',
    'フランスの音楽.mp3',
    'ブラ.wav',
    'ブロリーです.mp3',
    'プゥー(エコー).mp3',
    'ヘヘボーイ.mp3',
    'ポーン.mp3',
    'マイクラ 飲む音.mp3',
    'ミニオン ケツ.mp3',
    '何やってんだお前.mp3',
    '叫ぶヤギ.wav',
    '大笑い.mp3',
    '天国👼.mp3',
    '己の無力をシルガイイー.mp3',
    '巨人化.mp3',
    '巻き戻し.mp3',
    '後半へ続く！.mp3',
    '怪しい行動.wav',
    '悲しい時2.wav',
    '悲しい時.mp3',
    '悲しい時(エアホーン).mp3',
    '村人.mp3',
    '残念でした.mp3',
    '消しゴムマジック.mp3',
    '猫ミームヤギ.mp3',
    '真剣なとき.mp3',
    '究極の選択BGM.mp3',
    '笑い声1.mp3',
    '笑い声2.mp3',
    '粉バナナ.mp3',
    '負け犬エモート.mp3',
    '赤ちゃんの笑い声.mp3',
    '逃げ足.mp3',
    '野々村.mp3',
    '開けろ、デトロイト市警だ！.mp3',
    '闇に惑えmp3 着メロ.mp3',
    '魂を喰らう死神の物真似.mp3',
    '！？！？！？！？.mp3',
    '(」’ω’)」ｵｫｵｫｵ!!!ｳｳｩｩｱｱｫｵ!!!!!!.wav',
    '？？？？？？？.wav',
    'adin.wav'
];

type SoundButton = {
    id: string;
    name: string;
    file: string;
};

export default function PlayerHome({ params }: { params: Promise<{ id: string }> }) {
    // Unwrapping params using React.use()
    const { id } = use(params);
    const { gameState, currentUser, refresh } = useGame();
    const [isBankOpen, setIsBankOpen] = useState(false);
    const [soundSelect, setSoundSelect] = useState(SOUND_LIBRARY[0]);
    const [soundButtons, setSoundButtons] = useState<SoundButton[]>([]);
    const soundBoardKey = `soundboard:player:${id}`;

    if (!gameState) return <div className="ui-container ui-muted">Loading world data...</div>;

    // Game Start Lock (Check this FIRST, before currentUser check)
    if (gameState.settings.isGameStarted === false) {
        return (
            <div className="night-overlay">
                <div className="u-text-center u-max-w-md">
                    <div className="ui-title">🛑</div>
                    <h1 className="ui-title">準備中</h1>
                    <p className="ui-muted">
                        ゲームが初期化されました。<br />
                        管理者がゲームを開始するまで<br />
                        しばらくお待ちください。
                    </p>
                    <div className="ui-muted">Waiting for admin...</div>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="ui-container">
                <Card>
                    <CardHeader>
                        <CardTitle>ユーザーエラー</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="ui-muted">ユーザー情報が見つかりませんでした。ゲームがリセットされた可能性があります。</p>
                        <div className="u-mt-4">
                            <Button onClick={() => window.location.href = '/'}>
                                トップに戻る
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleBankAction = async (type: string, details: any) => {
        try {
            await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    requesterId: currentUser.id,
                    details
                })
            });
            await refresh();
        } catch (error) {
            console.error('Bank action failed:', error);
        }
    };

    useEffect(() => {
        try {
            const saved = localStorage.getItem(soundBoardKey);
            if (saved) {
                setSoundButtons(JSON.parse(saved));
            }
        } catch {
            setSoundButtons([]);
        }
    }, [soundBoardKey]);

    useEffect(() => {
        try {
            localStorage.setItem(soundBoardKey, JSON.stringify(soundButtons));
        } catch {
            // ignore storage failures
        }
    }, [soundBoardKey, soundButtons]);

    const kpis = [
        { label: '資産', value: `${currentUser.balance.toLocaleString()}枚`, icon: '💰' },
        { label: '預金', value: `${currentUser.deposit.toLocaleString()}枚`, icon: '🏦' },
        { label: '借金', value: `${currentUser.debt.toLocaleString()}枚`, icon: '💸' },
        { label: '幸福', value: `${currentUser.happiness}`, icon: '😊' },
        { label: '信用', value: `${currentUser.popularity}`, icon: '📈' },
    ];

    const actions = [
        { label: '仕事をする', href: `${currentUser.id}/special`, badge: '収入' },
        { label: 'マイショップ', href: `${currentUser.id}/shop`, badge: '経営' },
        { label: '投資・株', href: `${currentUser.id}/stock`, badge: '投資' },
        { label: '交流・移動', href: `${currentUser.id}/map`, badge: 'ライフ' },
    ];

    const marketRows = useMemo(() => {
        return gameState.stocks.slice(0, 5).map((stock) => ({
            id: stock.id,
            name: stock.name,
            price: stock.price,
            previous: stock.previousPrice,
        }));
    }, [gameState.stocks]);

    const columns = [
        { key: 'name', header: '銘柄' },
        {
            key: 'price',
            header: '価格',
            render: (row: { price: number }) => `${row.price.toLocaleString()}枚`,
        },
        {
            key: 'previous',
            header: '変化',
            render: (row: { price: number; previous: number }) => {
                const diff = row.price - row.previous;
                const trend = diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat';
                const label = `${diff >= 0 ? '+' : ''}${diff.toLocaleString()}`;
                return <Chip status={trend === 'up' ? 'success' : trend === 'down' ? 'danger' : 'neutral'}>{label}</Chip>;
            },
        },
    ];

    // Main Dashboard Interface
    return (
        <div className="ui-stack u-max-w-lg u-mx-auto">
            <div className="ui-stack">
                <div className="ui-subtitle">今日のダッシュボード</div>
                <div className="ui-muted">経済とライフの両面から状況を確認できます。</div>
            </div>

            <div className="ui-grid">
                {kpis.map((kpi) => (
                    <StatCard key={kpi.label} label={kpi.label} value={kpi.value} icon={kpi.icon} />
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>今日の行動</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="ui-grid">
                        {actions.map((action) => (
                            <Link key={action.label} href={`/player/${action.href}`}>
                                <Card clickable>
                                    <CardContent>
                                        <div className="ui-stack">
                                            <div className="ui-inline u-justify-between">
                                                <div className="ui-subtitle">{action.label}</div>
                                                <Chip density="compact">{action.badge}</Chip>
                                            </div>
                                            <span className="ui-muted">今すぐ行動する →</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>サウンドボード</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="ui-stack">
                        <div className="text-xs text-slate-500">
                            効果音を選んでボタンに追加できます。名前は自由に編集できます。
                        </div>
                        <div className="ui-inline u-gap-2">
                            <select
                                value={soundSelect}
                                onChange={(e) => setSoundSelect(e.target.value)}
                                className="flex-1 h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700"
                            >
                                {SOUND_LIBRARY.map((sound) => (
                                    <option key={sound} value={sound}>{sound}</option>
                                ))}
                            </select>
                            <Button
                                className="h-10 rounded-full bg-indigo-600 text-white font-bold px-4"
                                onClick={() => {
                                    setSoundButtons((prev) => ([
                                        ...prev,
                                        {
                                            id: crypto.randomUUID(),
                                            name: soundSelect.replace(/\.(mp3|wav)$/i, ''),
                                            file: soundSelect
                                        }
                                    ]));
                                }}
                            >
                                追加
                            </Button>
                        </div>
                        {soundButtons.length === 0 ? (
                            <div className="text-center text-xs text-slate-400 py-4">
                                まだボタンがありません
                            </div>
                        ) : (
                            <div className="ui-grid">
                                {soundButtons.map((item) => (
                                    <div key={item.id} className="ui-stack">
                                        <button
                                            className="w-full h-12 rounded-full bg-slate-900 text-white text-xs font-bold shadow-sm hover:bg-slate-800"
                                            onClick={() => {
                                                const audio = new Audio(`/sounds/${item.file}`);
                                                audio.volume = 0.9;
                                                audio.play().catch(() => { });
                                            }}
                                        >
                                            ▶ {item.name}
                                        </button>
                                        <input
                                            value={item.name}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setSoundButtons((prev) => prev.map((btn) => (
                                                    btn.id === item.id ? { ...btn, name: value } : btn
                                                )));
                                            }}
                                            className="w-full h-8 rounded-lg border border-slate-200 px-2 text-[10px] font-bold text-slate-600"
                                        />
                                        <Button
                                            className="h-7 w-full rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold"
                                            onClick={() => {
                                                setSoundButtons((prev) => prev.filter((btn) => btn.id !== item.id));
                                            }}
                                        >
                                            削除
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>市場トレンド</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        data={marketRows}
                        columns={columns}
                        rowKey={(row) => row.id}
                        density="compact"
                        emptyMessage="市場データがまだありません。"
                    />
                    <Button size="sm" onClick={() => setIsBankOpen(true)}>
                        銀行端末を開く
                    </Button>
                </CardContent>
            </Card>

            {isBankOpen && (
                <BankTerminal
                    user={currentUser}
                    economy={gameState.economy}
                    onClose={() => setIsBankOpen(false)}
                    onAction={handleBankAction}
                />
            )}
        </div>
    );
}
