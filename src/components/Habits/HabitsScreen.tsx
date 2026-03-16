import React, { useState } from 'react';
import styles from './HabitsScreen.module.css';
import { Habit, Goal, Wallet } from '../../types';

interface HabitsScreenProps {
    habits: Habit[];
    setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
    goals: Goal[];
    setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
    wallet: Wallet;
    setWallet: React.Dispatch<React.SetStateAction<Wallet>>;
}

export default function HabitsScreen({
                                         habits,
                                         setHabits,
                                         goals,
                                         setGoals,
                                         wallet,
                                         setWallet
                                     }: HabitsScreenProps) {
    const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

    const [newHabit, setNewHabit] = useState({ text: '', category: 'Health' });
    const [newGoal, setNewGoal] = useState('');

    // Map category to colors
    const categoryColors: Record<string, string> = {
        Health: "#4ade80",
        Education: "#60a5fa",
        Financial: "#facc15",
        Personal: "#fb7185"
    };

    const toggleHabit = (id: number) => {
        const today = new Date().toISOString().split("T")[0];
        setHabits(
            habits.map(h =>
                h.id === id
                    ? {
                        ...h,
                        completed: !h.completed,
                        date: !h.completed ? today : undefined // only set date when marking completed
                    }
                    : h
            )
        );
    };

    const handleAddHabit = () => {
        if (newHabit.text.trim() === '') return;

        const habitToAdd: Habit = {
            ...newHabit,
            id: Date.now(),
            completed: false,
            date:""
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
                    {habits.map(habit => (
                        <div key={habit.id} className={styles.item}>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 500 }}>{habit.text}</span>
                                <small
                                    style={{
                                        fontSize: '10px',
                                        color: '#fff',
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
                                className={`${styles.checkCircle} ${habit.completed ? styles.completed : ''}`}
                                onClick={() => toggleHabit(habit.id)}
                            >
                                {habit.completed && '✓'}
                            </div>
                        </div>
                    ))}
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

            {/* --- ADD HABIT MODAL --- */}
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

            {/* --- ADD GOAL MODAL --- */}
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