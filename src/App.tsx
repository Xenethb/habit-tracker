import { useState, useEffect } from 'react';
import Navigation from './components/Navigation/Navigation.tsx';
import StatsScreen from './components/Stats/StatsScreen';
import HabitsScreen from './components/Habits/HabitsScreen';
import PlansScreen from './components/Plans/PlansScreen';
import NotesScreen from './components/Notes/NotesScreen'; // New Import
import TodayModal from './components/Navigation/TodayModal';
import { Habit, Goal, Wallet, Completion, PlanTask, Note } from './types'; // Added Note type
import './App.css';

function App() {
    const [currentScreen, setCurrentScreen] = useState('stats');

    // --- PERSISTENT STATE ---
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

    // New State for Notes
    const [notes, setNotes] = useState<Note[]>(() => {
        const saved = localStorage.getItem('notes');
        return saved ? JSON.parse(saved) : [];
    });

    const [isTodayModalOpen, setIsTodayModalOpen] = useState(false);

    // Automatically save all data whenever any state changes
    useEffect(() => {
        localStorage.setItem('habits', JSON.stringify(habits));
        localStorage.setItem('completions', JSON.stringify(completions));
        localStorage.setItem('goals', JSON.stringify(goals));
        localStorage.setItem('wallet', JSON.stringify(wallet));
        localStorage.setItem('plans', JSON.stringify(plans));
        localStorage.setItem('notes', JSON.stringify(notes)); // Save notes!
    }, [habits, completions, goals, wallet, plans, notes]);

    return (
        <div className="app-container">
            <Navigation
                currentScreen={currentScreen}
                setScreen={setCurrentScreen}
                onTodayClick={() => setIsTodayModalOpen(true)}
            />

            <main className="main-content">
                {currentScreen === 'stats' && (
                    <StatsScreen
                        habits={habits}
                        completions={completions}
                    />
                )}

                {currentScreen === 'habits' && (
                    <HabitsScreen
                        habits={habits}
                        setHabits={setHabits}
                        completions={completions}
                        setCompletions={setCompletions}
                        goals={goals}
                        setGoals={setGoals}
                        wallet={wallet}
                        setWallet={setWallet}
                    />
                )}

                {currentScreen === 'plans' && (
                    <PlansScreen
                        plans={plans}
                        setPlans={setPlans}
                    />
                )}

                {/* New Screen Connection */}
                {currentScreen === 'notes' && (
                    <NotesScreen
                        notes={notes}
                        setNotes={setNotes}
                    />
                )}

                {isTodayModalOpen && (
                    <TodayModal
                        habits={habits}
                        completions={completions}
                        setCompletions={setCompletions}
                        onClose={() => setIsTodayModalOpen(false)}
                    />
                )}
            </main>
        </div>
    );
}

export default App;