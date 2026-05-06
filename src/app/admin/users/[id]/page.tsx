'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/LanguageContext';
import styles from '../user-detail.module.css';
import { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/Button';

export default function UserDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t, language } = useLanguage();
    const supabase = createClient();
    
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();

            if (data) {
                setUser(data);
            }
            setLoading(false);
        };
        fetchUser();
    }, [id]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);
        try {
            // Explicitly prepare payload to avoid sending unwanted fields
            const payload = {
                full_name: user.full_name,
                phone_number: user.phone_number,
                business_number: user.business_number,
                second_contact: user.second_contact,
                additional_data: user.additional_data,
                meeting_url_1: user.meeting_url_1 || null,
                meeting_url_2: user.meeting_url_2 || null,
                meeting_url_3: user.meeting_url_3 || null
            };
            
            console.log("Attempting to save user:", user.id, payload);
            
            const { error, data: updateData } = await supabase
                .from('profiles')
                .update(payload)
                .eq('id', user.id)
                .select();

            if (error) {
                console.error("Update Error:", error);
                alert(`Error saving: ${error.message}`);
                return;
            }
            
            if (updateData && updateData.length > 0) {
                setUser(updateData[0]);
                alert(language === 'fr' ? "Enregistrement réussi !" : "Save successful!");
            } else {
                console.warn("No rows updated. Possible RLS issue or ID mismatch.", { id: user.id });
                alert(language === 'fr' 
                    ? "L'enregistrement a réussi mais aucune donnée n'a été modifiée. Veuillez vérifier les permissions." 
                    : "Update completed but no rows were changed. Please check database permissions (RLS).");
            }

            setIsEditing(false);
        } catch (error: any) {
            console.error("Unexpected Error in handleSave:", error);
            alert('Error: ' + (error.message || 'Check console'));
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (field: string, value: any) => {
        setUser(prev => {
            if (!prev) return null;
            return { ...prev, [field]: value };
        });
    };

    const handleNestedChange = (parent: string, field: string, value: any) => {
        setUser(prev => {
            if (!prev) return null;
            const parentData = (prev as any)[parent] || {};
            return {
                ...prev,
                [parent]: {
                    ...parentData,
                    [field]: value
                }
            };
        });
    };

    if (loading) return <div className={styles.container}>Loading...</div>;
    if (!user) return <div className={styles.container}>User not found</div>;

    const initials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <Button variant="ghost" onClick={() => router.back()} style={{ gap: '0.5rem' }}>
                    ← {t('admin.details.back')}
                </Button>
                <div className={styles.actions}>
                    <Button variant="outline" onClick={() => router.push(`/client/dashboard?uid=${user.id}`)}>
                        📊 {t('admin.user.dashboard')}
                    </Button>
                    <Button variant="outline" onClick={() => alert('Exporting...')}>
                        📤 {t('admin.user.export')}
                    </Button>
                    {!isEditing ? (
                        <Button onClick={() => setIsEditing(true)}>
                            ✏️ {t('admin.user.modify')}
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={() => setIsEditing(false)}>
                            {t('admin.details.cancel')}
                        </Button>
                    )}
                </div>
            </div>

            <div className={styles.grid}>
                {/* Profile Card */}
                <div className={`${styles.card} ${styles.profileCard}`}>
                    <div className={styles.avatarWrapper}>
                        <div className={styles.avatar} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 700, color: '#1a2b4b' }}>
                            {initials}
                        </div>
                        <div className={`${styles.statusBadge} ${styles.statusActive}`}>
                            {t('admin.user.status.active')}
                        </div>
                    </div>
                    <div className={styles.userInfo}>
                        {isEditing ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <input 
                                    className={styles.input} 
                                    value={user.full_name || ''} 
                                    onChange={e => handleChange('full_name', e.target.value)}
                                    placeholder="Full Name"
                                />
                                <input 
                                    className={styles.input} 
                                    value={user.phone_number || ''} 
                                    onChange={e => handleChange('phone_number', e.target.value)}
                                    placeholder="Phone"
                                />
                                <input 
                                    className={styles.input} 
                                    value={user.business_number || ''} 
                                    onChange={e => handleChange('business_number', e.target.value)}
                                    placeholder="Business Number"
                                />
                            </div>
                        ) : (
                            <>
                                <h2>{user.full_name || 'N/A'}</h2>
                                <div className={styles.userDetails}>
                                    <div className={styles.detailItem}>📧 {user.email}</div>
                                    <div className={styles.detailItem}>📞 {user.phone_number || '-'}</div>
                                    <div className={styles.detailItem}>🏢 Business: {user.business_number || '-'}</div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Second Contact Card */}
                <div className={`${styles.card} ${styles.smallCard}`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitle}>
                            <div className={`${styles.iconWrapper} ${styles.contactIcon}`}>👤</div>
                            {t('admin.user.card.contact')}
                        </div>
                    </div>
                    
                    <div className={styles.contactBox}>
                        <div className={styles.miniAvatar}>
                            {user.second_contact?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'SC'}
                        </div>
                        <div className={styles.contactInfo}>
                            {isEditing ? (
                                <input 
                                    className={styles.input} 
                                    placeholder="Name" 
                                    value={user.second_contact?.full_name || ''} 
                                    onChange={e => handleNestedChange('second_contact', 'full_name', e.target.value)}
                                />
                            ) : (
                                <h4>{user.second_contact?.full_name || 'No contact set'}</h4>
                            )}
                            <p>{user.second_contact?.relationship || 'Secondary Contact'}</p>
                        </div>
                    </div>

                    <div className={styles.contactField}>
                        <span className={styles.label}>{t('admin.users.table.phone')}</span>
                        {isEditing ? (
                            <input 
                                className={styles.input} 
                                value={user.second_contact?.phone || ''} 
                                onChange={e => handleNestedChange('second_contact', 'phone', e.target.value)}
                                style={{ width: '60%' }}
                            />
                        ) : (
                            <span className={styles.value}>{user.second_contact?.phone || '-'}</span>
                        )}
                    </div>
                    <div className={styles.contactField}>
                        <span className={styles.label}>{t('admin.users.table.email')}</span>
                        {isEditing ? (
                            <input 
                                className={styles.input} 
                                value={user.second_contact?.email || ''} 
                                onChange={e => handleNestedChange('second_contact', 'email', e.target.value)}
                                style={{ width: '60%' }}
                            />
                        ) : (
                            <span className={styles.value}>{user.second_contact?.email || '-'}</span>
                        )}
                    </div>
                </div>



                {/* Meetings Card */}
                <div className={`${styles.card} ${styles.smallCard}`}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitle}>
                            <div className={`${styles.iconWrapper} ${styles.meetingIcon}`}>📹</div>
                            {t('admin.user.card.meetings') || 'Réunions Planifiées'}
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {[1, 2, 3].map(num => (
                            <div key={num} className={styles.meetingField}>
                                <label className={styles.apiKeyLabel}>URL LOOM {num}</label>
                                {isEditing ? (
                                    <input 
                                        className={styles.input} 
                                        placeholder="https://www.loom.com/share/..." 
                                        value={(user as any)[`meeting_url_${num}`] || ''} 
                                        onChange={e => handleChange(`meeting_url_${num}`, e.target.value)}
                                    />
                                ) : (
                                    <div className={styles.apiKeyValue} style={{ background: '#f8fafc', color: '#1e293b', border: '1px solid #e2e8f0' }}>
                                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {(user as any)[`meeting_url_${num}`] || 'No URL set'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Additional Data Card */}
                <div className={`${styles.card}`} style={{ gridColumn: 'span 12' }}>
                    <div className={styles.cardHeader}>
                        <div className={styles.cardTitle}>
                            <div className={`${styles.iconWrapper} ${styles.extraIcon}`}>📝</div>
                            {t('admin.user.card.extra')}
                        </div>
                    </div>

                    {isEditing ? (
                        <textarea 
                            className={styles.textarea} 
                            value={user.additional_data || ''} 
                            onChange={e => handleChange('additional_data', e.target.value)}
                            placeholder="Store other data here..."
                        />
                    ) : (
                        <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', minHeight: '100px', whiteSpace: 'pre-wrap' }}>
                            {user.additional_data || 'No additional data stored.'}
                        </div>
                    )}
                </div>
            </div>

            {isEditing && (
                <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button size="lg" onClick={handleSave} disabled={saving}>
                        {saving ? 'Saving...' : t('admin.details.save')}
                    </Button>
                </div>
            )}
        </div>
    );
}
