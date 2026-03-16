import { useState, useEffect } from 'react';
import Navigation from './components/Navigation/Navigation.tsx';
import StatsScreen from './components/Stats/StatsScreen';
import HabitsScreen from './components/Habits/HabitsScreen';
import './App.css';

function App() {
    const [currentScreen, setCurrentScreen] = useState('stats');

    // --- PERSISTENT STATE ---
    // We load from localStorage so data doesn't disappear on screen change
    const [habits, setHabits] = useState(() => {
        const saved = localStorage.getItem('habits');
        return saved ? JSON.parse(saved) : [];
    });

    const [goals, setGoals] = useState(() => {
        const saved = localStorage.getItem('goals');
        return saved ? JSON.parse(saved) : [];
    });

    const [wallet, setWallet] = useState(() => {
        const saved = localStorage.getItem('wallet');
        return saved ? JSON.parse(saved) : { cash: '', bank: '', debtors: '', creditors: '', fd: '' };
    });

    // Automatically save to computer whenever any data changes
    useEffect(() => {
        localStorage.setItem('habits', JSON.stringify(habits));
        localStorage.setItem('goals', JSON.stringify(goals));
        localStorage.setItem('wallet', JSON.stringify(wallet));
    }, [habits, goals, wallet]);

    return (
        <div className="app-container">
            <Navigation currentScreen={currentScreen} setScreen={setCurrentScreen} />

            <main className="main-content">
                {/* We pass the data as "props" so the screens can use/change them */}
                {currentScreen === 'stats' && (
                    <StatsScreen habits={habits} />
                )}

                {currentScreen === 'habits' && (
                    <HabitsScreen
                        habits={habits} setHabits={setHabits}
                        goals={goals} setGoals={setGoals}
                        wallet={wallet} setWallet={setWallet}
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