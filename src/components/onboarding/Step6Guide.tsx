import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileUploader } from '@/components/ui/FileUploader';
import { Property } from '@/lib/types';
import styles from './Step.module.css';
import { createClient } from '@/lib/supabase/client';
import { useLanguage } from '@/lib/LanguageContext';

interface Step6Props {
    propertyId: string;
    data?: Property['data']['guide'];
    // Synced data
    info?: Property['data']['info'];
    amenities?: string[];
    photos?: string[];
    onUpdate: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function Step6Guide({ propertyId, data, info, amenities, photos, onUpdate, onNext, onBack }: Step6Props) {
    const { t } = useLanguage();
    const [formData, setFormData] = useState<Record<string, any>>(data || {});
    const [uploading, setUploading] = useState(false);
    const supabase = createClient();

    const handleChange = (field: string, value: any) => {
        const updated = { ...formData, [field]: value };
        setFormData(updated);
        onUpdate(updated);
    };

    const handleUpload = async (files: File[], field: string, isArray: boolean = false) => {
        if (!files.length) return;
        setUploading(true);
        try {
            const uploadedUrls: string[] = [];
            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${field}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
                const filePath = `${propertyId}/guide/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('properties')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('properties')
                    .getPublicUrl(filePath);

                uploadedUrls.push(publicUrl);
            }

            if (isArray) {
                const current = formData[field] || [];
                handleChange(field, [...current, ...uploadedUrls]);
            } else {
                handleChange(field, uploadedUrls[0]);
            }
        } catch (error) {
            console.error(`Upload failed for ${field}`, error);
            alert('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleNext = () => {
        if (!formData.lockVideoUrl) {
            alert(t('guide.video_required'));
            return;
        }
        onNext();
    };


    return (
        <div className={styles.container}>
            <h3 className={styles.sectionTitle}>{t('guide.title')}</h3>



            {/* 1. Wi-Fi */}
            <div className={styles.categoryBlock}>
                <h4 className={styles.categoryTitle}>{t('guide.wifi')}</h4>
                <Input
                    label="Network Name & Password"
                    placeholder="Network: MyWifi / Pass: 123456"
                    value={formData.wifiDetails || ''}
                    onChange={e => handleChange('wifiDetails', e.target.value)}
                />
                <div className={styles.uploadRow}>
                    <FileUploader
                        label="Router Location (Photo)"
                        accept="image/*"
                        onChange={(files) => handleUpload(files, 'wifiRouterPhoto')}
                        disabled={uploading}
                    />
                    <FileUploader
                        label="Speed Test (Screenshot)"
                        accept="image/*"
                        onChange={(files) => handleUpload(files, 'wifiSpeedTestScreenshot')}
                        disabled={uploading}
                    />
                </div>
            </div>

            {/* 2. Check-in & Security */}
            <div className={styles.categoryBlock}>
                <h4 className={styles.categoryTitle}>{t('guide.checkin')}</h4>
                <FileUploader
                    label={`${t('guide.access_video')} *`}
                    accept="video/*"
                    onChange={(files) => handleUpload(files, 'lockVideoUrl')}
                    disabled={uploading}
                    description={!formData.lockVideoUrl ? <span style={{ color: 'red' }}>* {t('guide.video_required')}</span> : "✓ Uploaded"}
                />
                <div className={styles.uploadRow}>
                    <FileUploader
                        label="Key Box / Lock (Photo)"
                        accept="image/*"
                        onChange={(files) => handleUpload(files, 'lockPhoto')}
                        disabled={uploading}
                    />
                    <FileUploader
                        label="First Aid Kit (Photo)"
                        accept="image/*"
                        onChange={(files) => handleUpload(files, 'firstAidKitPhoto')}
                        disabled={uploading}
                    />
                </div>
            </div>

            {/* 3. Kitchen */}
            <div className={styles.categoryBlock}>
                <h4 className={styles.categoryTitle}>{t('guide.kitchen')}</h4>
                <FileUploader
                    label="Kitchen Utensils (Photos)"
                    accept="image/*"
                    onChange={(files) => handleUpload(files, 'kitchenPhotos', true)}
                    disabled={uploading}
                />
                {formData.kitchenPhotos?.length > 0 && (
                    <p className={styles.helperText}>{formData.kitchenPhotos.length} {t('photos')} {t('profile.uploaded')}</p>
                )}
            </div>

            {/* 4. Air Conditioning */}
            <div className={styles.categoryBlock}>
                <h4 className={styles.categoryTitle}>{t('guide.ac')}</h4>
                <FileUploader
                    label="AC Instructions (Video)"
                    accept="video/*"
                    onChange={(files) => handleUpload(files, 'acVideoUrl')}
                    disabled={uploading}
                />
            </div>

            {/* 5. Extras */}
            <div className={styles.categoryBlock}>
                <h4 className={styles.categoryTitle}>{t('guide.extras')}</h4>
                <FileUploader
                    label="Extras: Linens, Baby, Games (Photos)"
                    accept="image/*"
                    onChange={(files) => handleUpload(files, 'extrasPhotos', true)}
                    disabled={uploading}
                />
                {formData.extrasPhotos?.length > 0 && (
                    <p className={styles.helperText}>{formData.extrasPhotos.length} {t('photos')} {t('profile.uploaded')}</p>
                )}
            </div>

            {/* 6. Luggage List */}
            <div className={styles.categoryBlock}>
                <h4 className={styles.categoryTitle}>{t('guide.luggage')}</h4>
                <p className={styles.description}>What should guests ABSOLUTELY bring? (e.g., Beach towels, spices...)</p>
                <textarea
                    className={styles.textarea}
                    rows={4}
                    placeholder="List the essentials..."
                    value={formData.luggageList || ''}
                    onChange={e => handleChange('luggageList', e.target.value)}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-light)',
                        minHeight: '100px'
                    }}
                />
            </div>

            {/* 7. Other */}
            <div className={styles.categoryBlock}>
                <Input
                    label={t('guide.emergency')}
                    placeholder="Police, Fire, Hospital..."
                    value={formData.emergencyContacts || ''}
                    onChange={e => handleChange('emergencyContacts', e.target.value)}
                />
            </div>

            <div className={styles.actions} style={{ justifyContent: 'space-between' }}>
                <Button variant="outline" onClick={onBack}>{t('step.back')}</Button>
                <Button size="lg" onClick={handleNext} className={styles.nextBtn}>
                    {t('step.next')} →
                </Button>
            </div>
        </div>
    );
}
