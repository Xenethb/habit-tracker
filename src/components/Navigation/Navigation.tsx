import { motion } from 'framer-motion';
import styles from './Navigation.module.css';

interface NavigationProps {
    currentScreen: string;
    setScreen: (screen: string) => void;
    onTodayClick: () => void;
    onProfileClick: () => void;
}

export default function Navigation({ currentScreen, setScreen, onTodayClick, onProfileClick }: NavigationProps) {
    const tabs = [
        { id: 'stats', label: '📊 Stats' },
        { id: 'habits', label: '≡ Habits' },
        { id: 'plans', label: '📄 My Plans' }
    ];

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
                    className={`${styles.actionBtn} ${styles.btnNotes} ${currentScreen === 'notes' ? styles.activeAction : ''}`}
                    onClick={() => setScreen('notes')}
                >
                    Notes
                </button>
            </div>

            {/* CENTER: Main Screen Tabs */}
            <div className={styles.tabGroup}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`${styles.tab} ${currentScreen === tab.id ? styles.activeTab : ''}`}
                        onClick={() => setScreen(tab.id)}
                    >
                        {tab.label}

                        {/* THE GLOW INDICATOR */}
                        {currentScreen === tab.id && (
                            <motion.div
                                layoutId="nav-glow"
                                className={styles.tabIndicator}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* RIGHT: Profile */}
            <div className={`${styles.sideGroup} ${styles.rightGroup}`}>
                <button className={styles.profileBtn} onClick={onProfileClick}>
                    👻
                </button>
            </div>
        </nav>
    );
}