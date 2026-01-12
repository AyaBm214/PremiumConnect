import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Property } from '@/lib/types';
import { useRouter } from 'next/navigation';
import styles from './Step.module.css';
import { useLanguage } from '@/lib/LanguageContext';

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
    const router = useRouter();

    const handleChange = (field: string, value: any) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        onUpdate(updated);
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
                    required
                />
                <Input
                    label={t('payment.holder')}
                    value={formData.accountHolder || ''}
                    onChange={e => handleChange('accountHolder', e.target.value)}
                    required
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

            <div className={styles.actions} style={{ justifyContent: 'space-between' }}>
                <Button variant="outline" onClick={onBack}>{t('step.back')}</Button>
                <Button size="lg" onClick={handleFinish} className={styles.nextBtn}>
                    {t('step.save_exit')}
                </Button>
            </div>
        </div>
    );
}
