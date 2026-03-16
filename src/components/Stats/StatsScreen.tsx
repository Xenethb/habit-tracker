import { useState, useEffect, useMemo } from "react";
import styles from './StatsScreen.module.css';
import { Habit } from '../../types';

interface StatsScreenProps {
    habits: Habit[];
}

export default function StatsScreen({ habits }: StatsScreenProps) {
    // 1. Filter out years from habits that actually have a date
    const yearsUsed = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [
            ...new Set(
                habits
                    .filter(h => h.date && h.date !== "")
                    .map(h => new Date(h.date!).getFullYear())
            )
        ];
        if (!years.includes(currentYear)) years.push(currentYear);
        return years.sort((a, b) => b - a);
    }, [habits]);

    const [selectedYear, setSelectedYear] = useState(yearsUsed[0]);

    // 2. Filter habits by selected year for all calculations
    const habitsInYear = useMemo(() => {
        return habits.filter(h => {
            if (!h.date || h.date === "") return false;
            return new Date(h.date).getFullYear() === selectedYear;
        });
    }, [habits, selectedYear]);

    const totalCommitments = habitsInYear.filter(h => h.completed).length;
    const totalMisses = habits.filter(h => !h.completed).length; // Total active habits not checked

    /* ---------------- STREAK ---------------- */
    const streak = useMemo(() => {
        const sorted = [...habits]
            .filter(h => h.completed && h.date)
            .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime());

        let count = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        for (const habit of sorted) {
            const habitDate = new Date(habit.date!);
            habitDate.setHours(0, 0, 0, 0);

            const diff = Math.floor((currentDate.getTime() - habitDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diff === 0 || diff === 1) {
                count++;
                currentDate = habitDate;
            } else { break; }
        }
        return count;
    }, [habits]);

    /* ---------------- PROGRESS CALCULATIONS ---------------- */
    const completionPercent = habits.length > 0
        ? Math.round((habits.filter(h => h.completed).length / habits.length) * 100)
        : 0;

    const [animatedProgress, setAnimatedProgress] = useState(0);
    useEffect(() => {
        setAnimatedProgress(0);
        const timeout = setTimeout(() => setAnimatedProgress(completionPercent), 200);
        return () => clearTimeout(timeout);
    }, [completionPercent]);

    /* ---------------- HABIT CATEGORY BAR (GitHub Style) ---------------- */
    const categoryPercentages = useMemo(() => {
        const counts: Record<string, number> = {};
        const completedInYear = habitsInYear.filter(h => h.completed);

        completedInYear.forEach(h => {
            counts[h.category] = (counts[h.category] || 0) + 1;
        });

        const total = completedInYear.length;
        const colors: Record<string, string> = {
            Health: "#4ade80",
            Education: "#60a5fa",
            Financial: "#facc15",
            Personal: "#fb7185"
        };

        return Object.entries(counts).map(([cat, count]) => ({
            category: cat,
            percent: total ? (count / total) * 100 : 0,
            color: colors[cat] || "#888"
        })).sort((a, b) => b.percent - a.percent);
    }, [habitsInYear]);

    /* ---------------- CONTRIBUTION GRID ---------------- */
    const daysInYear = (selectedYear % 4 === 0 && (selectedYear % 100 !== 0 || selectedYear % 400 === 0)) ? 366 : 365;

    return (
        <div className={styles.layout}>
            {/* CONTRIBUTION GRAPH */}
            <div className={styles.contributionArea}>
                <div className={styles.yearSelector}>
                    {yearsUsed.map(year => (
                        <span
                            key={year}
                            className={selectedYear === year ? styles.activeYear : styles.yearTab}
                            onClick={() => setSelectedYear(year)}
                        >
                            {year}
                        </span>
                    ))}
                </div>

                <div className={`${styles.card} ${styles.contributionCard}`}>
                    <span className={styles.contributionTitle}>
                        {totalCommitments} contributions in {selectedYear}
                    </span>

                    <div className={styles.grid}>
                        {Array.from({ length: daysInYear }).map((_, i) => {
                            const date = new Date(selectedYear, 0, i + 1);
                            const isoDate = date.toISOString().split('T')[0];
                            const isCompleted = habits.some(h => h.completed && h.date === isoDate);

                            return (
                                <div
                                    key={i}
                                    className={`${styles.cell} ${isCompleted ? styles.activeHigh : ""}`}
                                    title={isoDate}
                                />
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* MAIN STATS ROW */}
            <div className={styles.row}>
                {/* USER STATS */}
                <div className={styles.card}>
                    <h3 className={styles.title}>Yearly Overview</h3>
                    <div className={styles.statRow}><span>⭐ Achievements</span><strong>{Math.floor(totalCommitments / 5)}</strong></div>
                    <div className={styles.statRow}><span>⏱ Commitments</span><strong>{totalCommitments}</strong></div>
                    <div className={styles.statRow}><span>❌ Misses</span><strong>{totalMisses}</strong></div>
                    <div className={styles.statRow}><span>📋 Total Habits</span><strong>{habits.length}</strong></div>
                    <div className={styles.statRow}><span>🔥 Streak</span><strong>{streak} days</strong></div>
                </div>

                {/* HABITS TRACKED / GITHUB STYLE BAR */}
                <div className={styles.card}>
                    <h3 className={styles.title}>Most Practiced Categories</h3>

                    <div className={styles.langBar}>
                        {categoryPercentages.map((c) => (
                            <div
                                key={c.category}
                                className={styles.langSegment}
                                style={{
                                    width: `${c.percent}%`,
                                    background: c.color
                                }}
                            />
                        ))}
                    </div>

                    <div className={styles.langLegend}>
                        {categoryPercentages.length > 0 ? categoryPercentages.map((c) => (
                            <div key={c.category} className={styles.langItem}>
                                <span className={styles.langDot} style={{ background: c.color }} />
                                <span className={styles.catText}>{c.category}</span>
                                <span className={styles.percentText}>{c.percent.toFixed(1)}%</span>
                            </div>
                        )) : <div className={styles.emptyText}>No data for this year</div>}
                    </div>
                </div>

                {/* PROMISE COMPLETION RING */}
                <div className={`${styles.card} ${styles.promiseCard}`}>
                    <h3 className={styles.title}>Promise Success</h3>
                    <div className={styles.progressRingWrapper}>
                        <svg width="120" height="120">
                            <circle className={styles.progressRingBg} strokeWidth="8" r="48" cx="60" cy="60" />
                            <circle
                                className={styles.progressRing}
                                strokeWidth="8"
                                r="48"
                                cx="60"
                                cy="60"
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