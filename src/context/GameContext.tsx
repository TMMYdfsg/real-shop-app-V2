'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';
import { GameState, User } from '@/types';

interface GameContextType {
    gameState: GameState | undefined;
    isLoading: boolean;
    isError: boolean;
    currentUser: User | undefined;
    login: (userId: string) => void;
    logout: () => void;
    refresh: () => void; // データ再取得
    sendRequest: (type: string, amount: number, details?: any) => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function GameProvider({ children, initialData }: { children: React.ReactNode, initialData?: GameState }) {
    const { data: gameState, error, mutate } = useSWR<GameState>('/api/game', fetcher, {
        refreshInterval: 0, // SSE導入によりポーリング停止
        revalidateOnFocus: true,
        fallbackData: initialData, // SSRで取得したデータを初期値にする
    });

    // クッキーからログインIDを即座に復旧（Hydration Flash防止）
    const [currentUserId, setCurrentUserId] = useState<string | null>(() => {
        if (typeof document !== 'undefined') {
            const cookieValue = document.cookie
                .split('; ')
                .find(row => row.startsWith('playerId='))
                ?.split('=')[1];
            return cookieValue || null;
        }
        return null;
    });

    // --- Phase 8: Real-time Sync (SSE) ---
    useEffect(() => {
        let eventSource: EventSource | null = null;
        let reconnectTimeout: NodeJS.Timeout;
        let retryCount = 0;

        const connectSSE = () => {
            console.log('Connecting to SSE...');
            eventSource = new EventSource('/api/events');

            eventSource.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'game_update') {
                        console.log('Game update received via SSE, revalidating...', data);
                        mutate(); // SWRの状態を最新化
                    } else if (data.type === 'reconnect') {
                        console.log('Server requested reconnection');
                        eventSource?.close();
                        connectSSE();
                    }
                } catch (e) {
                    console.error('Failed to parse SSE message:', e);
                }
            };

            eventSource.onopen = () => {
                console.log('SSE connected');
                retryCount = 0; // 成功したらリセット
            };

            eventSource.onerror = (err) => {
                console.error('SSE error:', err);
                console.log('SSE ReadyState:', eventSource?.readyState);
                eventSource?.close();

                // 指数バックオフによる再接続
                const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
                console.log(`Reconnecting in ${delay}ms...`);
                reconnectTimeout = setTimeout(() => {
                    retryCount++;
                    connectSSE();
                }, delay);
            };
        };

        connectSSE();

        return () => {
            if (eventSource) eventSource.close();
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
        };
    }, [mutate]);

    // ローカルストレージからログイン状態復帰 (簡易的)
    useEffect(() => {
        const savedId = localStorage.getItem('real-shop-user-id');
        if (savedId) {
            setCurrentUserId(savedId);
            // Ensure cookie matches localStorage
            document.cookie = `playerId=${savedId}; path=/; max-age=2592000; SameSite=Lax`;
        }
    }, []);

    const login = (userId: string) => {
        setCurrentUserId(userId);
        localStorage.setItem('real-shop-user-id', userId);
        // Set cookie for API access
        document.cookie = `playerId=${userId}; path=/; max-age=2592000; SameSite=Lax`;
    };

    const logout = () => {
        setCurrentUserId(null);
        localStorage.removeItem('real-shop-user-id');
        // Remove cookie
        document.cookie = `playerId=; path=/; max-age=0`;
    };

    const refresh = () => {
        mutate();
    };

    const currentUser = gameState?.users?.find(u => u.id === currentUserId);

    const sendRequest = async (type: string, amount: number, details: any = {}) => {
        try {
            if (!currentUser) return;
            const res = await fetch('/api/action', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type,
                    requesterId: currentUser.id,
                    amount,
                    details
                })
            });
            const data = await res.json();
            if (data.success) {
                mutate(); // Refresh state
            } else {
                console.error('Action failed:', data.message);
                throw new Error(data.message);
            }
        } catch (error) {
            console.error('Request error:', error);
            throw error;
        }
    };

    return (
        <GameContext.Provider value={{
            gameState,
            isLoading: !error && !gameState,
            isError: error,
            currentUser,
            login,
            logout,
            refresh,
            sendRequest
        }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
}
