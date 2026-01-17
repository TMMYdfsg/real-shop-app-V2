'use client';

import React from 'react';
import Image from 'next/image';

interface PlayerIconProps {
    playerIcon?: string;
    playerName: string;
    size?: number;
    className?: string;
}

export const PlayerIcon: React.FC<PlayerIconProps> = ({
    playerIcon,
    playerName,
    size = 48,
    className = ''
}) => {
    // カスタムアイコン（Base64）かどうかチェック
    const isCustomIcon = playerIcon?.startsWith('data:image');

    // プリセットアイコンのパスを生成
    const iconPath: string = isCustomIcon
        ? playerIcon!
        : playerIcon
            ? `/icons/player/${playerIcon}`
            : '/icons/player/default.png';

    return (
        <div
            className={`relative rounded-full overflow-hidden shrink-0 bg-gray-100 ${className}`}
            style={{ width: size, height: size }}
        >
            <Image
                src={iconPath}
                alt={`${playerName}のアイコン`}
                width={size}
                height={size}
                unoptimized
                className="w-full h-full object-cover"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = '/icons/player/default.png';
                }}
            />
        </div>
    );
};
