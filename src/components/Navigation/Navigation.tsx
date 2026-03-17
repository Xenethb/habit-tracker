// src/components/Navigation/Navigation.tsx
import styles from './Navigation.module.css';

interface NavigationProps {
    currentScreen: string;
    setScreen: (screen: string) => void;
    onTodayClick: () => void;
    onProfileClick: () => void;
}

export default function Navigation({ currentScreen, setScreen, onTodayClick, onProfileClick }: NavigationProps) {
    return (
        <nav className={styles.nav}>
            {/* LEFT: Action Buttons */}
            <div className={styles.sideGroup}>
                <button
                    className={`${styles.actionBtn} ${styles.btnToday}`}
                    onClick={onTodayClick}
                >
                    Today
                </button>
                <button
                    className={`${styles.actionBtn} ${styles.btnNotes}`}
                    onClick={() => setScreen('notes')} // Updated for your next feature!
                >
                    Notes
                </button>
            </div>

            {/* CENTER: Main Screen Tabs */}
            <div className={styles.tabGroup}>
                <button
                    className={`${styles.tab} ${currentScreen === 'stats' ? styles.activeTab : ''}`}
                    onClick={() => setScreen('stats')}
                >
                    📊 Stats
                </button>
                <button
                    className={`${styles.tab} ${currentScreen === 'habits' ? styles.activeTab : ''}`}
                    onClick={() => setScreen('habits')}
                >
                    ≡ Habits
                </button>
                <button
                    className={`${styles.tab} ${currentScreen === 'plans' ? styles.activeTab : ''}`}
                    onClick={() => setScreen('plans')}
                >
                    📄 My Plans
                </button>
            </div>

            {/* RIGHT: Profile */}
            <div className={`${styles.sideGroup} ${styles.rightGroup}`}>
                <button className={styles.profileBtn} onClick={onProfileClick}>
                    👤
                </button>
            </div>
        </nav>
    );
}