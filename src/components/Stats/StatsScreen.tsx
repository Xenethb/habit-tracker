import { useState, useEffect, useMemo } from "react";
import styles from './StatsScreen.module.css';
import { Habit, Completion } from '../../types';

interface StatsScreenProps {
    habits: Habit[];
    completions: Completion[];
}

export default function StatsScreen({ habits, completions }: StatsScreenProps) {

    // 1. Calculate available years from the completions history
    const yearsUsed = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [
            ...new Set(completions.map(c => new Date(c.date).getFullYear()))
        ];
        if (!years.includes(currentYear)) years.push(currentYear);
        return years.sort((a, b) => b - a);
    }, [completions]);

    const [selectedYear, setSelectedYear] = useState(yearsUsed[0]);

    // 2. Filter completions for the selected year
    const completionsInYear = useMemo(() => {
        return completions.filter(c => new Date(c.date).getFullYear() === selectedYear);
    }, [completions, selectedYear]);

    /* ---------------- STREAK LOGIC (UNIQUE CALENDAR DAYS) ---------------- */
    const streak = useMemo(() => {
        const uniqueDates = [...new Set(completions.map(c => c.date))]
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        if (uniqueDates.length === 0) return 0;

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // If no completion today or yesterday, streak is reset
        if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

        let currentStreak = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
            const current = new Date(uniqueDates[i]);
            const previous = new Date(uniqueDates[i + 1]);
            const diff = (current.getTime() - previous.getTime()) / (1000 * 60 * 60 * 24);

            if (diff === 1) {
                currentStreak++;
            } else {
                break;
            }
        }
        return currentStreak;
    }, [completions]);

    /* ---------------- CATEGORY BAR LOGIC ---------------- */
    const categoryStats = useMemo(() => {
        const counts: Record<string, number> = {};

        completionsInYear.forEach(comp => {
            const habit = habits.find(h => h.id === comp.habitId);
            if (habit) {
                counts[habit.category] = (counts[habit.category] || 0) + 1;
            }
        });

        const total = completionsInYear.length;
        const colors: Record<string, string> = {
            Health: "#4ade80", Education: "#60a5fa", Financial: "#facc15", Personal: "#fb7185"
        };

        return Object.entries(counts).map(([cat, count]) => ({
            category: cat,
            percent: total ? (count / total) * 100 : 0,
            color: colors[cat] || "#888"
        })).sort((a, b) => b.percent - a.percent);
    }, [completionsInYear, habits]);

    /* ---------------- RING PROGRESS ---------------- */
    // Progress based on: How many unique habits were done at least once today?
    const today = new Date().toISOString().split('T')[0];
    const habitsDoneToday = [...new Set(completions.filter(c => c.date === today).map(c => c.habitId))].length;
    const dailyTargetPercent = habits.length > 0 ? Math.round((habitsDoneToday / habits.length) * 100) : 0;

    const [animatedProgress, setAnimatedProgress] = useState(0);
    useEffect(() => {
        setAnimatedProgress(0);
        const timeout = setTimeout(() => setAnimatedProgress(dailyTargetPercent), 200);
        return () => clearTimeout(timeout);
    }, [dailyTargetPercent]);

    return (
        <div className={styles.layout}>
            {/* CONTRIBUTION GRAPH */}
            <div className={styles.contributionArea}>
                <div className={styles.yearSelector}>
                    {yearsUsed.map(year => (
                        <span key={year} className={selectedYear === year ? styles.activeYear : styles.yearTab} onClick={() => setSelectedYear(year)}>
                            {year}
                        </span>
                    ))}
                </div>

                <div className={`${styles.card} ${styles.contributionCard}`}>
                    <span className={styles.contributionTitle}>
                        {completionsInYear.length} completions in {selectedYear}
                    </span>
                    <div className={styles.grid}>
                        {Array.from({ length: 365 }).map((_, i) => {
                            const date = new Date(selectedYear, 0, i + 1);
                            const isoDate = date.toISOString().split('T')[0];
                            const isCompleted = completions.some(c => c.date === isoDate);
                            return <div key={i} className={`${styles.cell} ${isCompleted ? styles.activeHigh : ""}`} title={isoDate} />;
                        })}
                    </div>
                </div>
            </div>

            <div className={styles.row}>
                {/* YEARLY OVERVIEW */}
                <div className={styles.card}>
                    <h3 className={styles.title}>All-Time Impact</h3>
                    <div className={styles.statRow}><span>⭐ Achievements</span><strong>{Math.floor(completions.length / 10)}</strong></div>
                    <div className={styles.statRow}><span>⏱ Total Logs</span><strong>{completions.length}</strong></div>
                    <div className={styles.statRow}><span>📋 Active Habits</span><strong>{habits.length}</strong></div>
                    <div className={styles.statRow}><span>🔥 Streak</span><strong>{streak} {streak === 1 ? 'day' : 'days'}</strong></div>
                </div>

                {/* GITHUB STYLE BAR */}
                <div className={styles.card}>
                    <h3 className={styles.title}>Practice Distribution</h3>
                    <div className={styles.langBar}>
                        {categoryStats.map(c => (
                            <div key={c.category} className={styles.langSegment} style={{ width: `${c.percent}%`, background: c.color }} />
                        ))}
                    </div>
                    <div className={styles.langLegend}>
                        {categoryStats.length > 0 ? categoryStats.map(c => (
                            <div key={c.category} className={styles.langItem}>
                                <span className={styles.langDot} style={{ background: c.color }} />
                                <span className={styles.catText}>{c.category}</span>
                                <span className={styles.percentText}>{c.percent.toFixed(1)}%</span>
                            </div>
                        )) : <div className={styles.emptyText}>No data logged yet</div>}
                    </div>
                </div>

                {/* DAILY PROMISE SUCCESS */}
                <div className={`${styles.card} ${styles.promiseCard}`}>
                    <h3 className={styles.title}>Today's Target</h3>
                    <div className={styles.progressRingWrapper}>
                        <svg width="120" height="120">
                            <circle className={styles.progressRingBg} strokeWidth="8" r="48" cx="60" cy="60" />
                            <circle
                                className={styles.progressRing}
                                strokeWidth="8" r="48" cx="60" cy="60"
                                strokeDasharray={301.59}
                                strokeDashoffset={301.59 - (animatedProgress / 100) * 301.59}
                            />
                        </svg>
                        <div className={styles.progressText}>{animatedProgress}%</div>
                    </div>
                </div>
            </div>

            <div className={`${styles.card} ${styles.quoteBox}`}>
                "Your habits are the atoms of your lives. Each one is a fundamental unit that contributes to your overall improvement."
            </div>
        </div>
    );
}