import { NextResponse, NextRequest } from 'next/server';
import { updateGameState } from '@/lib/dataStore';
import { Request as GameRequest } from '@/types';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { type, requesterId, amount, details } = body;

        if (!type || !requesterId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const newRequest: GameRequest = {
            id: crypto.randomUUID(),
            type,
            requesterId,
            amount: Number(amount) || 0,
            details,
            status: 'pending',
            timestamp: Date.now()
        };

        if (type === 'change_job') {
            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    user.job = details || 'unemployed';
                    user.lastJobChangeTurn = state.turn; // 転職ターンを記録
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'pay_tax') {
            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    const payAmount = Number(amount);
                    if (user.balance >= payAmount) {
                        user.balance -= payAmount;
                        user.unpaidTax = Math.max(0, (user.unpaidTax || 0) - payAmount);

                        // 履歴追加
                        if (!user.transactions) user.transactions = [];
                        user.transactions.push({
                            id: crypto.randomUUID(),
                            type: 'tax',
                            amount: payAmount,
                            senderId: user.id,
                            description: '納税',
                            timestamp: Date.now()
                        });
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'unlock_forbidden') {
            updateGameState((state) => {
                // Unlock for everyone
                state.users.forEach(u => u.isForbiddenUnlocked = true);
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'deposit') {
            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    const val = Number(amount);
                    if (user.balance >= val) {
                        user.balance -= val;
                        user.deposit += val;
                        // 履歴
                        if (!user.transactions) user.transactions = [];
                        user.transactions.push({
                            id: crypto.randomUUID(), type: 'deposit', amount: val, senderId: user.id, description: '預け入れ', timestamp: Date.now()
                        });
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'withdraw') {
            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    const val = Number(amount);
                    if (user.deposit >= val) {
                        user.deposit -= val;
                        user.balance += val;
                        // 履歴
                        if (!user.transactions) user.transactions = [];
                        user.transactions.push({
                            id: crypto.randomUUID(), type: 'withdraw', amount: val, senderId: user.id, description: '引き出し', timestamp: Date.now()
                        });
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'update_profile') {
            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId);
                if (user) {
                    if (details) {
                        const { shopName, cardType } = JSON.parse(details);
                        if (shopName) user.shopName = shopName;
                        if (cardType) user.cardType = cardType;
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        if (type === 'purchase_product') {
            updateGameState((state) => {
                const user = state.users.find(u => u.id === requesterId); // Buyer
                if (!user) return state;

                const { productId, sellerId } = details ? JSON.parse(details) : { productId: '', sellerId: '' };
                const product = state.products.find(p => p.id === productId);
                const seller = state.users.find(u => u.id === sellerId);

                if (user && product && seller && !product.soldAt) {
                    if (user.balance >= product.price) {
                        // Payment
                        user.balance -= product.price;
                        seller.balance += product.price;

                        // Product Update
                        product.soldAt = Date.now();
                        product.buyerId = user.id;

                        // Transaction History
                        if (!user.transactions) user.transactions = [];
                        user.transactions.push({
                            id: crypto.randomUUID(), type: 'payment', amount: product.price, senderId: user.id, receiverId: seller.id, description: `購入: ${product.name}`, timestamp: Date.now()
                        });

                        if (!seller.transactions) seller.transactions = [];
                        seller.transactions.push({
                            id: crypto.randomUUID(), type: 'income', amount: product.price, senderId: user.id, receiverId: seller.id, description: `売上: ${product.name}`, timestamp: Date.now()
                        });

                        // Points (100 -> 1pt)
                        const points = Math.floor(product.price / 100);
                        if (points > 0) {
                            if (!user.pointCards) user.pointCards = [];
                            let card = user.pointCards.find(c => c.shopOwnerId === seller.id);
                            if (!card) {
                                card = { shopOwnerId: seller.id, points: 0 };
                                user.pointCards.push(card);
                            }
                            card.points += points;
                        }
                    }
                }
                return state;
            });
            return NextResponse.json({ success: true });
        }

        updateGameState((state) => {
            state.requests.push(newRequest);
            return state;
        });

        return NextResponse.json({ success: true, request: newRequest });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to submit action' }, { status: 500 });
    }
}
