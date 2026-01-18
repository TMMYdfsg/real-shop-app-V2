import { EventEmitter } from 'events';
import { GameEventData } from '@/types';

class GameEventManager extends EventEmitter {
    private static instance: GameEventManager;

    private constructor() {
        super();
        this.setMaxListeners(100); // Allow many concurrent clients
    }

    public static getInstance(): GameEventManager {
        if (!GameEventManager.instance) {
            GameEventManager.instance = new GameEventManager();
        }
        return GameEventManager.instance;
    }

    public broadcast(event: GameEventData) {
        this.emit('game_update', event);
    }
}

// Global variable to persist across HMR in development
const globalForEventManager = global as unknown as {
    eventManager: GameEventManager | undefined;
};

export const eventManager = globalForEventManager.eventManager ?? GameEventManager.getInstance();

if (process.env.NODE_ENV !== 'production') {
    globalForEventManager.eventManager = eventManager;
}
