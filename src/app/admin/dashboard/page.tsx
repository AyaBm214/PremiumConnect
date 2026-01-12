'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Property } from '@/lib/types';
import styles from './dashboard.module.css';

export default function AdminDashboardPage() {
    const supabase = createClient();
    const [stats, setStats] = useState({
        totalProperties: 0,
        totalClients: 0,
        activeOnboardings: 0,
        completed: 0
    });

    useEffect(() => {
        async function loadStats() {
            // Note: This query depends on RLS policies allowing the user to see all properties.
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
            <h1 className={styles.title}>Dashboard Overview</h1>

            <div className={styles.statsGrid}>
                <StatCard title="Total Properties" value={stats.totalProperties} icon="🏠" />
                <StatCard title="Total Clients" value={stats.totalClients} icon="👥" />
                <StatCard title="Active Onboardings" value={stats.activeOnboardings} icon="⏳" />
                <StatCard title="Completed" value={stats.completed} icon="✅" />
            </div>

            <div className={styles.section}>
                <h2 className={styles.subtitle}>Recent Activity</h2>
                <div className={styles.newsFeed}>
                    <p className={styles.placeholder}>No recent activity to show.</p>
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
