import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import Navigation from './components/Navigation/Navigation';
import StatsScreen from './components/Stats/StatsScreen';
import HabitsScreen from './components/Habits/HabitsScreen';
import PlansScreen from './components/Plans/PlansScreen';
import NotesScreen from './components/Notes/NotesScreen';
import TodayModal from './components/Navigation/TodayModal';
import AccountDrawer from './components/Account/AccountDrawer';

import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js'; // Removed Session and AuthChangeEvent
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

    // --- LOGIC: Clear all data (For Logout) ---
    const clearLocalData = () => {
        console.log("🧹 Clearing all local data...");
        localStorage.clear();
        setHabits([]);
        setCompletions([]);
        setGoals([]);
        setPlans([]);
        setNotes([]);
        setWallet({ cash: '', bank: '', debtors: '', creditors: '', fd: '' });
    };

    // --- LOGIC: Fetch all data from Cloud (For Login) ---
    const fetchUserData = async (userId: string) => {
        console.log("📥 Downloading cloud data for user:", userId);

        const [
            { data: h }, { data: c }, { data: g },
            { data: p }, { data: n }, { data: w }
        ] = await Promise.all([
            supabase.from('habits').select('*').eq('user_id', userId),
            supabase.from('completions').select('*').eq('user_id', userId),
            supabase.from('goals').select('*').eq('user_id', userId),
            supabase.from('plans').select('*').eq('user_id', userId),
            supabase.from('notes').select('*').eq('user_id', userId),
            supabase.from('wallet').select('*').eq('user_id', userId).maybeSingle()
        ]);

        if (h) setHabits(h);
        if (c) setCompletions(c);
        if (g) setGoals(g);
        if (p) setPlans(p);
        if (n) setNotes(n);

        if (w) {
            const { user_id: _uid, ...pureWallet } = w;
            setWallet(pureWallet as Wallet);
        }
    };

    // --- EFFECT: Auth Listener & Initial Load ---
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);
            if (currentUser) fetchUserData(currentUser.id);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            const currentUser = session?.user ?? null;
            setUser(currentUser);

            if (event === 'SIGNED_IN' && currentUser) {
                fetchUserData(currentUser.id);
            }
            if (event === 'SIGNED_OUT') {
                clearLocalData();
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // --- EFFECT: Local Storage Persistence ---
    useEffect(() => {
        localStorage.setItem('habits', JSON.stringify(habits));
        localStorage.setItem('completions', JSON.stringify(completions));
        localStorage.setItem('goals', JSON.stringify(goals));
        localStorage.setItem('wallet', JSON.stringify(wallet));
        localStorage.setItem('plans', JSON.stringify(plans));
        localStorage.setItem('notes', JSON.stringify(notes));
    }, [habits, completions, goals, wallet, plans, notes]);

    // --- EFFECT: Cloud Live Sync ---
    useEffect(() => {
        if (!user) return;

        const performSync = async () => {
            console.log("🛠️ Syncing to Cloud...");

            const syncTable = async (table: string, currentData: any[], lastIdsRef: React.MutableRefObject<number[]>) => {
                const currentIds = currentData.map(item => item.id);
                const deletedIds = lastIdsRef.current.filter(id => !currentIds.includes(id));

                if (deletedIds.length) {
                    await supabase.from(table).delete().in('id', deletedIds);
                }

                if (currentData.length) {
                    await supabase.from(table).upsert(currentData.map(item => ({ ...item, user_id: user.id })));
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

            <main className="main-content">
                <AnimatePresence mode="wait">
                    {currentScreen === 'stats' && (
                        <motion.div key="stats" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
                            <StatsScreen habits={habits} completions={completions} />
                        </motion.div>
                    )}

                    {currentScreen === 'habits' && (
                        <motion.div key="habits" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
                            <HabitsScreen
                                habits={habits} setHabits={setHabits}
                                completions={completions} setCompletions={setCompletions}
                                goals={goals} setGoals={setGoals}
                                wallet={wallet} setWallet={setWallet}
                            />
                        </motion.div>
                    )}

                    {currentScreen === 'plans' && (
                        <motion.div key="plans" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
                            <PlansScreen plans={plans} setPlans={setPlans} />
                        </motion.div>
                    )}

                    {currentScreen === 'notes' && (
                        <motion.div key="notes" variants={screenVariants} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.2 }}>
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
                    isOpen={isAccountOpen}
                    onClose={() => setIsAccountOpen(false)}
                    user={user}
                    setUser={setUser}
                    onLogout={clearLocalData}
                    localData={{ habits, plans, notes, wallet, completions, goals }}
                    setters={{ setHabits, setPlans, setNotes, setWallet, setCompletions, setGoals }}
                />
            </main>
        </div>
    );
}

export default App;