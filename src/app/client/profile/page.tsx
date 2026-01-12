'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileUploader } from '@/components/ui/FileUploader';
import { UserProfile } from '@/lib/types';
import { useLanguage } from '@/lib/LanguageContext';
import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';

export default function ProfilePage() {
    const { t } = useLanguage();
    const router = useRouter();
    const supabase = createClient();
    const [profile, setProfile] = useState<Partial<UserProfile>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [bankingType, setBankingType] = useState<'canada' | 'intl'>('canada');

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                // Try fetch existing profile
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (data) {
                    setProfile(data);
                } else {
                    // Initialize with email
                    setProfile({
                        id: user.id,
                        email: user.email || '',
                        documents: {
                            identity_proof: '',
                            void_cheque: '',
                            insurance_proof: '',
                            citq_certificate: '',
                            tax_confirmation: false
                        }
                    });
                }
            }
            setLoading(false);
        };
        fetchProfile();
    }, []);

    const handleChange = (field: keyof UserProfile, value: any) => {
        setProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleDocUpload = async (files: File[], docName: keyof UserProfile['documents']) => {
        if (!files.length || !profile.id) return;
        setUploading(true);
        try {
            const file = files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${docName}_${Date.now()}.${fileExt}`;
            const filePath = `${profile.id}/documents/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('user_docs') // Assuming 'user_docs' bucket or 'documents'
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('user_docs')
                .getPublicUrl(filePath);

            setProfile(prev => ({
                ...prev,
                documents: {
                    ...prev.documents!,
                    [docName]: publicUrl
                }
            }));
        } catch (error) {
            console.error(error);
            alert('Upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .upsert(profile);

            if (error) throw error;
            alert('Profile saved successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to save profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '2rem auto', padding: '2rem' }}>
            <div style={{ marginBottom: '1rem' }}>
                <Button
                    variant="ghost"
                    onClick={() => router.push('/client/dashboard')}
                    style={{ paddingLeft: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary, #666)' }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    {t('profile.back')}
                </Button>
            </div>
            <h1>{t('profile.title')}</h1>
            <p>{t('profile.subtitle')}</p>

            <div style={{ display: 'grid', gap: '1rem', marginTop: '2rem' }}>
                <Input label={t('profile.full_name')} value={profile.full_name || ''} onChange={e => handleChange('full_name', e.target.value)} />
                <Input label="Email" value={profile.email || ''} disabled onChange={() => { }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-main)' }}>{t('profile.phone')}</label>
                    <PhoneInput
                        placeholder={t('profile.phone')}
                        value={profile.phone_number}
                        onChange={(value) => handleChange('phone_number', value)}
                        defaultCountry="CA"
                    />
                </div>

                <Input label={t('profile.business')} value={profile.business_number || ''} onChange={e => handleChange('business_number', e.target.value)} />
            </div>

            <h3 style={{ marginTop: '2rem' }}>{t('profile.legal')}</h3>
            <div style={{ display: 'grid', gap: '1rem' }}>
                <FileUploader
                    label={t('profile.identity')}
                    onChange={files => handleDocUpload(files, 'identity_proof')}
                    description={profile.documents?.identity_proof ? `✓ ${t('profile.uploaded')}` : ''}
                />
                <div style={{ border: '1px solid var(--border-color, #e0e0e0)', borderRadius: '8px', padding: '1.5rem' }}>
                    <h4 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-main)' }}>{t('profile.banking.title')}</h4>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <Button
                            variant={bankingType === 'canada' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setBankingType('canada')}
                        >
                            {t('profile.banking.canada')}
                        </Button>
                        <Button
                            variant={bankingType === 'intl' ? 'primary' : 'outline'}
                            size="sm"
                            onClick={() => setBankingType('intl')}
                        >
                            {t('profile.banking.intl')}
                        </Button>
                    </div>

                    <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary, #f9f9f9)', borderRadius: '6px' }}>
                        <p style={{ margin: 0, fontWeight: 500, color: 'var(--text-main)' }}>
                            {bankingType === 'canada' ? t('profile.banking.canada_instr') : t('profile.banking.intl_instr')}
                        </p>
                        <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                            {t('profile.banking.email_note')}
                        </p>
                    </div>
                </div>
                <FileUploader
                    label={t('profile.insurance')}
                    onChange={files => handleDocUpload(files, 'insurance_proof')}
                    description={profile.documents?.insurance_proof ? `✓ ${t('profile.uploaded')}` : ''}
                />

                <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem' }}>
                    <input
                        type="checkbox"
                        checked={profile.documents?.tax_confirmation || false}
                        onChange={e => setProfile(prev => ({
                            ...prev,
                            documents: { ...prev.documents!, tax_confirmation: e.target.checked }
                        }))}
                    />
                    {t('profile.tax_confirm')}
                </label>
            </div>

            <Button onClick={handleSave} size="lg" disabled={saving || uploading} style={{ marginTop: '2rem' }}>
                {saving ? t('profile.saving') : t('profile.save')}
            </Button>
        </div>
    );
}
