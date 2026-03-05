'use client';
import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Property } from '@/lib/types';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { downloadRemoteFile } from '@/lib/pdf';
import { Input } from '@/components/ui/Input';
import styles from './properties.module.css';

import { useLanguage } from '@/lib/LanguageContext';

export default function AdminPropertiesPage() {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const supabase = createClient();
    const router = useRouter();
    const { t } = useLanguage();

    useEffect(() => {
        const fetchProperties = async () => {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .order('updated_at', { ascending: false });

            if (error) {
                console.error('Error fetching properties:', error);
            } else if (data) {
                const mapped: Property[] = data.map(p => ({
                    id: p.id,
                    ownerId: p.owner_id,
                    name: p.name || 'Untitled',
                    status: p.status,
                    currentStep: p.current_step,
                    totalSteps: p.total_steps,
                    progress: p.progress,
                    data: p.data,
                    updatedAt: p.updated_at
                }));
                setProperties(mapped);
            }
            setLoading(false);
        };

        fetchProperties();
    }, []);

    const filtered = properties.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.data.info?.propertyName?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div>
            <header className={styles.header}>
                <h1 className={styles.title}>{t('admin.props.title')}</h1>
                <div style={{ width: 300 }}>
                    <Input
                        placeholder={t('admin.props.search')}
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </header>

            <div className={styles.tableCard}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Property</th>
                            <th>Owner ID</th>
                            <th>Status</th>
                            <th>Progress</th>
                            <th>Last Updated</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length === 0 ? (
                            <tr><td colSpan={6} className={styles.empty}>No properties found</td></tr>
                        ) : (
                            filtered.map(prop => (
                                <tr key={prop.id}>
                                    <td>
                                        <div className={styles.propCell}>
                                            <span className={styles.propName}>{prop.data.info?.propertyName || 'Untitled Property'}</span>
                                            <span className={styles.propId}>#{prop.id.substr(0, 6)}</span>
                                        </div>
                                    </td>
                                    <td>{prop.ownerId}</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[prop.status]}`}>
                                            {prop.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.progressBar}>
                                            <div className={styles.progressFill} style={{ width: `${prop.progress}%` }} />
                                        </div>
                                    </td>
                                    <td>{new Date(prop.updatedAt).toLocaleDateString()}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Link href={`/admin/properties/${prop.id}`}>
                                                <Button size="sm" variant="outline">{t('admin.props.view')}</Button>
                                            </Link>
                                            <button
                                                onClick={() => router.push(`/client/onboarding/${prop.id}?fromAdmin=true`)}
                                                style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '6px',
                                                    border: '1px solid #d1d9e6',
                                                    backgroundColor: '#f0f4f8',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 600,
                                                    color: '#1a2b4b',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                title="Modifier comme le client"
                                            >
                                                <span style={{ fontSize: '1rem' }}>🎨</span> {t('admin.details.edit')}
                                            </button>
                                            {prop.data.info?.citqFile && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    style={{ color: '#007bff', borderColor: '#007bff', padding: '0 8px' }}
                                                    title={t('admin.details.download_citq')}
                                                    onClick={() => {
                                                        if (prop.data.info?.citqFile) {
                                                            const safeName = (prop.data.info.propertyName || prop.id).replace(/[^a-z0-9]/gi, '_').toLowerCase();
                                                            downloadRemoteFile(prop.data.info.citqFile, `CITQ_${safeName}.pdf`);
                                                        }
                                                    }}
                                                >
                                                    CITQ 📄
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
