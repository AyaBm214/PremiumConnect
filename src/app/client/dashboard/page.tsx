'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';
import { Property } from '@/lib/types';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import OnboardingTimeline from '@/components/OnboardingTimeline';
import HostawayHeaderItem from '@/components/HostawayRequest/HostawayHeaderItem';
import styles from './dashboard.module.css';

function DashboardContent() {
    const { user, isLoading, logout } = useAuth();
    const { t } = useLanguage();
    const [properties, setProperties] = useState<Property[]>([]);
    const [viewingUser, setViewingUser] = useState<{ id: string, name: string } | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const targetUid = searchParams.get('uid');
    const isAdmin = user?.user_metadata?.type === 'admin';
    const effectiveUid = (isAdmin && targetUid) ? targetUid : user?.id;

    useEffect(() => {
        // If not logged in redirect, but wait for a small window to ensure session is picked up
        if (!isLoading && !user) {
            const timer = setTimeout(() => {
                if (!user) router.push('/client/login');
            }, 500);
            return () => clearTimeout(timer);
        }

        async function loadData() {
            if (!user) return;
            
            // If admin viewing someone else, fetch their profile name
            if (isAdmin && targetUid) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', targetUid)
                    .single();
                if (profile) {
                    setViewingUser({ id: targetUid, name: profile.full_name });
                }
            } else {
                setViewingUser(null);
            }

            if (!effectiveUid) return;

            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('owner_id', effectiveUid)
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
                    onboardingPhase: d.onboarding_phase || 1,
                    updatedAt: d.updated_at,
                    data: d.data
                } as Property));
                setProperties(mapped);
            }
        }

        loadData();
    }, [user, isLoading, router, effectiveUid, isAdmin, targetUid, supabase]);

    const handleCreateNew = async () => {
        if (!effectiveUid) return;

        // Create new property in DB
        const { data, error } = await supabase.from('properties').insert({
            owner_id: effectiveUid,
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
            {/* Hero Section */}
            <section className={styles.heroSection}>
                <div className={styles.heroMain}>
                    <div className={styles.logoWrapper}>
                        <Image
                            src="/logo.png"
                            alt="Premium Booking Connect"
                            width={180}
                            height={56}
                            style={{ objectFit: 'contain' }}
                        />
                    </div>
                    <h1 className={styles.title}>
                        {t('dash.welcome')}, {viewingUser ? viewingUser.name : (user?.user_metadata?.full_name || user?.email?.split('@')[0])}
                    </h1>
                    <p className={styles.subtitle}>{t('dash.subtitle')}</p>
                    
                    {isAdmin && targetUid && (
                        <div style={{
                            backgroundColor: '#fff7ed',
                            border: '1px solid #ffedd5',
                            padding: '10px 16px',
                            borderRadius: '12px',
                            marginTop: '16px',
                            color: '#9a3412',
                            fontSize: '0.95rem',
                            fontWeight: 600,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <span>🛠️</span> Mode Admin : Vous visualisez et gérez le compte de <strong>{viewingUser?.name || '...'}</strong>
                        </div>
                    )}

                    <div className={styles.actionRow}>
                        <Button onClick={handleCreateNew} size="lg">
                            <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>+</span> {t('dash.new_prop')}
                        </Button>
                        <Link href="/client/profile">
                            <Button variant="outline" size="lg">
                                {t('dash.profile')}
                            </Button>
                        </Link>
                        <Button variant="secondary" onClick={logout} size="lg">
                            {t('dash.signout')}
                        </Button>
                    </div>
                </div>

                <div className={styles.heroSide}>
                    <HostawayHeaderItem />
                </div>
            </section>

            {/* Journey Section */}
            <h2 className={styles.sectionTitle}>
                <span>1</span> {t('onboarding.journey.title') || 'Votre parcours de mise en service'}
            </h2>
            <div className={styles.onboardingWrapper}>
                <OnboardingTimeline 
                    clientName={user?.user_metadata?.full_name?.split(' ')[0]} 
                    onboardingPhase={properties[0]?.onboardingPhase || 1}
                />
            </div>

            {/* Properties Section */}
            <h2 className={styles.sectionTitle}>
                <span>2</span> {t('dash.your_properties') || 'Vos propriétés'}
            </h2>
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
                                <span className={`${styles.badge} ${styles[prop.progress === 100 ? 'active' : 'pending_review']}`}>
                                    {prop.progress === 100 ? t('dash.completed') : t('dash.in_progress')}
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

export default function ClientDashboard() {
    return (
        <Suspense fallback={<div className={styles.loading}>Loading...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
