import { useState, useEffect, useRef } from 'react';
// 1. Import Framer Motion components
import { motion, AnimatePresence } from 'framer-motion';

import Navigation from './components/Navigation/Navigation';
import StatsScreen from './components/Stats/StatsScreen';
import HabitsScreen from './components/Habits/HabitsScreen';
import PlansScreen from './components/Plans/PlansScreen';
import NotesScreen from './components/Notes/NotesScreen';
import TodayModal from './components/Navigation/TodayModal';
import AccountDrawer from './components/Account/AccountDrawer';

import { supabase } from './supabaseClient';
import { Session, AuthChangeEvent, User } from '@supabase/supabase-js';
import { Habit, Goal, Wallet, Completion, PlanTask, Note } from './types';
import './App.css';

function App() {
    const [currentScreen, setCurrentScreen] = useState('stats');
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [isTodayModalOpen, setIsTodayModalOpen] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    // --- DATA STATE ---
    const [habits, setHabits] = useState<Habit[]>(() => {
        const saved = localStorage.getItem('habits');
        return saved ? JSON.parse(saved) : [];
    });
    const [completions, setCompletions] = useState<Completion[]>(() => {
        const saved = localStorage.getItem('completions');
        return saved ? JSON.parse(saved) : [];
    });
    const [goals, setGoals] = useState<Goal[]>(() => {
        const saved = localStorage.getItem('goals');
        return saved ? JSON.parse(saved) : [];
    });
    const [wallet, setWallet] = useState<Wallet>(() => {
        const saved = localStorage.getItem('wallet');
        return saved ? JSON.parse(saved) : { cash: '', bank: '', debtors: '', creditors: '', fd: '' };
    });
    const [plans, setPlans] = useState<PlanTask[]>(() => {
        const saved = localStorage.getItem('plans');
        return saved ? JSON.parse(saved) : [];
    });
    const [notes, setNotes] = useState<Note[]>(() => {
        const saved = localStorage.getItem('notes');
        return saved ? JSON.parse(saved) : [];
    });

    // --- REFS FOR DELETE TRACKING ---
    const lastHabitIds = useRef<number[]>(habits.map(h => h.id));
    const lastPlanIds = useRef<number[]>(plans.map(p => p.id));
    const lastNoteIds = useRef<number[]>(notes.map(n => n.id));
    const lastCompletionIds = useRef<number[]>(completions.map(c => c.id));
    const lastGoalIds = useRef<number[]>(goals.map(g => g.id));

    // --- EFFECT: Local Storage ---
    useEffect(() => {
        localStorage.setItem('habits', JSON.stringify(habits));
        localStorage.setItem('completions', JSON.stringify(completions));
        localStorage.setItem('goals', JSON.stringify(goals));
        localStorage.setItem('wallet', JSON.stringify(wallet));
        localStorage.setItem('plans', JSON.stringify(plans));
        localStorage.setItem('notes', JSON.stringify(notes));
    }, [habits, completions, goals, wallet, plans, notes]);

    // --- EFFECT: Auth Listener ---
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
            setUser(session?.user ?? null);
        });
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
            setUser(session?.user ?? null);
        });
        return () => subscription.unsubscribe();
    }, []);

    // --- EFFECT: Cloud Live Sync ---
    useEffect(() => {
        if (!user) return;

        const performSync = async () => {
            console.log("🛠️ Syncing to Cloud...");

            const syncTable = async (table: string, currentData: any[], lastIdsRef: React.MutableRefObject<number[]>) => {
                const currentIds = currentData.map(item => item.id);
                const deletedIds = lastIdsRef.current.filter(id => !currentIds.includes(id));

                if (deletedIds.length) {
                    const { error: delError } = await supabase.from(table).delete().in('id', deletedIds);
                    if (delError) console.error(`❌ ${table} Delete Error:`, delError.message);
                }

                if (currentData.length) {
                    const { error: upError } = await supabase
                        .from(table)
                        .upsert(currentData.map(item => ({ ...item, user_id: user.id })));

                    if (upError) {
                        console.error(`❌ ${table} Upsert Error:`, upError.message);
                    } else {
                        console.log(`✅ ${table} synced successfully.`);
                    }
                }
                lastIdsRef.current = currentIds;
            };

            await Promise.all([
                syncTable('habits', habits, lastHabitIds),
                syncTable('plans', plans, lastPlanIds),
                syncTable('notes', notes, lastNoteIds),
                syncTable('completions', completions, lastCompletionIds),
                syncTable('goals', goals, lastGoalIds),
                supabase.from('wallet').upsert({ ...wallet, user_id: user.id })
            ]);
        };

        const timeout = setTimeout(performSync, 2000);
        return () => clearTimeout(timeout);

    }, [habits, completions, goals, wallet, plans, notes, user]);

    // 2. Define the animation variants for the screens
    const screenVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
    };

    return (
        <div className="app-container">
            <Navigation
                currentScreen={currentScreen}
                setScreen={setCurrentScreen}
                onTodayClick={() => setIsTodayModalOpen(true)}
                onProfileClick={() => setIsAccountOpen(true)}
            />

            <main className="main-content" style={{ position: 'relative' }}>
                {/* 3. Wrap screens in AnimatePresence to enable exit animations */}
                <AnimatePresence mode="wait">
                    {currentScreen === 'stats' && (
                        <motion.div
                            key="stats"
                            variants={screenVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.2 }}
                        >
                            <StatsScreen habits={habits} completions={completions} />
                        </motion.div>
                    )}

                    {currentScreen === 'habits' && (
                        <motion.div
                            key="habits"
                            variants={screenVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.2 }}
                        >
                            <HabitsScreen
                                habits={habits} setHabits={setHabits}
                                completions={completions} setCompletions={setCompletions}
                                goals={goals} setGoals={setGoals}
                                wallet={wallet} setWallet={setWallet}
                            />
                        </motion.div>
                    )}

                    {currentScreen === 'plans' && (
                        <motion.div
                            key="plans"
                            variants={screenVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.2 }}
                        >
                            <PlansScreen plans={plans} setPlans={setPlans} />
                        </motion.div>
                    )}

                    {currentScreen === 'notes' && (
                        <motion.div
                            key="notes"
                            variants={screenVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.2 }}
                        >
                            <NotesScreen notes={notes} setNotes={setNotes} />
                        </motion.div>
                    )}
                </AnimatePresence>

                {isTodayModalOpen && (
                    <TodayModal
                        habits={habits} completions={completions}
                        setCompletions={setCompletions} onClose={() => setIsTodayModalOpen(false)}
                    />
                )}

                <AccountDrawer
                    isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)}
                    user={user} setUser={setUser}
                    localData={{ habits, plans, notes, wallet, completions, goals }}
                    setters={{ setHabits, setPlans, setNotes, setWallet, setCompletions, setGoals }}
                />
            </main>
        </div>
    );
}

export default App;