import React, { useState } from 'react';
import styles from './HabitsScreen.module.css';
import { Habit, Goal, Wallet, Completion } from '../../types';

interface HabitsScreenProps {
    habits: Habit[];
    setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
    completions: Completion[]; // Added this
    setCompletions: React.Dispatch<React.SetStateAction<Completion[]>>; // Added this
    goals: Goal[];
    setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
    wallet: Wallet;
    setWallet: React.Dispatch<React.SetStateAction<Wallet>>;
}

export default function HabitsScreen({
                                         habits,
                                         setHabits,
                                         completions,
                                         setCompletions,
                                         goals,
                                         setGoals,
                                         wallet,
                                         setWallet
                                     }: HabitsScreenProps) {
    const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
    const [newHabit, setNewHabit] = useState({ text: '', category: 'Health' });
    const [newGoal, setNewGoal] = useState('');

    const categoryColors: Record<string, string> = {
        Health: "#4ade80",
        Education: "#60a5fa",
        Financial: "#facc15",
        Personal: "#fb7185"
    };

    // Helper to get today's date string
    const getTodayStr = () => new Date().toISOString().split("T")[0];

    const toggleHabit = (habitId: number) => {
        const today = getTodayStr();

        // Check if a completion record already exists for THIS habit on THIS day
        const isAlreadyDone = completions.some(c => c.habitId === habitId && c.date === today);

        if (isAlreadyDone) {
            // UNTICK: Remove only today's record from the history
            setCompletions(completions.filter(c => !(c.habitId === habitId && c.date === today)));
        } else {
            // TICK: Add a new completion record for today
            setCompletions([...completions, { habitId, date: today }]);
        }
    };

    const handleAddHabit = () => {
        if (newHabit.text.trim() === '') return;
        const habitToAdd: Habit = {
            ...newHabit,
            id: Date.now(),
        };
        setHabits([...habits, habitToAdd]);
        setNewHabit({ text: '', category: 'Health' });
        setIsHabitModalOpen(false);
    };

    const handleAddGoal = () => {
        if (newGoal.trim() === '') return;
        setGoals([...goals, { id: Date.now(), text: newGoal }]);
        setNewGoal('');
        setIsGoalModalOpen(false);
    };

    return (
        <div className={styles.container}>
            {/* Column 1: Habits */}
            <div className={styles.column}>
                <div className={styles.header}>Must do Everyday</div>
                <div className={styles.habitList}>
                    {habits.map(habit => {
                        // Check if THIS habit is completed for TODAY
                        const isDoneToday = completions.some(
                            c => c.habitId === habit.id && c.date === getTodayStr()
                        );

                        return (
                            <div key={habit.id} className={styles.item}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 500, color: '#000000' }}>{habit.text}</span>
                                    <small
                                        style={{
                                            fontSize: '10px',
                                            color: '#ffffff',
                                            backgroundColor: categoryColors[habit.category],
                                            padding: '2px 6px',
                                            borderRadius: '4px',
                                            display: 'inline-block',
                                            marginTop: '4px'
                                        }}
                                    >
                                        {habit.category}
                                    </small>
                                </div>
                                <div
                                    className={`${styles.checkCircle} ${isDoneToday ? styles.completed : ''}`}
                                    onClick={() => toggleHabit(habit.id)}
                                >
                                    {isDoneToday && '✓'}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button className={styles.addBtn} onClick={() => setIsHabitModalOpen(true)}>+ ADD HABIT</button>
            </div>

            {/* Column 2: Goals */}
            <div className={styles.column}>
                <div className={styles.header}>My Goals this year</div>
                <div className={styles.habitList}>
                    {goals.map(goal => (
                        <div key={goal.id} className={styles.item} style={{ justifyContent: 'center' }}>{goal.text}</div>
                    ))}
                </div>
                <button className={styles.addBtn} onClick={() => setIsGoalModalOpen(true)}>+ ADD GOAL</button>
            </div>

            {/* Column 3: Wallet */}
            <div className={styles.column}>
                <div className={styles.header}>Wallet</div>
                <div className={styles.walletContent}>
                    {Object.keys(wallet).map(key => (
                        <div key={key}>
                            <label className={styles.walletLabel}>{key}</label>
                            <input
                                className={styles.walletInput}
                                value={wallet[key]}
                                onChange={(e) => setWallet({ ...wallet, [key]: e.target.value })}
                                placeholder="0.00"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Modals remain the same... */}
            {isHabitModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>New Habit</h3>
                        <label>Task Name</label>
                        <input
                            className="modal-input"
                            placeholder="e.g. Read 10 pages"
                            value={newHabit.text}
                            onChange={(e) => setNewHabit({ ...newHabit, text: e.target.value })}
                            autoFocus
                        />
                        <label>Category</label>
                        <select
                            className="modal-select"
                            value={newHabit.category}
                            onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}
                        >
                            <option value="Health">Health</option>
                            <option value="Education">Education</option>
                            <option value="Financial">Financial</option>
                            <option value="Personal">Personal</option>
                        </select>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setIsHabitModalOpen(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleAddHabit}>Add Habit</button>
                        </div>
                    </div>
                </div>
            )}

            {isGoalModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>New Goal</h3>
                        <label>Annual Goal</label>
                        <input
                            className="modal-input"
                            placeholder="e.g. Learn Rust"
                            value={newGoal}
                            onChange={(e) => setNewGoal(e.target.value)}
                            autoFocus
                        />
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => setIsGoalModalOpen(false)}>Cancel</button>
                            <button className="btn-save" onClick={handleAddGoal}>Add Goal</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}