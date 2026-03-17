import { useState } from 'react';
import styles from './AccountDrawer.module.css';
import { supabase } from '../../supabaseClient'; // Ensure path is correct

interface AccountDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    setUser: (user: any) => void;
    localData: any;
    setters: any;
}

export default function AccountDrawer({ isOpen, onClose, user, setUser, localData, setters }: AccountDrawerProps) {
    const [isLoginView, setIsLoginView] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    /* --- THE SYNC LOGIC --- */

    // 1. PUSH local data to Cloud (Used on Signup)
    const syncLocalToCloud = async (userId: string) => {
        const { habits, plans, notes, wallet } = localData;

        // Helper to add user_id to local objects
        const prepare = (arr: any[]) => arr.map(item => ({ ...item, user_id: userId }));

        if (habits.length) await supabase.from('habits').insert(prepare(habits));
        if (plans.length) await supabase.from('plans').insert(prepare(plans));
        if (notes.length) await supabase.from('notes').insert(prepare(notes));
        if (wallet) await supabase.from('wallet').upsert({ ...wallet, user_id: userId });
    };

    // 2. PULL cloud data to Local (Used on Login)
    const syncCloudToLocal = async (userId: string) => {
        const { data: n } = await supabase.from('notes').select('*').eq('user_id', userId);
        const { data: h } = await supabase.from('habits').select('*').eq('user_id', userId);
        const { data: p } = await supabase.from('plans').select('*').eq('user_id', userId);

        if (n) setters.setNotes(n);
        if (h) setters.setHabits(h);
        if (p) setters.setPlans(p);
        // Add others (wallet, goals) similarly
    };

    /* --- AUTH HANDLERS --- */

    const handleAuth = async () => {
        setLoading(true);
        if (isLoginView) {
            // LOGIN
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) alert(error.message);
            else if (data.user) {
                await syncCloudToLocal(data.user.id);
                setUser(data.user);
                onClose();
            }
        } else {
            // SIGN UP
            const { data, error } = await supabase.auth.signUp({ email, password });
            if (error) alert(error.message);
            else if (data.user) {
                await syncLocalToCloud(data.user.id);
                setUser(data.user);
                alert("Account created! Local data synced to cloud.");
                onClose();
            }
        }
        setLoading(false);
    };

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({ provider: 'google' });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setUser(null);
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