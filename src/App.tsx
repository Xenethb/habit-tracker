import { useState, useEffect } from 'react';
import Navigation from './components/Navigation/Navigation.tsx';
import StatsScreen from './components/Stats/StatsScreen';
import HabitsScreen from './components/Habits/HabitsScreen';
import PlansScreen from './components/Plans/PlansScreen'; // 1. Added this import
import { Habit, Goal, Wallet, Completion, PlanTask } from './types'; // 2. Added PlanTask here
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

    // Automatically save all data whenever any state changes
    useEffect(() => {
        localStorage.setItem('habits', JSON.stringify(habits));
        localStorage.setItem('completions', JSON.stringify(completions));
        localStorage.setItem('goals', JSON.stringify(goals));
        localStorage.setItem('wallet', JSON.stringify(wallet));
        localStorage.setItem('plans', JSON.stringify(plans));
    }, [habits, completions, goals, wallet, plans]);

    return (
        <div className="app-container">
            <Navigation currentScreen={currentScreen} setScreen={setCurrentScreen} />

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
            </main>
        </div>
    );
}

export default App;