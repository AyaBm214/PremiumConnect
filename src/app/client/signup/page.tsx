'use client';
import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import Link from 'next/link';
import Image from 'next/image';
import styles from '../login/auth.module.css'; // Reuse styles

export default function SignupPage() {
    const { signup, isLoading } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            alert(t('signup.pass_mismatch'));
            return;
        }
        try {
            await signup(formData.email, formData.password, formData.name);
        } catch (error) {
            console.error(error);
            alert(formData.password.length < 6 ? t('signup.pass_short') : t('signup.error'));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
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
                    {t('signup.title')}
                </h1>
                <p className={styles.subtitle}>
                    {t('signup.subtitle')}
                </p>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <Input
                        name="name"
                        label={t('signup.name')}
                        type="text"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        name="email"
                        label={t('login.email')}
                        type="email"
                        placeholder="exemple@email.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        autoComplete="email"
                    />
                    <Input
                        name="password"
                        label={t('login.password')}
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                    />
                    <Input
                        name="confirmPassword"
                        label={t('signup.confirm')}
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                    />

                    <Button
                        variant="primary"
                        fullWidth
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? '...' : t('signup.title')}
                    </Button>
                </form>

                <div className={styles.footer}>
                    {t('signup.have_account')}
                    {' '}
                    <Link href="/client/login" className={styles.link}>
                        {t('signup.signin')}
                    </Link>
                </div>
            </div>
        </main>
    );
}
