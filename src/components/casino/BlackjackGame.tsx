'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface Card {
    suit: '♠' | '♥' | '♦' | '♣';
    rank: string;
    value: number;
}

interface BlackjackGameProps {
    balance: number;
    onBet: (amount: number, guess: string) => Promise<any>;
}

const SUITS = ['♠', '♥', '♦', '♣'] as const;
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const CardDisplay = ({ card, hidden }: { card: Card | null; hidden?: boolean }) => {
    if (!card) return null;

    const isRed = card.suit === '♥' || card.suit === '♦';

    return (
        <motion.div
            initial={{ rotateY: hidden ? 180 : 0, scale: 0.8 }}
            animate={{ rotateY: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{
                width: '80px',
                height: '110px',
                background: hidden ? '#1e3a8a' : 'white',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                border: '2px solid #e5e7eb',
                position: 'relative'
            }}
        >
            {hidden ? (
                <div style={{ fontSize: '2rem' }}>🂠</div>
            ) : (
                <>
                    <div style={{
                        position: 'absolute',
                        top: '5px',
                        left: '8px',
                        fontSize: '1.2rem',
                        color: isRed ? '#dc2626' : '#1f2937',
                        fontWeight: 'bold'
                    }}>
                        {card.rank}
                    </div>
                    <div style={{
                        fontSize: '2.5rem',
                        color: isRed ? '#dc2626' : '#1f2937'
                    }}>
                        {card.suit}
                    </div>
                    <div style={{
                        position: 'absolute',
                        bottom: '5px',
                        right: '8px',
                        fontSize: '1.2rem',
                        color: isRed ? '#dc2626' : '#1f2937',
                        fontWeight: 'bold',
                        transform: 'rotate(180deg)'
                    }}>
                        {card.rank}
                    </div>
                </>
            )}
        </motion.div>
    );
};

export const BlackjackGame: React.FC<BlackjackGameProps> = ({ balance, onBet }) => {
    const [bet, setBet] = useState(100);
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [dealerHand, setDealerHand] = useState<Card[]>([]);
    const [gameState, setGameState] = useState<'betting' | 'playing' | 'dealer' | 'ended'>('betting');
    const [result, setResult] = useState<string>('');
    const [dealerHidden, setDealerHidden] = useState(true);

    const createCard = (rank: string, suit: typeof SUITS[number]): Card => {
        let value = 0;
        if (rank === 'A') value = 11;
        else if (['J', 'Q', 'K'].includes(rank)) value = 10;
        else value = parseInt(rank);

        return { suit, rank, value };
    };

    const calculateTotal = (hand: Card[]): number => {
        let total = hand.reduce((sum, card) => sum + card.value, 0);
        let aces = hand.filter(c => c.rank === 'A').length;

        while (total > 21 && aces > 0) {
            total -= 10;
            aces--;
        }

        return total;
    };

    const dealCard = (): Card => {
        const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
        const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
        return createCard(rank, suit);
    };

    const startGame = async () => {
        if (balance < bet) {
            alert('所持金が足りません');
            return;
        }

        const pHand = [dealCard(), dealCard()];
        const dHand = [dealCard(), dealCard()];

        setPlayerHand(pHand);
        setDealerHand(dHand);
        setGameState('playing');
        setDealerHidden(true);
        setResult('');

        // Check for natural blackjack
        const pTotal = calculateTotal(pHand);
        if (pTotal === 21) {
            await stand(pHand, dHand);
        }
    };

    const hit = () => {
        const newHand = [...playerHand, dealCard()];
        setPlayerHand(newHand);

        const total = calculateTotal(newHand);
        if (total > 21) {
            endGame('bust', dealerHand, newHand);
        } else if (total === 21) {
            stand(newHand, dealerHand);
        }
    };

    const stand = async (pHand?: Card[], dHand?: Card[]) => {
        const finalPlayerHand = pHand || playerHand;
        let finalDealerHand = dHand || [...dealerHand];

        setGameState('dealer');
        setDealerHidden(false);

        // Dealer draws until 17+
        while (calculateTotal(finalDealerHand) < 17) {
            await new Promise(resolve => setTimeout(resolve, 800));
            const newCard = dealCard();
            finalDealerHand = [...finalDealerHand, newCard];
            setDealerHand(finalDealerHand);
        }

        const pTotal = calculateTotal(finalPlayerHand);
        const dTotal = calculateTotal(finalDealerHand);

        let outcome: 'win' | 'lose' | 'push' | 'bust';
        if (dTotal > 21) outcome = 'win';
        else if (pTotal > dTotal) outcome = 'win';
        else if (pTotal < dTotal) outcome = 'lose';
        else outcome = 'push';

        endGame(outcome, finalDealerHand, finalPlayerHand);
    };

    const endGame = async (outcome: 'win' | 'lose' | 'push' | 'bust', dHand: Card[], pHand: Card[]) => {
        setGameState('ended');
        setDealerHidden(false);

        let winAmount = 0;
        let resultText = '';

        if (outcome === 'bust') {
            resultText = 'BUST! 負け';
            winAmount = 0;
        } else if (outcome === 'win') {
            const pTotal = calculateTotal(pHand);
            if (pTotal === 21 && pHand.length === 2) {
                resultText = 'BLACKJACK! 1.5倍配当';
                winAmount = Math.floor(bet * 2.5);
            } else {
                resultText = 'WIN! 2倍配当';
                winAmount = bet * 2;
            }
        } else if (outcome === 'lose') {
            resultText = 'LOSE...';
            winAmount = 0;
        } else {
            resultText = 'PUSH（引き分け）';
            winAmount = bet;
        }

        setResult(resultText);

        // Call API
        await onBet(bet, JSON.stringify({ outcome, winAmount, playerHand: pHand, dealerHand: dHand }));
    };

    const reset = () => {
        setPlayerHand([]);
        setDealerHand([]);
        setGameState('betting');
        setResult('');
        setDealerHidden(true);
    };

    const pTotal = calculateTotal(playerHand);
    const dTotal = calculateTotal(dealerHand);

    return (
        <div style={{ padding: '1rem' }}>
            <h3 className="text-xl font-bold mb-4 text-center" style={{ color: '#1e40af' }}>
                🃏 ブラックジャック
            </h3>

            {/* Dealer's Hand */}
            <div style={{ marginBottom: '2rem' }}>
                <div className="text-sm font-bold mb-2">ディーラー {!dealerHidden && `(${dTotal})`}</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {dealerHand.map((card, i) => (
                        <CardDisplay
                            key={i}
                            card={card}
                            hidden={i === 1 && dealerHidden && gameState === 'playing'}
                        />
                    ))}
                </div>
            </div>

            {/* Player's Hand */}
            <div style={{ marginBottom: '2rem' }}>
                <div className="text-sm font-bold mb-2">あなた ({pTotal})</div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {playerHand.map((card, i) => (
                        <CardDisplay key={i} card={card} />
                    ))}
                </div>
            </div>

            {/* Result */}
            {result && (
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center text-2xl font-bold mb-4"
                    style={{ color: result.includes('WIN') || result.includes('BLACKJACK') ? '#16a34a' : '#dc2626' }}
                >
                    {result}
                </motion.div>
            )}

            {/* Controls */}
            {gameState === 'betting' && (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold mb-2">賭け金 (所持金: {balance}枚)</label>
                        <div className="flex gap-2 justify-center mb-4">
                            {[100, 500, 1000, 5000].map(amt => (
                                <button
                                    key={amt}
                                    onClick={() => setBet(amt)}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '8px',
                                        background: bet === amt ? '#1e40af' : '#e5e7eb',
                                        color: bet === amt ? 'white' : 'black',
                                        fontWeight: 'bold'
                                    }}
                                >
                                    {amt}
                                </button>
                            ))}
                        </div>
                    </div>
                    <Button fullWidth variant="primary" onClick={startGame} disabled={balance < bet}>
                        ゲーム開始 ({bet}枚)
                    </Button>
                </div>
            )}

            {gameState === 'playing' && (
                <div className="flex gap-4">
                    <Button fullWidth onClick={hit} disabled={pTotal >= 21}>
                        Hit (もう1枚)
                    </Button>
                    <Button fullWidth variant="secondary" onClick={() => stand()}>
                        Stand (勝負)
                    </Button>
                </div>
            )}

            {gameState === 'dealer' && (
                <div className="text-center text-gray-600">
                    ディーラーがカードを引いています...
                </div>
            )}

            {gameState === 'ended' && (
                <Button fullWidth variant="primary" onClick={reset}>
                    もう一度プレイ
                </Button>
            )}
        </div>
    );
};
