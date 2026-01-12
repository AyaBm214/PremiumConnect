import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Property } from '@/lib/types';
import styles from './Step.module.css';
import { useLanguage } from '@/lib/LanguageContext';

interface Step5Props {
    data?: Property['data']['rules'];
    onUpdate: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function Step5Rules({ data, onUpdate, onNext, onBack }: Step5Props) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState(data || {});

    const handleChange = (field: string, value: any) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        onUpdate(updated);
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.sectionTitle}>{t('step.rules')}</h3>

            <div className={styles.togglesGrid}>
                <Toggle label="Smoking Allowed" checked={formData.smoking} onChange={v => handleChange('smoking', v)} />
                <Toggle label="Pets Allowed" checked={formData.pets} onChange={v => handleChange('pets', v)} />
                <Toggle label="Events Allowed" checked={formData.events} onChange={v => handleChange('events', v)} />
                <Toggle label="I provide cleaning" checked={formData.providesCleaning} onChange={v => handleChange('providesCleaning', v)} />
            </div>

            {/* Max Pets Conditional Input */}
            {formData.pets && (
                <div style={{ marginTop: '1rem', width: '200px' }}>
                    <Input
                        label="Max Pets Allowed"
                        type="number"
                        placeholder="e.g. 2"
                        value={formData.maxPets || ''}
                        onChange={e => handleChange('maxPets', parseInt(e.target.value))}
                    />
                </div>
            )}

            <Input
                label="Quiet Hours"
                placeholder="e.g. 10:00 PM - 8:00 AM"
                value={formData.quietHours || ''}
                onChange={e => handleChange('quietHours', e.target.value)}
            />

            <div className={styles.divider} />

            <h3 className={styles.sectionTitle}>Fees & Details</h3>
            <div className={styles.grid}>
                {formData.providesCleaning && (
                    <Input
                        label="Cleaning Fee ($)"
                        type="number"
                        value={formData.cleaningFee || ''}
                        onChange={e => handleChange('cleaningFee', e.target.value)}
                        required
                    />
                )}
                <Input
                    label="Max Guests"
                    type="number"
                    value={formData.maxGuests || ''}
                    onChange={e => handleChange('maxGuests', e.target.value)}
                />
            </div>

            <div className={styles.actions} style={{ justifyContent: 'space-between' }}>
                <Button variant="outline" onClick={onBack}>{t('step.back')}</Button>
                <Button size="lg" onClick={onNext} className={styles.nextBtn}>
                    {t('step.next')} →
                </Button>
            </div>
        </div>
    );
}

function Toggle({ label, checked, onChange }: { label: string, checked?: boolean, onChange: (v: boolean) => void }) {
    return (
        <label className={styles.toggleRow}>
            <span className={styles.toggleLabel}>{label}</span>
            <input
                type="checkbox"
                checked={!!checked}
                onChange={e => onChange(e.target.checked)}
                className={styles.toggleInput}
            />
            <div className={styles.toggleSwitch} />
        </label>
    );
}
