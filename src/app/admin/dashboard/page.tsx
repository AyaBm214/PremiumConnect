'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Property } from '@/lib/types';
import styles from './dashboard.module.css';

import { useLanguage } from '@/lib/LanguageContext';

export default function AdminDashboardPage() {
    const supabase = createClient();
    const { t } = useLanguage();
    const [stats, setStats] = useState({
        totalProperties: 0,
        totalClients: 0,
        activeOnboardings: 0,
        completed: 0
    });

    useEffect(() => {
        async function loadStats() {
            const { data: allProps, error } = await supabase.from('properties').select('*');

            if (error || !allProps) {
                console.error('Error fetching admin stats:', error);
                return;
            }

            const uniqueClients = new Set(allProps.map(p => p.owner_id)).size;

            setStats({
                totalProperties: allProps.length,
                totalClients: uniqueClients,
                activeOnboardings: allProps.filter(p => p.status === 'draft').length,
                completed: allProps.filter(p => p.status !== 'draft').length
            });
        }
        loadStats();
    }, [supabase]);

    return (
        <div>
            <h1 className={styles.title}>{t('admin.dash.title')}</h1>

            <div className={styles.statsGrid}>
                <StatCard title={t('admin.dash.total_props')} value={stats.totalProperties} icon="🏠" />
                <StatCard title={t('admin.dash.total_clients')} value={stats.totalClients} icon="👥" />
                <StatCard title={t('admin.dash.active')} value={stats.activeOnboardings} icon="⏳" />
                <StatCard title={t('admin.dash.completed')} value={stats.completed} icon="✅" />
            </div>

            <div className={styles.section}>
                <h2 className={styles.subtitle}>{t('admin.dash.recent')}</h2>
                <div className={styles.newsFeed}>
                    <p className={styles.placeholder}>{t('admin.dash.no_activity')}</p>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, icon }: { title: string, value: number, icon: string }) {
    return (
        <div className={styles.statCard}>
            <div className={styles.statIcon}>{icon}</div>
            <div>
                <p className={styles.statTitle}>{title}</p>
                <p className={styles.statValue}>{value}</p>
            </div>
        </div>
    );
}
