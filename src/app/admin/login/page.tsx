'use client';
import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from '@/app/client/login/auth.module.css'; // Reusing auth styles

export default function AdminLoginPage() {
    const { login, isLoading } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
        } catch (error) {
            console.error(error);
            alert('Login failed');
        }
    };

    return (
        <main className={styles.container}>
            <div className={styles.authCard} style={{ borderTop: '4px solid #0A2540' }}>
                <div className={styles.header}>
                    <div className={styles.logo}>Premium Admin</div>
                </div>

                <h1 className={styles.title}>Admin Login</h1>
                <p className={styles.subtitle}>Secure access for staff only</p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        label="Email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />

                    <Button
                        variant="primary"
                        fullWidth
                        type="submit"
                        disabled={isLoading}
                        style={{ backgroundColor: '#0A2540' }}
                    >
                        {isLoading ? 'Authenticating...' : 'Login to Dashboard'}
                    </Button>
                </form>
            </div>
        </main>
    );
}
