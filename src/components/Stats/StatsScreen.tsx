import styles from './StatsScreen.module.css';
import { Habit } from '../../types'; // Only import Habit now

// 1. Only include what we actually use
interface StatsScreenProps {
    habits: Habit[];
}

export default function StatsScreen({ habits }: StatsScreenProps) {

    const calculateCategoryProgress = (category: string): number => {
        const categoryHabits = habits.filter(h => h.category === category);
        if (categoryHabits.length === 0) return 0;
        const completed = categoryHabits.filter(h => h.completed).length;
        return Math.round((completed / categoryHabits.length) * 100);
    };

    const totalCommitments = habits.filter(h => h.completed).length;
    const totalMisses = habits.filter(h => !h.completed).length;

    return (
        <div className={styles.layout}>
            <div className={styles.contributionArea}>
                <div className={styles.yearSelector}>
                    <strong className={styles.activeYear}>2026</strong>
                    <span>2025</span>
                    <span>2024</span>
                </div>

                <div className={`${styles.card} ${styles.contributionCard}`}>
                    <span style={{color: 'var(--text-muted)'}}>{totalCommitments} contributions this year</span>
                    <div className={styles.grid}>
                        {[...Array(371)].map((_, i) => (
                            <div key={i} className={`${styles.cell} ${i === 75 && totalCommitments > 0 ? styles.activeHigh : ''}`}></div>
                        ))}
                    </div>
                </div>
            </div>

            <div className={styles.row}>
                <div className={`${styles.card} ${styles.statList}`}>
                    <h3 className={styles.title}>User's Habit Tracker Stats</h3>
                    <p>⭐ Achievements: <strong>{Math.floor(totalCommitments / 5)}</strong></p>
                    <p>⏱️ Commitments: <strong>{totalCommitments}</strong></p>
                    <p>❌ Misses: <strong>{totalMisses}</strong></p>
                    <p>📋 Habits Active: <strong>{habits.length}</strong></p>
                </div>

                <div className={styles.card}>
                    <h3 className={styles.title} style={{color: 'var(--accent-green)'}}>Habits Tracked</h3>

                    {['Health', 'Education', 'Financial'].map(cat => (
                        <div key={cat} className={styles.progressItem}>
                            <div className={styles.progressHeader}>
                                <span>{cat}</span>
                                <strong>{calculateCategoryProgress(cat)}%</strong>
                            </div>
                            <div className={styles.progressBg}>
                                <div
                                    className={styles.progressFill}
                                    style={{
                                        width: `${calculateCategoryProgress(cat)}%`,
                                        background: cat === 'Health' ? 'var(--accent-green)' : cat === 'Education' ? 'var(--accent-yellow)' : 'var(--accent-blue)'
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={`${styles.card}`} style={{textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                    <h3 className={styles.title}>Promises</h3>
                    <div className={styles.promiseCircle}>
                        <span>{habits.length > 0 ? Math.round((totalCommitments / habits.length) * 100) : 0}%</span>
                    </div>
                </div>
            </div>

            <div className={`${styles.card} ${styles.quoteBox}`}>
                "Your habits are the atoms of your lives. Each one is a fundamental unit that contributes to your overall improvement."
            </div>
        </div>
    );
}