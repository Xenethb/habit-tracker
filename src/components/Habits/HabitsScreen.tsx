import React, { useState } from 'react';
import styles from './HabitsScreen.module.css';
import { Habit, Goal, Wallet, Completion } from '../../types';

interface HabitsScreenProps {
    habits: Habit[];
    setHabits: React.Dispatch<React.SetStateAction<Habit[]>>;
    completions: Completion[];
    setCompletions: React.Dispatch<React.SetStateAction<Completion[]>>;
    goals: Goal[];
    setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
    wallet: Wallet;
    setWallet: React.Dispatch<React.SetStateAction<Wallet>>;
}

export default function HabitsScreen({
                                         habits, setHabits, completions, setCompletions, goals, setGoals, wallet, setWallet
                                     }: HabitsScreenProps) {
    const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
    const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);

    // Edit States
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

    const [newHabit, setNewHabit] = useState({ text: '', category: 'Health' });
    const [newGoal, setNewGoal] = useState('');

    const categoryColors: Record<string, string> = {
        Health: "#4ade80", Education: "#60a5fa", Financial: "#facc15", Personal: "#fb7185"
    };

    const getTodayStr = () => new Date().toISOString().split("T")[0];

    /* --- HABIT ACTIONS --- */
    const toggleHabit = (habitId: number) => {
        const today = getTodayStr();
        // Check if it's already done today
        const existingCompletion = completions.find(c => c.habitId === habitId && c.date === today);

        if (existingCompletion) {
            // If it exists, remove it (Untick)
            setCompletions(completions.filter(c => c.id !== existingCompletion.id));
        } else {
            // If it's new, add it with a UNIQUE ID
            const newCompletion: Completion = {
                id: Date.now(), // This fixes the TS2322/TS2741 error
                habitId: habitId,
                date: today
            };
            setCompletions([...completions, newCompletion]);
        }
    };

    const handleUpdateHabit = () => {
        if (!editingHabit || editingHabit.text.trim() === '') return;
        setHabits(habits.map(h => h.id === editingHabit.id ? editingHabit : h));
        setEditingHabit(null);
    };

    const handleDeleteHabit = (id: number) => {
        setHabits(habits.filter(h => h.id !== id));
        setCompletions(completions.filter(c => c.habitId !== id)); // Clean history
        setEditingHabit(null);
    };

    /* --- GOAL ACTIONS --- */
    const handleUpdateGoal = () => {
        if (!editingGoal || editingGoal.text.trim() === '') return;
        setGoals(goals.map(g => g.id === editingGoal.id ? editingGoal : g));
        setEditingGoal(null);
    };

    const handleDeleteGoal = (id: number) => {
        setGoals(goals.filter(g => g.id !== id));
        setEditingGoal(null);
    };

    /* --- ADD ACTIONS --- */
    const handleAddHabit = () => {
        if (newHabit.text.trim() === '') return;
        setHabits([...habits, { ...newHabit, id: Date.now() }]);
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
                        const isDoneToday = completions.some(c => c.habitId === habit.id && c.date === getTodayStr());
                        return (
                            <div key={habit.id} className={styles.item} onClick={() => setEditingHabit(habit)}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 350, color: '#ffffff' }}>{habit.text}</span>
                                    <small style={{ fontSize: '10px', backgroundColor: categoryColors[habit.category], padding: '2px 6px', borderRadius: '4px', marginTop: '4px' }}>
                                        {habit.category}
                                    </small>
                                </div>
                                <div
                                    className={`${styles.checkCircle} ${isDoneToday ? styles.completed : ''}`}
                                    onClick={(e) => { e.stopPropagation(); toggleHabit(habit.id); }}
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
                        <div key={goal.id} className={styles.item} onClick={() => setEditingGoal(goal)} style={{ justifyContent: 'center' }}>
                            {goal.text}
                        </div>
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
                            <input className={styles.walletInput} value={wallet[key]} onChange={(e) => setWallet({ ...wallet, [key]: e.target.value })} placeholder="0.00" />
                        </div>
                    ))}
                </div>
            </div>

            {/* --- MODALS (Add/Edit) --- */}

            {/* New Habit Modal */}
            {isHabitModalOpen && (
                <div className="modal-overlay"><div className="modal-content">
                    <h3>New Habit</h3>
                    <input className="modal-input" value={newHabit.text} onChange={(e) => setNewHabit({ ...newHabit, text: e.target.value })} autoFocus />
                    <select className="modal-select" value={newHabit.category} onChange={(e) => setNewHabit({ ...newHabit, category: e.target.value })}>
                        {Object.keys(categoryColors).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <div className="modal-actions">
                        <button className="btn-cancel" onClick={() => setIsHabitModalOpen(false)}>Cancel</button>
                        <button className="btn-save" onClick={handleAddHabit}>Add</button>
                    </div>
                </div></div>
            )}

            {/* Edit Habit Modal */}
            {editingHabit && (
                <div className="modal-overlay"><div className="modal-content">
                    <h3 style={{color: 'var(--accent-blue)'}}>Edit Habit</h3>
                    <input className="modal-input" value={editingHabit.text} onChange={(e) => setEditingHabit({ ...editingHabit, text: e.target.value })} autoFocus />
                    <select className="modal-select" value={editingHabit.category} onChange={(e) => setEditingHabit({ ...editingHabit, category: e.target.value })}>
                        {Object.keys(categoryColors).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <div className="modal-actions" style={{justifyContent: 'space-between'}}>
                        <button className="btn-cancel" style={{color: '#fb7185'}} onClick={() => handleDeleteHabit(editingHabit.id)}>Delete</button>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button className="btn-cancel" onClick={() => setEditingHabit(null)}>Cancel</button>
                            <button className="btn-save" style={{backgroundColor: 'var(--accent-blue)'}} onClick={handleUpdateHabit}>Save</button>
                        </div>
                    </div>
                </div></div>
            )}

            {/* Edit Goal Modal */}
            {editingGoal && (
                <div className="modal-overlay"><div className="modal-content">
                    <h3 style={{color: 'var(--accent-yellow)'}}>Edit Goal</h3>
                    <input className="modal-input" value={editingGoal.text} onChange={(e) => setEditingGoal({ ...editingGoal, text: e.target.value })} autoFocus />
                    <div className="modal-actions" style={{justifyContent: 'space-between'}}>
                        <button className="btn-cancel" style={{color: '#fb7185'}} onClick={() => handleDeleteGoal(editingGoal.id)}>Delete</button>
                        <div style={{display: 'flex', gap: '10px'}}>
                            <button className="btn-cancel" onClick={() => setEditingGoal(null)}>Cancel</button>
                            <button className="btn-save" style={{backgroundColor: 'var(--accent-yellow)', color: 'black'}} onClick={handleUpdateGoal}>Save</button>
                        </div>
                    </div>
                </div></div>
            )}

            {/* Goal Add Modal omitted for brevity, logic is same as habit add */}
            {isGoalModalOpen && (
                <div className="modal-overlay"><div className="modal-content">
                    <h3>New Goal</h3>
                    <input className="modal-input" value={newGoal} onChange={(e) => setNewGoal(e.target.value)} autoFocus />
                    <div className="modal-actions">
                        <button className="btn-cancel" onClick={() => setIsGoalModalOpen(false)}>Cancel</button>
                        <button className="btn-save" onClick={handleAddGoal}>Add</button>
                    </div>
                </div></div>
            )}
        </div>
    );
}