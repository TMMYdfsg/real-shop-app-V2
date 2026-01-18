'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function HelpFloatingButton() {
    const router = useRouter();
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // ログイン画面や特定ページでは非表示にする制御
        const hiddenPaths = ['/', '/login', '/signup'];
        setIsVisible(!hiddenPaths.includes(pathname));
    }, [pathname]);

    if (!isVisible) return null;

    return (
        <button
            onClick={() => router.push('/help')}
            className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform z-50 group"
            aria-label="ヘルプ"
        >
            <span className="text-3xl font-bold">?</span>

            {/* Tooltip */}
            <span className="absolute right-full mr-3 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                ヘルプ＆マニュアル
            </span>
        </button>
    );
}
