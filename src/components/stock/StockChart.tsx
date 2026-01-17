import React from 'react';
import { Stock } from '@/types';

interface StockChartProps {
    stock: Stock;
}

export const StockChart: React.FC<StockChartProps> = ({ stock }) => {
    const history = stock.priceHistory || [stock.price];

    if (history.length < 2) {
        return (
            <div style={{
                padding: '1rem',
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '0.9rem'
            }}>
                データ不足（2ターン以上必要）
            </div>
        );
    }

    const maxPrice = Math.max(...history);
    const minPrice = Math.min(...history);
    const priceRange = maxPrice - minPrice || 1;

    const width = 300;
    const height = 100;
    const padding = 10;

    // Calculate points for line
    const points = history.map((price, i) => {
        const x = padding + (i / (history.length - 1)) * (width - padding * 2);
        const y = height - padding - ((price - minPrice) / priceRange) * (height - padding * 2);
        return `${x},${y}`;
    }).join(' ');

    // Determine color based on trend
    const isUptrend = history[history.length - 1] > history[0];
    const lineColor = isUptrend ? '#10b981' : '#ef4444';

    return (
        <div style={{
            background: '#f9fafb',
            borderRadius: '8px',
            padding: '0.5rem',
            marginTop: '0.5rem'
        }}>
            <svg width={width} height={height} style={{ display: 'block' }}>
                {/* Background grid */}
                <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#e5e7eb" strokeWidth="1" />

                {/* Price line */}
                <polyline
                    points={points}
                    fill="none"
                    stroke={lineColor}
                    strokeWidth="2"
                    strokeLinejoin="round"
                />

                {/* Dots at each point */}
                {history.map((price, i) => {
                    const x = padding + (i / (history.length - 1)) * (width - padding * 2);
                    const y = height - padding - ((price - minPrice) / priceRange) * (height - padding * 2);
                    return (
                        <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="3"
                            fill={lineColor}
                        />
                    );
                })}
            </svg>

            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '0.75rem',
                color: '#6b7280',
                marginTop: '0.25rem'
            }}>
                <span>最低: {minPrice.toLocaleString()}枚</span>
                <span>最高: {maxPrice.toLocaleString()}枚</span>
            </div>
        </div>
    );
};
