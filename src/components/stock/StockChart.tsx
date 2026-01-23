'use client';

import React, { useState } from 'react';
import { Stock, Crypto } from '@/types';

interface StockChartProps {
    stock: Stock | Crypto;
    height?: number;
    showControls?: boolean;
}

type ChartType = 'line' | 'candlestick';

interface CandleData {
    open: number;
    close: number;
    high: number;
    low: number;
}

// ローソク足データを生成（価格履歴から近似）
const generateCandleData = (priceHistory: number[]): CandleData[] => {
    const candles: CandleData[] = [];
    for (let i = 0; i < priceHistory.length; i++) {
        const current = priceHistory[i];
        const prev = i > 0 ? priceHistory[i - 1] : current;
        // シミュレートされた高値/安値（実際は±5%の変動を仮定）
        const volatility = current * 0.03;
        const isUp = current >= prev;
        candles.push({
            open: prev,
            close: current,
            high: Math.max(prev, current) + volatility * Math.random(),
            low: Math.min(prev, current) - volatility * Math.random(),
        });
    }
    return candles;
};

export const StockChart: React.FC<StockChartProps> = ({
    stock,
    height = 120,
    showControls = true
}) => {
    const [chartType, setChartType] = useState<ChartType>('line');
    const history = stock.priceHistory || [stock.price];

    if (history.length < 2) {
        return (
            <div className="p-4 text-center text-gray-400 text-sm bg-gray-50 rounded-xl">
                📊 データ不足（2ターン以上必要）
            </div>
        );
    }

    const candles = generateCandleData(history);
    const allPrices = candles.flatMap(c => [c.high, c.low]);
    const maxPrice = Math.max(...allPrices);
    const minPrice = Math.min(...allPrices);
    const priceRange = maxPrice - minPrice || 1;

    const width = 320;
    const padding = { top: 10, right: 50, bottom: 25, left: 10 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // トレンド判定
    const isUptrend = history[history.length - 1] > history[0];
    const trendColor = isUptrend ? '#22c55e' : '#ef4444';
    const trendColorLight = isUptrend ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)';

    // 座標計算ヘルパー
    const getX = (index: number) => padding.left + (index / (history.length - 1)) * chartWidth;
    const getY = (price: number) => padding.top + ((maxPrice - price) / priceRange) * chartHeight;

    // 折れ線グラフのパスとエリア
    const linePath = history.map((price, i) => {
        const x = getX(i);
        const y = getY(price);
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');

    const areaPath = linePath +
        ` L ${getX(history.length - 1)} ${height - padding.bottom}` +
        ` L ${padding.left} ${height - padding.bottom} Z`;

    // 価格軸ラベル（3段階）
    const priceLabels = [maxPrice, (maxPrice + minPrice) / 2, minPrice];

    // 時間軸ラベル
    const timeLabels = history.length > 5
        ? [`${history.length - 1}T前`, `${Math.floor(history.length / 2)}T前`, '現在']
        : ['開始', '現在'];

    // グラデーション定義ID
    const gradientId = `chart-gradient-${stock.id}`;

    return (
        <div className="bg-slate-900 rounded-xl p-3 shadow-lg">
            {/* ヘッダー */}
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                    <span className="text-white font-bold text-sm">{stock.name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${isUptrend ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {isUptrend ? '▲' : '▼'} {Math.abs(((history[history.length - 1] - history[0]) / history[0]) * 100).toFixed(1)}%
                    </span>
                </div>
                {showControls && (
                    <div className="flex gap-1">
                        <button
                            onClick={() => setChartType('line')}
                            className={`px-2 py-1 text-xs rounded transition-colors ${chartType === 'line'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                                }`}
                        >
                            折れ線
                        </button>
                        <button
                            onClick={() => setChartType('candlestick')}
                            className={`px-2 py-1 text-xs rounded transition-colors ${chartType === 'candlestick'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-slate-700 text-gray-400 hover:bg-slate-600'
                                }`}
                        >
                            ローソク
                        </button>
                    </div>
                )}
            </div>

            {/* チャート本体 */}
            <svg width={width} height={height} className="block">
                <defs>
                    <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={trendColor} stopOpacity="0.4" />
                        <stop offset="100%" stopColor={trendColor} stopOpacity="0.02" />
                    </linearGradient>
                </defs>

                {/* グリッド線 */}
                {[0, 0.5, 1].map((ratio, i) => (
                    <line
                        key={i}
                        x1={padding.left}
                        y1={padding.top + ratio * chartHeight}
                        x2={width - padding.right}
                        y2={padding.top + ratio * chartHeight}
                        stroke="#334155"
                        strokeWidth="1"
                        strokeDasharray="4,4"
                    />
                ))}

                {chartType === 'line' ? (
                    <>
                        {/* グラデーションエリア */}
                        <path d={areaPath} fill={`url(#${gradientId})`} />
                        {/* ライン */}
                        <path
                            d={linePath}
                            fill="none"
                            stroke={trendColor}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        {/* 現在価格ドット */}
                        <circle
                            cx={getX(history.length - 1)}
                            cy={getY(history[history.length - 1])}
                            r="5"
                            fill={trendColor}
                            stroke="white"
                            strokeWidth="2"
                        />
                        {/* 開始価格ドット */}
                        <circle
                            cx={getX(0)}
                            cy={getY(history[0])}
                            r="3"
                            fill="#94a3b8"
                        />
                    </>
                ) : (
                    /* ローソク足 */
                    candles.map((candle, i) => {
                        const x = getX(i);
                        const isGreen = candle.close >= candle.open;
                        const color = isGreen ? '#22c55e' : '#ef4444';
                        const candleWidth = Math.max(chartWidth / history.length - 2, 4);
                        const halfWidth = candleWidth / 2;

                        const bodyTop = getY(Math.max(candle.open, candle.close));
                        const bodyBottom = getY(Math.min(candle.open, candle.close));
                        const bodyHeight = Math.max(bodyBottom - bodyTop, 1);

                        return (
                            <g key={i}>
                                {/* ヒゲ（高値-安値） */}
                                <line
                                    x1={x}
                                    y1={getY(candle.high)}
                                    x2={x}
                                    y2={getY(candle.low)}
                                    stroke={color}
                                    strokeWidth="1"
                                />
                                {/* ボディ（始値-終値） */}
                                <rect
                                    x={x - halfWidth}
                                    y={bodyTop}
                                    width={candleWidth}
                                    height={bodyHeight}
                                    fill={isGreen ? color : color}
                                    stroke={color}
                                    strokeWidth="1"
                                    rx="1"
                                />
                            </g>
                        );
                    })
                )}

                {/* 価格軸ラベル（右側） */}
                {priceLabels.map((price, i) => (
                    <text
                        key={i}
                        x={width - padding.right + 5}
                        y={padding.top + (i * chartHeight / 2) + 4}
                        fill="#94a3b8"
                        fontSize="10"
                        fontWeight="500"
                    >
                        {price >= 1000 ? `${(price / 1000).toFixed(1)}k` : price.toFixed(0)}
                    </text>
                ))}

                {/* 時間軸ラベル（下部） */}
                {history.length > 5 ? (
                    <>
                        <text x={padding.left} y={height - 5} fill="#64748b" fontSize="9">{history.length - 1}T前</text>
                        <text x={padding.left + chartWidth / 2} y={height - 5} fill="#64748b" fontSize="9" textAnchor="middle">{Math.floor(history.length / 2)}T前</text>
                        <text x={width - padding.right} y={height - 5} fill="#64748b" fontSize="9" textAnchor="end">現在</text>
                    </>
                ) : (
                    <>
                        <text x={padding.left} y={height - 5} fill="#64748b" fontSize="9">開始</text>
                        <text x={width - padding.right} y={height - 5} fill="#64748b" fontSize="9" textAnchor="end">現在</text>
                    </>
                )}

                {/* 現在価格ライン */}
                <line
                    x1={padding.left}
                    y1={getY(history[history.length - 1])}
                    x2={width - padding.right}
                    y2={getY(history[history.length - 1])}
                    stroke={trendColor}
                    strokeWidth="1"
                    strokeDasharray="3,3"
                    opacity="0.6"
                />
            </svg>

            {/* 価格情報フッター */}
            <div className="flex justify-between text-xs mt-2 text-slate-400">
                <span>安値: <span className="text-red-400 font-bold">{minPrice.toLocaleString()}</span></span>
                <span className="text-white font-bold text-sm">
                    現在: {stock.price.toLocaleString()}枚
                </span>
                <span>高値: <span className="text-green-400 font-bold">{maxPrice.toLocaleString()}</span></span>
            </div>
        </div>
    );
};
