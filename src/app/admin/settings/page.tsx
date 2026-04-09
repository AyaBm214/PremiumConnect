'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import styles from './settings.module.css';

export default function SettingsPage() {
    const { updatePassword, isLoading } = useAuth();
    const { t } = useLanguage();
    
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: t('admin.settings.mismatch') });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: t('signup.pass_short') });
            return;
        }

        try {
            await updatePassword(newPassword);
            setMessage({ type: 'success', text: t('admin.settings.success') });
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error('Error updating password:', error);
            setMessage({ type: 'error', text: t('admin.settings.error') });
        }
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>{t('admin.settings.title')}</h1>
            
            <div className={styles.card}>
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>
                        <span>🔑</span> {t('admin.settings.password_section')}
                    </h2>
                    
                    {message && (
                        <div className={message.type === 'success' ? styles.successMessage : styles.errorMessage}>
                            {message.type === 'success' ? '✅' : '❌'} {message.text}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={styles.form}>
                        <Input
                            label={t('admin.settings.new_password')}
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        <Input
                            label={t('admin.settings.confirm_password')}
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                        <div style={{ marginTop: '1rem' }}>
                            <Button 
                                type="submit" 
                                variant="primary" 
                                disabled={isLoading || !newPassword || !confirmPassword}
                                style={{ backgroundColor: '#0A2540' }}
                            >
                                {isLoading ? '...' : t('admin.settings.update_btn')}
                            </Button>
                        </div>
                    </form>
                </section>
            </div>
        </div>
    );
}
