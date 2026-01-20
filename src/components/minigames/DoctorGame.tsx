import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface DoctorGameProps {
    difficulty: number;
    onScoreUpdate: (score: number) => void;
}

const SYMPTOMS = [
    { id: 'fever', icon: '🥵', name: '熱がある', treatment: 'medicine' },
    { id: 'injury', icon: '🤕', name: '怪我した', treatment: 'bandage' },
    { id: 'cough', icon: '😷', name: '咳が出る', treatment: 'mask' },
    { id: 'stomach', icon: '🤢', name: 'お腹が痛い', treatment: 'medicine' }, // Added for variety
    { id: 'cut', icon: '🔪', name: '切り傷', treatment: 'bandage' },
];

const TREATMENTS = [
    { id: 'medicine', icon: '💊', name: 'お薬' },
    { id: 'bandage', icon: '🩹', name: '包帯' },
    { id: 'mask', icon: '😷', name: 'マスク' },
    { id: 'injection', icon: '💉', name: '注射' },
];

export const DoctorGame: React.FC<DoctorGameProps> = ({ difficulty, onScoreUpdate }) => {
    const [currentSymptom, setCurrentSymptom] = useState<typeof SYMPTOMS[0] | null>(null);
    const [feedback, setFeedback] = useState<{ msg: string, color: string } | null>(null);

    const nextPatient = () => {
        // Difficulty could increase symptom pool size?
        const pool = SYMPTOMS.slice(0, 3 + Math.floor(difficulty / 2));
        const random = pool[Math.floor(Math.random() * pool.length)];
        setCurrentSymptom(random);
        setFeedback(null);
    };

    useEffect(() => {
        nextPatient();
    }, []);

    const handleTreatment = (treatmentId: string) => {
        if (!currentSymptom) return;

        if (currentSymptom.treatment === treatmentId) {
            onScoreUpdate(100 + (difficulty * 20));
            setFeedback({ msg: 'お大事に！', color: '#dcfce7' });
            setTimeout(nextPatient, 500);
        } else {
            // Wrong treatment
            onScoreUpdate(-50); // Penalty
            setFeedback({ msg: '違う！', color: '#fee2e2' });
            // Maybe delay or just let retry? Let's delay to penalize time.
            setTimeout(() => setFeedback(null), 500);
        }
    };

    return (
        <div style={{ height: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: feedback?.color || 'transparent', transition: 'background 0.3s' }}>

            <div style={{ padding: '2rem', background: 'white', borderRadius: '12px', marginBottom: '2rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                {feedback ? (
                    <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>{feedback.msg}</div>
                ) : (
                    <>
                        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>{currentSymptom?.icon}</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{currentSymptom?.name}</div>
                    </>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0 1rem' }}>
                {TREATMENTS.map((t) => (
                    <Button
                        key={t.id}
                        variant="secondary"
                        style={{ flexDirection: 'column', gap: '0.5rem', padding: '1rem', height: '100px' }}
                        onClick={() => handleTreatment(t.id)}
                    >
                        <span style={{ fontSize: '2.5rem' }}>{t.icon}</span>
                        <span style={{ fontWeight: 'bold' }}>{t.name}</span>
                    </Button>
                ))}
            </div>
        </div>
    );
};

