import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { FileUploader } from '@/components/ui/FileUploader';
import { Input } from '@/components/ui/Input';
import { createClient } from '@/lib/supabase/client';
import { Property } from '@/lib/types';
import styles from './Step.module.css';
import { useLanguage } from '@/lib/LanguageContext';

interface Step3Props {
    propertyId: string;
    data?: {
        photos?: string[];
        externalLinks?: string[];
        googleDriveLink?: string;
    };
    info?: Property['data']['info'];
    onUpdate: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function Step3Photos({ propertyId, data, info, onUpdate, onNext, onBack }: Step3Props) {
    const { t } = useLanguage();
    const [links, setLinks] = useState<string[]>(data?.externalLinks || ['']);
    const [uploading, setUploading] = useState(false);
    const supabase = createClient();

    // Ensure photos is initialized
    const currentPhotos = data?.photos || [];

    // Dynamic Photo Zones
    const PHOTO_ZONES = useMemo(() => {
        const zones = [
            { id: 'Living Room', label: t('photos.zone.living') },
            { id: 'Kitchen', label: t('photos.zone.kitchen') }
        ];

        // Bedrooms
        const numBedrooms = info?.numRooms || 1;
        for (let i = 1; i <= numBedrooms; i++) {
            zones.push({ id: `Bedroom ${i}`, label: `${t('photos.zone.bedroom')} ${i}` });
        }

        // Bathrooms
        const numBathrooms = info?.numBathrooms || 1;
        for (let i = 1; i <= numBathrooms; i++) {
            zones.push({ id: `Bathroom ${i}`, label: `${t('photos.zone.bathroom')} ${i}` });
        }

        zones.push({ id: 'Exterior', label: t('photos.zone.exterior') });
        return zones;
    }, [info, t]);


    const handleLinkChange = (index: number, value: string) => {
        const newLinks = [...links];
        newLinks[index] = value;
        setLinks(newLinks);
        onUpdate({ ...data, externalLinks: newLinks.filter(l => l.trim() !== '') });
    };

    const handlePhotoUpload = async (files: File[]) => {
        if (!files.length) return;
        setUploading(true);
        const newUrls: string[] = [];

        try {
            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
                const filePath = `${propertyId}/${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('properties')
                    .upload(filePath, file);

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    continue;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('properties')
                    .getPublicUrl(filePath);

                newUrls.push(publicUrl);
            }

            if (newUrls.length > 0) {
                const updatedPhotos = [...currentPhotos, ...newUrls];
                onUpdate({ ...data, photos: updatedPhotos });
            }
        } catch (error) {
            console.error('Error uploading photos:', error);
        } finally {
            setUploading(false);
        }
    };

    const addLink = () => {
        setLinks([...links, '']);
    };

    const removeLink = (index: number) => {
        const newLinks = links.filter((_, i) => i !== index);
        setLinks(newLinks);
        onUpdate({ ...data, externalLinks: newLinks.filter(l => l.trim() !== '') });
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.sectionTitle}>{t('photos.title')}</h3>
            <p style={{ color: 'var(--text-muted)' }}>{t('photos.subtitle')}</p>

            {/* Show uploaded count/preview */}
            {currentPhotos.length > 0 && (
                <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <p><strong>{currentPhotos.length} {t('photos')} {t('profile.uploaded')}</strong></p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                        {currentPhotos.slice(0, 5).map((url, i) => (
                            <img key={i} src={url} alt="Uploaded" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 4 }} />
                        ))}
                        {currentPhotos.length > 5 && <span>+{currentPhotos.length - 5} more</span>}
                    </div>
                </div>
            )}

            {PHOTO_ZONES.map(zone => (
                <div key={zone.id} className={styles.categoryBlock}>
                    <h4 className={styles.categoryTitle}>{zone.label}</h4>
                    <FileUploader
                        label=""
                        multiple
                        accept="image/*"
                        description={`${t('profile.uploaded')} ${zone.label}`}
                        onChange={handlePhotoUpload}
                        disabled={uploading}
                    />
                </div>
            ))}

            <div className={styles.divider} />

            <h3 className={styles.sectionTitle}>{t('photos.zone.plan')}</h3>
            <FileUploader
                label={t('photos.zone.plan')}
                accept="image/*,.pdf"
                description=""
                onChange={handlePhotoUpload}
                disabled={uploading}
            />

            <div className={styles.divider} />

            <h3 className={styles.sectionTitle}>{t('photos.drive_link')}</h3>
            <Input
                placeholder="https://drive.google.com/drive/folders/..."
                value={data?.googleDriveLink || ''}
                onChange={(e) => onUpdate({ ...data, googleDriveLink: e.target.value })}
            />

            <div className={styles.divider} />

            <h3 className={styles.sectionTitle}>{t('photos.listing_links')}</h3>
            {links.map((link, index) => (
                <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <Input
                        placeholder="https://airbnb.com/rooms/..."
                        value={link}
                        onChange={(e) => handleLinkChange(index, e.target.value)}
                    />
                    {links.length > 1 && (
                        <Button
                            variant="secondary"
                            onClick={() => removeLink(index)}
                            style={{ minWidth: '40px', padding: '0 10px' }}
                        >
                            ✕
                        </Button>
                    )}
                </div>
            ))}
            <Button variant="outline" onClick={addLink} size="sm" style={{ marginTop: '0.5rem' }}>
                + Add Another URL
            </Button>

            <div className={styles.actions} style={{ justifyContent: 'space-between', marginTop: '2rem' }}>
                <Button variant="outline" onClick={onBack}>{t('step.back')}</Button>
                <Button size="lg" onClick={onNext} className={styles.nextBtn}>
                    {t('step.next')} →
                </Button>
            </div>
        </div>
    );
}
