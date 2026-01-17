import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JobType } from '@/lib/jobData';

interface JobApplicationModalProps {
    jobName: string;
    isOpen: boolean;
    onClose: () => void;
    onComplete: (success: boolean) => void;
    simulateApiCall: () => Promise<boolean>; // Function that calls API and returns success status
}

export const JobApplicationModal: React.FC<JobApplicationModalProps> = ({ jobName, isOpen, onClose, simulateApiCall }) => {
    const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'failure'>('idle');

    useEffect(() => {
        if (isOpen && status === 'idle') {
            startApplication();
        }
    }, [isOpen]);

    const startApplication = async () => {
        setStatus('processing');

        // Wait for a bit of suspense (min 2 seconds) + API result
        const [apiResult] = await Promise.all([
            simulateApiCall(),
            new Promise(resolve => setTimeout(resolve, 2500))
        ]);

        setStatus(apiResult ? 'success' : 'failure');

        // Close automatically after result
        setTimeout(() => {
            onClose();
        }, 3000);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <div style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '300px' }}>

                    {/* Processing: Resume Review Animation */}
                    {status === 'processing' && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            style={{ textAlign: 'center', color: 'white' }}
                        >
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 0], y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 1 }}
                                style={{ fontSize: '4rem', marginBottom: '1rem' }}
                            >
                                📄
                            </motion.div>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>書類選考中...</h2>
                            <p>人事担当者が履歴書を確認しています</p>
                            <motion.div
                                style={{ width: '80%', height: '4px', background: '#333', margin: '1rem auto', borderRadius: '2px', overflow: 'hidden' }}
                            >
                                <motion.div
                                    animate={{ x: ['-100%', '0%', '100%'] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                                    style={{ width: '100%', height: '100%', background: '#4ade80' }}
                                />
                            </motion.div>
                        </motion.div>
                    )}

                    {/* Success: Hired Stamp */}
                    {status === 'success' && (
                        <motion.div
                            initial={{ scale: 2, opacity: 0, rotate: -30 }}
                            animate={{ scale: 1, opacity: 1, rotate: -15 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            style={{
                                position: 'absolute', top: '50%', left: '50%', x: '-50%', y: '-50%',
                                border: '8px solid #ef4444',
                                color: '#ef4444',
                                padding: '1rem 3rem',
                                borderRadius: '1rem',
                                fontSize: '3rem',
                                fontWeight: '900',
                                whiteSpace: 'nowrap',
                                textTransform: 'uppercase',
                                boxShadow: '0 0 20px rgba(239, 68, 68, 0.5)',
                                background: 'rgba(255, 255, 255, 0.9)'
                            }}
                        >
                            採用！
                        </motion.div>
                    )}

                    {/* Failure: Rejected Stamp */}
                    {status === 'failure' && (
                        <motion.div
                            initial={{ scale: 2, opacity: 0, rotate: 10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 15 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                            style={{
                                position: 'absolute', top: '50%', left: '50%', x: '-50%', y: '-50%',
                                border: '8px solid #3b82f6',
                                color: '#3b82f6',
                                padding: '1rem 2rem',
                                borderRadius: '1rem',
                                fontSize: '3rem',
                                fontWeight: '900',
                                whiteSpace: 'nowrap',
                                textTransform: 'uppercase',
                                background: 'rgba(255, 255, 255, 0.9)',
                                filter: 'grayscale(100%)'
                            }}
                        >
                            不採用...
                        </motion.div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
