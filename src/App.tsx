import { useState, useEffect, useRef } from 'react';
// Components
import Navigation from './components/Navigation/Navigation';
import StatsScreen from './components/Stats/StatsScreen';
import HabitsScreen from './components/Habits/HabitsScreen';
import PlansScreen from './components/Plans/PlansScreen';
import NotesScreen from './components/Notes/NotesScreen';
import TodayModal from './components/Navigation/TodayModal';
import AccountDrawer from './components/Account/AccountDrawer';

// Supabase & Types
import { supabase } from './supabaseClient';
import { Session, AuthChangeEvent, User } from '@supabase/supabase-js';
import { Habit, Goal, Wallet, Completion, PlanTask, Note } from './types';

// Styles
import './App.css';

function App() {
    // --- UI STATE ---
    const [currentScreen, setCurrentScreen] = useState('stats');
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const [isTodayModalOpen, setIsTodayModalOpen] = useState(false);

    // --- AUTH STATE ---
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
    // These keep track of what IDs were in the DB during the last sync
    const lastHabitIds = useRef<number[]>(habits.map(h => h.id));
    const lastPlanIds = useRef<number[]>(plans.map(p => p.id));
    const lastNoteIds = useRef<number[]>(notes.map(n => n.id));

    // --- EFFECT: Local Storage Persistence ---
    useEffect(() => {
        localStorage.setItem('habits', JSON.stringify(habits));
        localStorage.setItem('completions', JSON.stringify(completions));
        localStorage.setItem('goals', JSON.stringify(goals));
        localStorage.setItem('wallet', JSON.stringify(wallet));
        localStorage.setItem('plans', JSON.stringify(plans));
        localStorage.setItem('notes', JSON.stringify(notes));
    }, [habits, completions, goals, wallet, plans, notes]);

    // --- EFFECT: Supabase Auth Listener ---
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event: AuthChangeEvent, session: Session | null) => {
                setUser(session?.user ?? null);
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    // --- EFFECT: Cloud Live Sync (Upserts & Deletes) ---
    useEffect(() => {
        if (!user) return;

        const performSync = async () => {
            // 1. HANDLE HABITS
            const deletedHabits = lastHabitIds.current.filter(id => !habits.find(h => h.id === id));
            if (deletedHabits.length) {
                await supabase.from('habits').delete().in('id', deletedHabits);
            }
            if (habits.length) {
                await supabase.from('habits').upsert(habits.map(h => ({ ...h, user_id: user.id })));
            }
            lastHabitIds.current = habits.map(h => h.id);

            // 2. HANDLE PLANS
            const deletedPlans = lastPlanIds.current.filter(id => !plans.find(p => p.id === id));
            if (deletedPlans.length) {
                await supabase.from('plans').delete().in('id', deletedPlans);
            }
            if (plans.length) {
                await supabase.from('plans').upsert(plans.map(p => ({ ...p, user_id: user.id })));
            }
            lastPlanIds.current = plans.map(p => p.id);

            // 3. HANDLE NOTES
            const deletedNotes = lastNoteIds.current.filter(id => !notes.find(n => n.id === id));
            if (deletedNotes.length) {
                await supabase.from('notes').delete().in('id', deletedNotes);
            }
            if (notes.length) {
                await supabase.from('notes').upsert(notes.map(n => ({ ...n, user_id: user.id })));
            }
            lastNoteIds.current = notes.map(n => n.id);

            // 4. HANDLE WALLET (Single row, always upsert)
            await supabase.from('wallet').upsert({ ...wallet, user_id: user.id });
        };

        const timeout = setTimeout(performSync, 2000); // 2 second debounce
        return () => clearTimeout(timeout);
    }, [habits, plans, notes, wallet, user]);

    return (
        <div className="app-container">
            <Navigation
                currentScreen={currentScreen}
                setScreen={setCurrentScreen}
                onTodayClick={() => setIsTodayModalOpen(true)}
                onProfileClick={() => setIsAccountOpen(true)}
            />

            <main className="main-content">
                {currentScreen === 'stats' && <StatsScreen habits={habits} completions={completions} />}

                {currentScreen === 'habits' && (
                    <HabitsScreen
                        habits={habits} setHabits={setHabits}
                        completions={completions} setCompletions={setCompletions}
                        goals={goals} setGoals={setGoals}
                        wallet={wallet} setWallet={setWallet}
                    />
                )}

                {currentScreen === 'plans' && <PlansScreen plans={plans} setPlans={setPlans} />}
                {currentScreen === 'notes' && <NotesScreen notes={notes} setNotes={setNotes} />}

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
                    localData={{ habits, plans, notes, wallet, completions, goals }}
                    setters={{ setHabits, setPlans, setNotes, setWallet, setCompletions, setGoals }}
                />
            </main>
        </div>
    );
}

export default App;