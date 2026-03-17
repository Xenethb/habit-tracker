import { useState } from 'react';
import styles from './AccountDrawer.module.css';
import { supabase } from '../../supabaseClient';
import { User } from '@supabase/supabase-js';

interface AccountDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    setUser: (user: User | null) => void;
    localData: any;
    setters: any;
    onLogout: () => void; // Added this to match App.tsx
}

export default function AccountDrawer({
                                          isOpen,
                                          onClose,
                                          user,
                                          localData,
                                          onLogout
                                      }: AccountDrawerProps) {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    /* --- THE MIGRATION LOGIC (For New Signups) --- */

    // This pushes current local data to the cloud ONLY when a new account is created
    const migrateLocalDataToCloud = async (userId: string) => {
        console.log("📤 Migrating guest data to new account...");
        const { habits, plans, notes, wallet, completions, goals } = localData;

        const prepare = (arr: any[]) => arr.map(item => ({ ...item, user_id: userId }));

        if (habits.length) await supabase.from('habits').upsert(prepare(habits));
        if (plans.length) await supabase.from('plans').upsert(prepare(plans));
        if (notes.length) await supabase.from('notes').upsert(prepare(notes));
        if (completions.length) await supabase.from('completions').upsert(prepare(completions));
        if (goals.length) await supabase.from('goals').upsert(prepare(goals));
        if (wallet) await supabase.from('wallet').upsert({ ...wallet, user_id: userId });
    };

    /* --- AUTH HANDLERS --- */

    const handleAuth = async () => {
        setLoading(true);
        if (isLoginView) {
            // LOGIN: We don't need to manually sync here anymore!
            // App.tsx's Auth Listener will detect the login and run fetchUserData automatically.
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) alert(error.message);
            else onClose();
        } else {
            // SIGN UP
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) alert(error.message);
            else if (data.user) {
                // If they have local data, push it to their new cloud account
                await migrateLocalDataToCloud(data.user.id);
                alert("Account created! Your data is now synced to the cloud.");
                onClose();
            }
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) console.error("Logout error:", error.message);

        // App.tsx's Auth Listener handles the rest, but we call this
        // as a backup to ensure state is wiped immediately.
        onLogout();
        onClose();
    };

    return (
        <>
            <div className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`} onClick={onClose} />
            <div className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ''}`}>
                <div className={styles.header}>
                    <h2>Account</h2>
                    <button className={styles.closeBtn} onClick={onClose}>✕</button>
                </div>

                {user ? (
                    <div className={styles.userInfo}>
                        <div className={styles.avatar}>{user.email?.[0].toUpperCase()}</div>
                        <h3>Welcome back!</h3>
                        <p className={styles.email}>{user.email}</p>
                        <div className={styles.statsCard}>
                            <span>Member Since:</span>
                            <span className={styles.date}>{new Date(user.created_at).toLocaleDateString()}</span>
                        </div>
                        <button className={styles.logoutBtn} onClick={handleLogout}>Log Out</button>
                    </div>
                ) : (
                    <div className={styles.authContainer}>
                        <h3>{isLoginView ? 'Sign In' : 'Create Account'}</h3>
                        <input className={styles.input} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        <input className={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />

                        <button className={styles.mainAuthBtn} onClick={handleAuth} disabled={loading}>
                            {loading ? 'Processing...' : (isLoginView ? 'Login' : 'Sign Up')}
                        </button>

                        <div className={styles.divider}>OR</div>

                        <button className={styles.socialBtn} onClick={handleGoogleLogin}>Sign in with Google</button>

                        <p className={styles.switchText} onClick={() => setIsLoginView(!isLoginView)}>
                            {isLoginView ? "Don't have an account? Sign up" : "Already have an account? Login"}
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}