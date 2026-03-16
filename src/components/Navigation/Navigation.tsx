
// src/components/Navigation/Navigation.tsx

import styles from './Navigation.module.css';

interface NavigationProps {
    currentScreen: string;
    setScreen: (screen: string) => void;
}

export default function Navigation({ currentScreen, setScreen }: NavigationProps) {
    return (
        <nav className={styles.nav}>
            {/* LEFT: Action Buttons */}
            <div className={styles.sideGroup}>
                <button className={`${styles.actionBtn} ${styles.btnToday}`} onClick={() => alert("Today clicked")}>
                    Today
                </button>
                <button className={`${styles.actionBtn} ${styles.btnNotes}`} onClick={() => alert("Notes clicked")}>
                    Notes
                </button>
            </div>

            {/* CENTER: Main Screen Tabs (Segmented Control) */}
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
                <button className={styles.profileBtn}>
                    👤
                </button>
            </div>
        </nav>
    );
}