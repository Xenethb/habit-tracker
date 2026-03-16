import React, { useState } from 'react';
import styles from './HabitsScreen.module.css';
import { Habit, Goal, Wallet } from '../../types';

// 1. Define the contract for the props
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
    // Modal visibility state
    const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

    // New habit input state
    const [newHabit, setNewHabit] = useState({ text: '', category: 'Health' });
    const [newGoal, setNewGoal] = useState('');

    const toggleHabit = (id: number) => {
        setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
    };

    const handleAddHabit = () => {
        if (newHabit.text.trim() === '') return;
        setHabits([...habits, { ...newHabit, id: Date.now(), completed: false }]);
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
                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                <span style={{fontWeight: 500}}>{habit.text}</span>
                                <small style={{fontSize: '10px', color: '#666'}}>{habit.category}</small>
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
                        <div key={goal.id} className={styles.item} style={{justifyContent: 'center'}}>{goal.text}</div>
                    ))}
                </div>
                <button className={styles.addBtn} onClick={() => setIsGoalModalOpen(true)}>+ ADD GOAL</button>
            </div>

            {/* Column 3: Wallet */}
            <div className={styles.column}>
                <div className={styles.header}>Wallet</div>
                <div className={styles.walletContent}>
                    {/* We use Object.keys(wallet) to loop through each financial item */}
                    {Object.keys(wallet).map(key => (
                        <div key={key}>
                            <label className={styles.walletLabel}>{key}</label>
                            <input
                                className={styles.walletInput}
                                value={wallet[key]}
                                onChange={(e) => setWallet({...wallet, [key]: e.target.value})}
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
                        <input className="modal-input" placeholder="e.g. Read 10 pages" value={newHabit.text} onChange={(e) => setNewHabit({...newHabit, text: e.target.value})} autoFocus />
                        <label>Category</label>
                        <select className="modal-select" value={newHabit.category} onChange={(e) => setNewHabit({...newHabit, category: e.target.value})}>
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