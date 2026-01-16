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
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function GameProvider({ children }: { children: React.ReactNode }) {
    const { data: gameState, error } = useSWR<GameState>('/api/game', fetcher, {
        refreshInterval: 2000, // 2秒ごとにポーリング
    });

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // ローカルストレージからログイン状態復帰 (簡易的)
    useEffect(() => {
        const savedId = localStorage.getItem('real-shop-user-id');
        if (savedId) {
            setCurrentUserId(savedId);
        }
    }, []);

    const login = (userId: string) => {
        setCurrentUserId(userId);
        localStorage.setItem('real-shop-user-id', userId);
    };

    const logout = () => {
        setCurrentUserId(null);
        localStorage.removeItem('real-shop-user-id');
    };

    const currentUser = gameState?.users.find(u => u.id === currentUserId);

    return (
        <GameContext.Provider value={{
            gameState,
            isLoading: !error && !gameState,
            isError: error,
            currentUser,
            login,
            logout
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
