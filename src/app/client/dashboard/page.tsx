'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { Property } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './dashboard.module.css';

export default function ClientDashboard() {
    const { user, isLoading, logout } = useAuth();
    const { t } = useLanguage();
    const [properties, setProperties] = useState<Property[]>([]);
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        // If not logged in redirect
        if (!isLoading && !user) {
            router.push('/client/login');
        }

        async function loadProperties() {
            if (!user) return;
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('owner_id', user.id)
                .order('updated_at', { ascending: false });

            if (!error && data) {
                const mapped = data.map(d => ({
                    id: d.id,
                    ownerId: d.owner_id,
                    name: d.name,
                    status: d.status,
                    currentStep: d.current_step,
                    totalSteps: d.total_steps,
                    progress: d.progress,
                    updatedAt: d.updated_at,
                    data: d.data
                } as Property));
                setProperties(mapped);
            }
        }

        loadProperties();
    }, [user, isLoading, router]);

    const handleCreateNew = async () => {
        if (!user) return;

        // Create new property in DB
        const { data, error } = await supabase.from('properties').insert({
            owner_id: user.id,
            name: 'New Property',
            status: 'draft',
            current_step: 1,
            total_steps: 7,
            progress: 0,
            data: {}
        }).select().single();

        if (error) {
            console.error('Error creating property:', error);
            return;
        }

        if (data) {
            router.push(`/client/onboarding/${data.id}`);
        }
    };

    if (isLoading) return <div className={styles.loading}>Loading...</div>;

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <div>
                    <div style={{ marginBottom: '1rem' }}>
                        <Image
                            src="/logo.png"
                            alt="Premium Booking Connect"
                            width={160}
                            height={50}
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                    <h1 className={styles.title}>{t('dash.welcome')}, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}</h1>
                    <p className={styles.subtitle}>{t('dash.subtitle')}</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button onClick={handleCreateNew}>
                        {t('dash.new_prop')}
                    </Button>
                    <Link href="/client/profile">
                        <Button variant="outline">
                            {t('dash.profile')}
                        </Button>
                    </Link>
                    <Button variant="secondary" onClick={logout}>
                        {t('dash.signout')}
                    </Button>
                </div>
            </header>

            <div className={styles.grid}>
                {properties.length === 0 ? (
                    <div className={styles.emptyState}>
                        <p>{t('dash.empty')}</p>
                        <Button variant="secondary" onClick={handleCreateNew}>
                            {t('dash.start_onboarding')}
                        </Button>
                    </div>
                ) : (
                    properties.map(prop => (
                        <div key={prop.id} className={styles.card}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.propName}>
                                    {prop.data.info?.propertyName || prop.name}
                                </h3>
                                <span className={`${styles.badge} ${styles[prop.status]}`}>
                                    {prop.status === 'draft' ? t('dash.in_progress') : t('dash.completed')}
                                </span>
                            </div>

                            <div className={styles.progressContainer}>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${prop.progress}%` }}
                                    />
                                </div>
                                <span className={styles.progressText}>{Math.round(prop.progress)}% {t('dash.completed')}</span>
                            </div>

                            <div className={styles.cardFooter}>
                                <p className={styles.lastUpdated}>
                                    {t('dash.last_updated')} {new Date(prop.updatedAt).toLocaleDateString()}
                                </p>
                                <Link href={`/client/onboarding/${prop.id}`}>
                                    <Button variant="outline" className={styles.resumeBtn}>
                                        {prop.status === 'draft' ? t('dash.continue') : t('dash.view_details')}
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
