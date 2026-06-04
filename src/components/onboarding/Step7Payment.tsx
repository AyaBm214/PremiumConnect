import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileUploader } from '@/components/ui/FileUploader';
import { Property } from '@/lib/types';
import { useRouter } from 'next/navigation';
import styles from './Step.module.css';
import { useLanguage } from '@/lib/LanguageContext';
import { createClient } from '@/lib/supabase/client';

interface Step7Props {
    propertyId: string;
    propertyName: string;
    data?: Property['data']['payment'];
    onUpdate: (data: any) => void;
    onNext: () => void; // Actually finish
    onBack: () => void;
}

export default function Step7Payment({ propertyId, propertyName, data, onUpdate, onNext, onBack }: Step7Props) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState(data || {});
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleChange = (field: string, value: any) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        onUpdate(updated);
    };

    const handleFileUpload = async (files: File[], field: 'voidedChequeFile') => {
        if (!files.length) return;
        setUploading(true);
        try {
            const file = files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${field}_${Date.now()}.${fileExt}`;
            const filePath = `${propertyId}/documents/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('properties')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('properties')
                .getPublicUrl(filePath);

            handleChange(field, publicUrl);
        } catch (error) {
            console.error('File upload failed', error);
            alert('File upload failed');
        } finally {
            setUploading(false);
        }
    };

    const handleFinish = async () => {
        setSubmitting(true);
        // Save current form state
        onUpdate({ ...formData });

        try {
            // Trigger email notification via API
            await fetch('/api/send-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId,
                    propertyName,
                }),
            });
        } catch (e) {
            console.error('Failed to send email notification', e);
        }

        // Proceed to next step (update status and redirect)
        // We don't await this because we want to exit even if email fails (it's non-blocking for user)
        onNext();
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.sectionTitle}>{t('step.payment')}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{t('payment.subtitle')}</p>

            <div className={styles.grid}>
                <Input
                    label={t('payment.bank')}
                    value={formData.bankName || ''}
                    onChange={e => handleChange('bankName', e.target.value)}
                />

                <Input
                    label={t('payment.holder')}
                    value={formData.accountHolder || ''}
                    onChange={e => handleChange('accountHolder', e.target.value)}
                />

                <Input
                    label={t('payment.institution')}
                    value={formData.transitInstitution || ''}
                    onChange={e => handleChange('transitInstitution', e.target.value)}
                    className={styles.fullWidth}
                />
                <Input
                    label={t('payment.branch')}
                    value={formData.branchNumber || ''} // Adjusted naming
                    onChange={e => handleChange('branchNumber', e.target.value)}
                />
                <Input
                    label={t('payment.account')}
                    value={formData.accountNumber || ''}
                    onChange={e => handleChange('accountNumber', e.target.value)}
                />
            </div>

            <div className={styles.divider} />

            <div className={styles.categoryBlock}>
                <h3 className={styles.sectionTitle} style={{ marginBottom: '1rem' }}>{t('payment.cheque')}</h3>
                
                <div style={{ backgroundColor: '#eff6ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid #bfdbfe', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1.2rem', lineHeight: 1 }}>ℹ️</span>
                    <p style={{ color: '#1e3a8a', fontSize: '0.9rem', margin: 0, lineHeight: 1.5 }}>
                        {t('payment.cheque_note')}
                    </p>
                </div>

                {formData.voidedChequeFile && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '6px', marginBottom: '1rem' }}>
                        <span style={{ color: '#059669', fontWeight: 500, fontSize: '0.85rem' }}>✓ {t('profile.uploaded')}</span>
                    </div>
                )}

                <FileUploader
                    accept=".pdf,image/*"
                    description="PDF or image (JPG, PNG)"
                    onChange={(files) => handleFileUpload(files, 'voidedChequeFile')}
                    disabled={uploading}
                />
            </div>

            <div className={styles.divider} />

            <div className={styles.categoryBlock}>
                <h3 className={styles.sectionTitle}>{t('step.comments_label')}</h3>
                <textarea
                    className={styles.textarea}
                    placeholder={t('step.comments_placeholder')}
                    value={formData.comments || ''}
                    onChange={e => handleChange('comments', e.target.value)}
                    rows={4}
                    style={{ marginTop: '1rem' }}
                />
            </div>

            <div className={styles.actions} style={{ justifyContent: 'space-between' }}>
                <Button variant="outline" onClick={onBack}>{t('step.back')}</Button>
                <Button size="lg" onClick={handleFinish} className={styles.nextBtn}>
                    {t('step.next')}
                </Button>
            </div>
        </div>
    );
}
