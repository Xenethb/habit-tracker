import { useState, useEffect } from 'react';
import Navigation from './components/Navigation/Navigation.tsx';
import StatsScreen from './components/Stats/StatsScreen';
import HabitsScreen from './components/Habits/HabitsScreen';
import { Habit, Goal, Wallet, Completion } from './types'; // Import Completion
import './App.css';

function App() {
    const [currentScreen, setCurrentScreen] = useState('stats');

    // 1. HABITS: These are just the definitions (e.g., "Gym")
    const [habits, setHabits] = useState<Habit[]>(() => {
        const saved = localStorage.getItem('habits');
        return saved ? JSON.parse(saved) : [];
    });

    // 2. COMPLETIONS: This is the history (e.g., "Gym done on 2026-03-17")
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

    // Automatically save to computer whenever any data changes
    useEffect(() => {
        localStorage.setItem('habits', JSON.stringify(habits));
        localStorage.setItem('completions', JSON.stringify(completions)); // Save the history!
        localStorage.setItem('goals', JSON.stringify(goals));
        localStorage.setItem('wallet', JSON.stringify(wallet));
    }, [habits, completions, goals, wallet]);

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
                    <div style={{textAlign: 'center', marginTop: '50px'}}>
                        <h2>My Plans Screen</h2>
                        <p>Ready to build the Kanban board next?</p>
                    </div>
                )}
            </main>
        </div>
    );
}

export default App;