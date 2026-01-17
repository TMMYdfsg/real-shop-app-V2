import { GameState, User, EconomyState, EnvironmentState, GameEvent } from '@/types';
import crypto from 'crypto';

// ==========================================
// Economy Simulation
// ==========================================

export function simulateEconomy(state: GameState): GameState {
    const { economy } = state;

    // 景気サイクルの確率的遷移
    // Normal -> Boom (10%), Recession (10%), Stay (80%)
    const rand = Math.random();

    if (economy.status === 'normal') {
        if (rand < 0.05) economy.status = 'boom';
        else if (rand < 0.10) economy.status = 'recession';
    } else if (economy.status === 'boom') {
        if (rand < 0.15) economy.status = 'normal'; // Boom ends
        else if (rand < 0.16) economy.status = 'crisis'; // Boom -> Bubble burst -> Crisis
    } else if (economy.status === 'recession') {
        if (rand < 0.15) economy.status = 'normal'; // Recover
        else if (rand < 0.16) economy.status = 'crisis'; // Worsen
    } else if (economy.status === 'crisis') {
        if (rand < 0.20) economy.status = 'recession'; // Recover slowly
    }

    // 金利と物価の調整
    switch (economy.status) {
        case 'boom':
            economy.interestRate = Math.min(10, economy.interestRate + 0.1); // 利上げ
            economy.priceIndex += 0.5; // インフレ
            economy.marketTrend = 'bull';
            break;
        case 'recession':
            economy.interestRate = Math.max(1, economy.interestRate - 0.1); // 利下げ
            economy.priceIndex = Math.max(80, economy.priceIndex - 0.2); // デフレ
            economy.marketTrend = 'bear';
            break;
        case 'crisis':
            economy.interestRate = Math.max(0.1, economy.interestRate - 0.5); // 緊急利下げ
            economy.priceIndex -= 1.0;
            economy.marketTrend = 'bear';
            break;
        case 'normal':
        default:
            // Regress to mean
            if (economy.interestRate > 5) economy.interestRate -= 0.05;
            if (economy.interestRate < 5) economy.interestRate += 0.05;
            economy.marketTrend = 'stable';
            break;
    }

    economy.lastUpdateTurn = state.turn;
    return state;
}

// ==========================================
// Environment Simulation
// ==========================================

export function simulateEnvironment(state: GameState): GameState {
    const { environment } = state;
    const rand = Math.random();

    // Season update (every 100 turns approx? or purely manual? Let's assume random drift for now or time based in main loop)
    // Here we just handle weather daily change

    // Weather transition
    const current = environment.weather;
    let next = current;

    if (current === 'sunny') {
        if (rand < 0.2) next = 'rain';
        if (rand < 0.05) next = 'heatwave';
    } else if (current === 'rain') {
        if (rand < 0.4) next = 'sunny';
        if (rand < 0.1) next = 'heavy_rain';
    } else if (current === 'heavy_rain') {
        if (rand < 0.5) next = 'rain';
        if (rand < 0.1) next = 'storm';
    } else if (current === 'storm') {
        if (rand < 0.8) next = 'rain'; // Storm passes
    } else if (current === 'heatwave') {
        if (rand < 0.3) next = 'sunny';
        if (rand < 0.1) next = 'storm'; // Yuudachi
    }

    environment.weather = next;

    // Infrastructure Incidents
    if (Math.random() < 0.01) { // 1% chance
        const type = Math.random() < 0.5 ? 'power' : 'network';
        environment.cityInfrastructure[type] = Math.max(0, environment.cityInfrastructure[type] - 50);
        // Add news
        state.news.unshift({
            id: crypto.randomUUID(),
            message: `【速報】市内${type === 'power' ? '電力' : '通信'}設備でトラブル発生。復旧作業中です。`,
            timestamp: Date.now()
        });
    }

    // Infrastructure Recovery
    if (environment.cityInfrastructure.power < 100) environment.cityInfrastructure.power += 10;
    if (environment.cityInfrastructure.network < 100) environment.cityInfrastructure.network += 10;
    if (environment.cityInfrastructure.water < 100) environment.cityInfrastructure.water += 10;

    // Disasters
    if (!environment.disaster) {
        if (Math.random() < 0.001) { // 0.1% Rare
            const dRand = Math.random();
            if (dRand < 0.5) {
                environment.disaster = { type: 'typhoon', name: '大型台風1号', severity: 3, remainingTurns: 10 };
                state.news.unshift({ id: crypto.randomUUID(), message: '【緊急】大型台風が接近しています。', timestamp: Date.now() });
            } else {
                environment.disaster = { type: 'earthquake', name: '大地震', severity: 4, remainingTurns: 3 };
                state.news.unshift({ id: crypto.randomUUID(), message: '【緊急】強い地震が発生しました。余震に警戒してください。', timestamp: Date.now() });
            }
        }
    } else {
        environment.disaster.remainingTurns -= 1;
        if (environment.disaster.remainingTurns <= 0) {
            state.news.unshift({ id: crypto.randomUUID(), message: `【災害】${environment.disaster.name}の脅威は去りました。`, timestamp: Date.now() });
            environment.disaster = undefined;
        }
    }

    return state;
}

// ==========================================
// Credit Score Logic
// ==========================================

export function calculateCreditScore(user: User): number {
    let score = user.creditScore || 500;

    // Positive factors
    if (user.balance > 1000000) score += 1; // High balance
    if (user.job && user.job !== 'unemployed') score += 1; // Stable job
    if (user.ownedLands.length > 0) score += 2; // Assets

    // Negative factors (handled in event logic mostly, like missed payments)

    // Cap
    return Math.max(0, Math.min(1000, score));
}

// ==========================================
// Main Simulation Step
// ==========================================

// ==========================================
// Life Simulation (Phase 5)
// ==========================================

export function simulateLife(user: User): User {
    // Initialize if missing
    if (!user.lifeStats) {
        user.lifeStats = { health: 100, hunger: 0, stress: 0, fatigue: 0, hygiene: 100 };
    }
    let stats = { ...user.lifeStats };

    // 1. Natural Metabolism
    stats.hunger = Math.min(100, stats.hunger + 5); // お腹が空く
    stats.hygiene = Math.max(0, stats.hygiene - 5); // 汚れる

    // 2. Health impacts
    if (stats.hunger > 80) stats.health = Math.max(0, stats.health - 1);
    if (stats.stress > 80) stats.health = Math.max(0, stats.health - 2);
    if (stats.hygiene < 20) stats.health = Math.max(0, stats.health - 1);

    // 3. Recovery (Natural healing if conditions are good)
    if (stats.hunger < 50 && stats.stress < 50 && stats.fatigue < 50) {
        stats.health = Math.min(100, stats.health + 1);
    }

    // 4. Disease Check
    if (stats.health < 30 && !user.isHospitalized) {
        if (Math.random() < 0.1) {
            // Hospitalization event would be handled elsewhere or flagged here
            // console.log(`${user.name} has fallen ill.`);
            // user.isHospitalized = true; (Managed by event system or state update)
        }
    }

    user.lifeStats = stats;
    return user;
}

export function simulateTurn(state: GameState): GameState {
    let newState = { ...state };

    newState = simulateEconomy(newState);
    newState = simulateEnvironment(newState);

    // Update users (loans, insurance, etc.)
    newState.users = newState.users.map(user => {
        let u = { ...user };

        // 0. Life Simulation (Phase 5)
        u = simulateLife(u);

        // 1. Loan Repayment
        if (u.loans) {
            u.loans.forEach(loan => {
                if (loan.status === 'active') {
                    // Interest check (fixed vs variable)
                    let currentRate = loan.isFixedRate ? loan.interestRate : newState.economy.interestRate + 2.0;

                    // Simple monthly payment logic (interest only + principal portion?)
                    // Simplified: Fixed monthly payment defined at loan creation
                    if (u.balance >= loan.monthlyPayment) {
                        u.balance -= loan.monthlyPayment;
                        loan.remainingAmount -= (loan.monthlyPayment * 0.8); // 20% interest assumed roughly

                        u.transactions.push({
                            id: crypto.randomUUID(),
                            type: 'repay',
                            amount: loan.monthlyPayment,
                            senderId: u.id,
                            description: `ローン返済: ${loan.name}`,
                            timestamp: Date.now()
                        });

                        u.creditScore = Math.min(1000, (u.creditScore || 500) + 1); // Credit up

                        if (loan.remainingAmount <= 0) {
                            loan.status = 'paid_off';
                            loan.remainingAmount = 0;
                            // Bonus score
                            u.creditScore = Math.min(1000, (u.creditScore || 500) + 50);
                        }
                    } else {
                        // Default
                        loan.status = 'defaulted'; // Or just penalty?
                        u.creditScore = Math.max(0, (u.creditScore || 500) - 20); // Credit down
                        // Add penalty interest?
                    }
                }
            });
        }

        // 2. Insurance Premium
        if (u.insurances) {
            u.insurances.forEach(ins => {
                if (u.balance >= ins.premium) {
                    u.balance -= ins.premium;
                } else {
                    // Expire due to non-payment
                    ins.expiresAt = Date.now(); // Immediate expire
                }
            });
        }

        // 3. Update Score
        u.creditScore = calculateCreditScore(u);

        return u;
    });

    return newState;
}
