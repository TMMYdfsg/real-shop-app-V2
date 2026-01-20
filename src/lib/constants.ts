export const GAME_CONSTANTS = {
    // Economy
    INITIAL_BALANCE: 100000,
    INITIAL_DEBT: 0,
    DEPOSIT_INTEREST_RATE: 0.001, // 0.1% per turn
    DEBT_INTEREST_RATE: 0.05, // 5% per turn
    TAX_RATE: 0.1, // 10%

    // Time
    TURN_DURATION_MS: 300000, // 5 minutes
    DAY_LENGTH_MS: 180000, // 3 minutes day (example)

    // Limits
    MAX_ITEMS_PER_SLOT: 99,
    MAX_PROPERTIES: 10,

    // UI Defaults
    ANIMATION_DURATION: 0.3,
    TOAST_DURATION: 3000,
};

export const UI_THEME = {
    COLORS: {
        PRIMARY: '#3b82f6', // blue-500
        SECONDARY: '#6366f1', // indigo-500
        ACCENT: '#fbbf24', // amber-400
        DANGER: '#ef4444', // red-500
        SUCCESS: '#10b981', // emerald-500
        BACKGROUND: '#f8fafc', // slate-50
        TEXT_PRIMARY: '#1e293b', // slate-800
        TEXT_SECONDARY: '#64748b', // slate-500
    },
    GLASS: {
        BG: 'rgba(255, 255, 255, 0.7)',
        BORDER: 'rgba(255, 255, 255, 0.5)',
    }
};
