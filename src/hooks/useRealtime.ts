'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseRealtimeOptions {
    interval?: number; // polling interval in ms
    enabled?: boolean; // enable/disable polling
}

export function useRealtime<T>(
    url: string,
    options: UseRealtimeOptions = {}
) {
    const { interval = 5000, enabled = true } = options;

    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setError(null);
            const res = await fetch(url, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                },
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const json = await res.json();
            setData(json);
        } catch (err: any) {
            console.error(`[useRealtime] Error fetching ${url}:`, err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [url]);

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

    return { data, loading, error, refetch };
}
