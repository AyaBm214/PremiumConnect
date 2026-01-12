import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { FileUploader } from '@/components/ui/FileUploader';
import { Property, PropertyType } from '@/lib/types';
import styles from './Step.module.css';
import { useLanguage } from '@/lib/LanguageContext';

import { createClient } from '@/lib/supabase/client';

interface Step1Props {
    propertyId: string;
    data?: Property['data']['info'];
    onUpdate: (data: Property['data']['info']) => void;
    onNext: () => void;
}

export default function Step1Info({ propertyId, data, onUpdate, onNext }: Step1Props) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState(data || {});
    const [uploading, setUploading] = useState(false);
    const supabase = createClient();

    const handleChange = (field: keyof NonNullable<Property['data']['info']>, value: any) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        onUpdate(updated);
    };

    const handleFileUpload = async (files: File[], field: 'citqFile' | 'reservationsFile') => {
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

    const handleNext = (e: React.FormEvent) => {
        e.preventDefault();
        onNext();
    };

    return (
        <form onSubmit={handleNext} className={styles.container}>
            <h3 className={styles.sectionTitle}>{t('step.info')}</h3>
            <div className={styles.grid}>
                <Input
                    label={t('info.name')}
                    placeholder="e.g. Sunny Loft downtown"
                    value={formData.propertyName || ''}
                    onChange={e => handleChange('propertyName', e.target.value)}
                    required
                />
                <Select
                    label={t('info.type')}
                    value={formData.type || ''}
                    onChange={e => handleChange('type', e.target.value as PropertyType)}
                    options={[
                        { value: 'apartment', label: t('info.type') === 'Type de propriété' ? 'Appartement' : 'Apartment' },
                        { value: 'house', label: t('info.type') === 'Type de propriété' ? 'Maison' : 'House' },
                        { value: 'villa', label: 'Villa' },
                        { value: 'cottage', label: t('info.type') === 'Type de propriété' ? 'Chalet' : 'Cottage' },
                    ]}
                    required
                />
                <Input
                    label={t('info.address')}
                    placeholder="Full address"
                    value={formData.address || ''}
                    onChange={e => handleChange('address', e.target.value)}
                    className={styles.fullWidth}
                    required
                />
                <Input
                    label={t('info.floor')}
                    placeholder="e.g. 2nd floor"
                    value={formData.floorNumber || ''}
                    onChange={e => handleChange('floorNumber', e.target.value)}
                />
                <Input
                    label={t('info.size')}
                    placeholder="e.g. 850"
                    value={formData.size || ''}
                    onChange={e => handleChange('size', e.target.value)}
                />
                <Input
                    label={t('photos.zone.bedroom')}
                    type="number"
                    value={formData.numRooms === -1 ? '' : (formData.numRooms || '')}
                    onChange={e => handleChange('numRooms', e.target.value === '' ? undefined : parseInt(e.target.value))}
                    required
                />
                <Input
                    label={t('photos.zone.bathroom')}
                    type="number"
                    value={formData.numBathrooms || ''}
                    onChange={e => handleChange('numBathrooms', parseInt(e.target.value))}
                    required
                />
                <div className={styles.row}>
                    <Input
                        label={t('info.checkin')}
                        type="time"
                        value={formData.checkInTime || ''}
                        onChange={e => handleChange('checkInTime', e.target.value)}
                        required
                    />
                    <Input
                        label={t('info.checkout')}
                        type="time"
                        value={formData.checkOutTime || ''}
                        onChange={e => handleChange('checkOutTime', e.target.value)}
                        required
                    />
                </div>
            </div>

            <div className={styles.divider} />

            <h3 className={styles.sectionTitle}>{t('info.documents')}</h3>
            <div className={styles.uploadGrid}>
                {/* CITQ */}
                <div>
                    {formData.citqFile && <p style={{ fontSize: '0.8rem', color: 'green', marginBottom: '0.5rem' }}>✓ {t('profile.uploaded')}</p>}
                    <FileUploader
                        label={t('info.citq')}
                        accept=".pdf"
                        description="Required for legal compliance"
                        onChange={(files) => handleFileUpload(files, 'citqFile')}
                        disabled={uploading}
                    />
                </div>
                {/* Excel */}
                <div>
                    {formData.reservationsFile && <p style={{ fontSize: '0.8rem', color: 'green', marginBottom: '0.5rem' }}>✓ {t('profile.uploaded')}</p>}
                    <FileUploader
                        label={t('info.reservations')}
                        accept=".xlsx,.csv"
                        description="To analyze your booking history"
                        onChange={(files) => handleFileUpload(files, 'reservationsFile')}
                        disabled={uploading}
                    />
                </div>
            </div>

            <div className={styles.actions}>
                <Button type="submit" size="lg" className={styles.nextBtn}>
                    {t('step.next')} →
                </Button>
            </div>
        </form>
    );
}
