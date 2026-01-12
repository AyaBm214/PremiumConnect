'use client';
import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import Image from 'next/image';
import styles from './auth.module.css';

export default function LoginPage() {
    const { login, isLoading } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            alert(t('login.password_req'));
            return;
        }
        try {
            await login(email, password);
        } catch (error) {
            console.error(error);
            alert(t('login.error'));
        }
    };

    return (
        <main className={styles.container}>
            <div className={styles.authCard}>
                <div className={styles.header}>
                    <div className={styles.logo}>
                        <Image
                            src="/logo.png"
                            alt="Premium Booking Connect"
                            width={180}
                            height={60}
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                    <button
                        className={styles.langToggle}
                        onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
                    >
                        {language === 'fr' ? 'FR' : 'EN'}
                    </button>
                </div>

                <h1 className={styles.title}>
                    {t('login.title')}
                </h1>
                <p className={styles.subtitle}>
                    {t('login.subtitle')}
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        label={t('login.email')}
                        type="email"
                        placeholder="exemple@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                    <Input
                        label={t('login.password')}
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        autoComplete="current-password"
                    />

                    <Button
                        variant="primary"
                        fullWidth
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? '...' : t('login.button')}
                    </Button>
                </form>

                <div className={styles.footer}>
                    {t('login.no_account')}
                    {' '}
                    <Link href="/client/signup" className={styles.link}>
                        {t('login.signup')}
                    </Link>
                </div>
            </div>
        </main>
    );
}
