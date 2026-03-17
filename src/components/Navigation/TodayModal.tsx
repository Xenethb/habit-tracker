// src/components/Navigation/TodayModal.tsx
import { useEffect, useState } from 'react';
import styles from './TodayModal.module.css';
import { Habit, Completion } from '../../types';

interface TodayModalProps {
    habits: Habit[];
    completions: Completion[];
    setCompletions: React.Dispatch<React.SetStateAction<Completion[]>>;
    onClose: () => void;
}

export default function TodayModal({ habits, completions, setCompletions, onClose }: TodayModalProps) {
    const [animateIn, setAnimateIn] = useState(false);

    // Trigger animation with a slight delay
    useEffect(() => {
        const timer = setTimeout(() => setAnimateIn(true), 10);
        return () => clearTimeout(timer);
    }, []);

    const today = new Date().toISOString().split("T")[0];

    const toggleHabit = (habitId: number) => {
        const isAlreadyDone = completions.some(c => c.habitId === habitId && c.date === today);
        if (isAlreadyDone) {
            setCompletions(completions.filter(c => !(c.habitId === habitId && c.date === today)));
        } else {
            setCompletions([...completions, { habitId, date: today }]);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={`${styles.modal} ${animateIn ? styles.show : ''}`}
                onClick={e => e.stopPropagation()}
            >
                <div className={styles.header}>
                    <h3>Today's Focus</h3>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                <div className={styles.list}>
                    {habits.length > 0 ? habits.map(habit => {
                        const isDone = completions.some(c => c.habitId === habit.id && c.date === today);
                        return (
                            <div key={habit.id} className={styles.row} onClick={() => toggleHabit(habit.id)}>
                                <span style={{ color: 'white' }}>{habit.text}</span>
                                <div className={`${styles.check} ${isDone ? styles.checked : ''}`}>
                                    {isDone && '✓'}
                                </div>
                            </div>
                        );
                    }) : (
                        <p className={styles.empty}>No habits set yet!</p>
                    )}
                </div>
            </div>
        </div>
    );
}