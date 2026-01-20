'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface UseRealtimeOptions {
    interval?: number; // polling interval in ms
    enabled?: boolean; // enable/disable polling
    requiresAuth?: boolean; // 認証が必要なAPIの場合、401エラーを静かに処理
}

export function useRealtime<T>(
    url: string,
    options: UseRealtimeOptions = {}
) {
    const { interval = 5000, enabled = true, requiresAuth = true } = options;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const hasLoggedAuthError = useRef(false);

    const fetchData = useCallback(async () => {
        if (!url) return; // URLが空の場合はスキップ

        try {
            setError(null);
            const res = await fetch(url, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                },
            });

            if (res.status === 401) {
                // 認証エラー: 静かに処理（一度だけログ）
                setIsAuthenticated(false);
                setIsConnected(true); // Server is reachable, just auth error
                if (requiresAuth && !hasLoggedAuthError.current) {
                    console.debug(`[useRealtime] Auth required for ${url} - waiting for login`);
                    hasLoggedAuthError.current = true;
                }
                return;
            }

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const json = await res.json();
            setData(json);
            setIsAuthenticated(true);
            setIsConnected(true);
            hasLoggedAuthError.current = false; // 成功したらリセット
        } catch (err: any) {
            console.error(`[useRealtime] Error fetching ${url}:`, err);
            setError(err.message);
            setIsConnected(false);
        } finally {
            setLoading(false);
        }
    }, [url, requiresAuth]);

    useEffect(() => {
        if (!enabled) return;

        // 初回取得
        fetchData();

        // polling設定
        const id = setInterval(fetchData, interval);

        return () => clearInterval(id);
    }, [url, interval, enabled, fetchData]);

    const refetch = useCallback(() => {
        setLoading(true);
        fetchData();
    }, [fetchData]);

    return { data, loading, error, isAuthenticated, isConnected, refetch };
}
