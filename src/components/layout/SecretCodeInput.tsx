'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface SecretCodeInputProps {
    onUnlock: (code: string) => void;
}

export const SecretCodeInput: React.FC<SecretCodeInputProps> = ({ onUnlock }) => {
    const [code, setCode] = useState('');
    const [isVisible, setIsVisible] = useState(false);

    const handleSubmit = () => {
        if (code.trim()) {
            onUnlock(code.toUpperCase());
            setCode('');
        }
    };

    return (
        <div style={{ marginTop: '1rem', padding: '0.5rem' }}>
            {!isVisible ? (
                <button
                    onClick={() => setIsVisible(true)}
                    style={{
                        width: '100%',
                        padding: '0.5rem',
                        background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                        opacity: 0.7,
                        transition: 'opacity 0.3s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
                >
                    🔐 シークレットコード
                </button>
            ) : (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        background: 'rgba(0,0,0,0.8)',
                        padding: '1rem',
                        borderRadius: '12px',
                        border: '2px solid #7c3aed'
                    }}
                >
                    <div style={{ marginBottom: '0.5rem', fontSize: '0.8rem', color: '#a78bfa' }}>
                        🔒 裏コードを入力
                    </div>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        placeholder="CODE"
                        style={{
                            width: '100%',
                            padding: '0.5rem',
                            background: '#1e1b4b',
                            border: '1px solid #7c3aed',
                            borderRadius: '6px',
                            color: 'white',
                            fontSize: '0.9rem',
                            marginBottom: '0.5rem',
                            textAlign: 'center',
                            letterSpacing: '2px'
                        }}
                    />
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={handleSubmit}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                background: '#7c3aed',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                            }}
                        >
                            解除
                        </button>
                        <button
                            onClick={() => {
                                setIsVisible(false);
                                setCode('');
                            }}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                background: '#374151',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                            }}
                        >
                            閉じる
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};
