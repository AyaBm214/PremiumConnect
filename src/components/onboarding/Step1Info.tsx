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

    const handleNumFloorsChange = (val: string) => {
        const n = parseInt(val) || 0;
        const currentRooms = formData.roomsPerFloor || [];
        const newRoomsPerFloor = [...currentRooms];
        
        if (n > newRoomsPerFloor.length) {
            for (let i = newRoomsPerFloor.length; i < n; i++) {
                newRoomsPerFloor.push(0);
            }
        } else {
            newRoomsPerFloor.splice(n);
        }
        
        const updated = { 
            ...formData, 
            numFloors: n, 
            roomsPerFloor: newRoomsPerFloor 
        };
        // Also update total rooms and beds array
        const totalRooms = newRoomsPerFloor.reduce((acc, curr) => acc + (curr || 0), 0);
        const newBedsPerBedroom = [...(formData.bedsPerBedroom || [])];
        if (totalRooms > newBedsPerBedroom.length) {
            for (let i = newBedsPerBedroom.length; i < totalRooms; i++) {
                newBedsPerBedroom.push(1); // Default 1 bed
            }
        } else {
            newBedsPerBedroom.splice(totalRooms);
        }
        updated.numRooms = totalRooms;
        updated.bedsPerBedroom = newBedsPerBedroom;

        setFormData(updated);
        onUpdate(updated);
    };

    const handleRoomsPerFloorChange = (index: number, val: string) => {
        const n = parseInt(val) || 0;
        const newRoomsPerFloor = [...(formData.roomsPerFloor || [])];
        newRoomsPerFloor[index] = n;
        
        const totalRooms = newRoomsPerFloor.reduce((acc, curr) => acc + (curr || 0), 0);
        const newBedsPerBedroom = [...(formData.bedsPerBedroom || [])];
        if (totalRooms > newBedsPerBedroom.length) {
            for (let i = newBedsPerBedroom.length; i < totalRooms; i++) {
                newBedsPerBedroom.push(1);
            }
        } else {
            newBedsPerBedroom.splice(totalRooms);
        }

        const updated = { 
            ...formData, 
            roomsPerFloor: newRoomsPerFloor,
            numRooms: totalRooms,
            bedsPerBedroom: newBedsPerBedroom
        };
        setFormData(updated);
        onUpdate(updated);
    };

    const handleBedsPerBedroomChange = (index: number, val: string) => {
        const n = parseInt(val) || 0;
        const newBedsPerBedroom = [...(formData.bedsPerBedroom || [])];
        newBedsPerBedroom[index] = n;
        
        const updated = { ...formData, bedsPerBedroom: newBedsPerBedroom };
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
                    label={t('label.property_name')}
                    placeholder="e.g. Sunny Loft downtown"
                    value={formData.propertyName || ''}
                    onChange={e => handleChange('propertyName', e.target.value)}
                />

                <Select
                    label={t('label.property_type')}
                    value={formData.type || ''}
                    onChange={e => handleChange('type', e.target.value as PropertyType)}
                    options={[
                        { value: 'condo', label: t('property_type.condo') },
                        { value: 'apartment', label: t('property_type.apartment') },
                        { value: 'villa', label: t('property_type.villa') },
                        { value: 'chalet', label: t('property_type.chalet') },
                        { value: 'other', label: t('property_type.other') },
                    ]}
                />

                <Input
                    label={t('label.address')}
                    placeholder="e.g. 123 Main St, Montreal, QC"
                    value={formData.address || ''}
                    onChange={e => handleChange('address', e.target.value)}
                    className={styles.fullWidth}
                />

                <Input
                    label={t('label.google_maps_url')}
                    placeholder="https://www.google.com/maps/..."
                    value={formData.googleMapsUrl || ''}
                    onChange={e => handleChange('googleMapsUrl', e.target.value)}
                    className={styles.fullWidth}
                />

                <Input
                    label={t('label.construction_date')}
                    type="date"
                    value={formData.constructionDate || ''}
                    onChange={e => handleChange('constructionDate', e.target.value)}
                />
                
                <Input
                    label={t('label.num_floors')}
                    type="number"
                    min={0}
                    value={formData.numFloors ?? ''}
                    onChange={e => handleNumFloorsChange(e.target.value)}
                />


                {(() => {
                    let bedroomGlobalIdx = 0;
                    return (formData.roomsPerFloor || []).map((numRoomsOnFloor, floorIdx) => (
                        <div key={`floor-${floorIdx}`} className={styles.floorCard}>
                            <h4 className={styles.hierarchyTitle}>
                                🏢 {t('label.floor_n').replace('{0}', (floorIdx + 1).toString())}
                            </h4>
                            <Input
                                label={t('label.rooms_on_floor')}
                                type="number"
                                min={0}
                                value={numRoomsOnFloor || ''}
                                onChange={e => handleRoomsPerFloorChange(floorIdx, e.target.value)}
                            />

                            
                            {numRoomsOnFloor > 0 && (
                                <div className={styles.roomSection}>
                                    {Array.from({ length: numRoomsOnFloor }).map((_, rIdx) => {
                                        const currentIdx = bedroomGlobalIdx++;
                                        return (
                                            <div key={`room-${currentIdx}`} className={styles.bedroomCard}>
                                                <Input
                                                    label={t('label.bedroom_n').replace('{0}', (currentIdx + 1).toString())}
                                                    placeholder={t('label.beds_in_bedroom')}
                                                    type="number"
                                                    min={1}
                                                    value={formData.bedsPerBedroom?.[currentIdx] || ''}
                                                    onChange={e => handleBedsPerBedroomChange(currentIdx, e.target.value)}
                                                />

                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ));
                })()}

                <div className={styles.sizeInputGroup}>
                    <Input
                        label={t('label.size')}
                        placeholder="e.g. 850"
                        value={formData.size || ''}
                        onChange={e => handleChange('size', e.target.value)}
                        className={styles.fullWidth}
                        style={{ flex: 1 }}
                    />
                    <Select
                        label={t('admin.details.info.size_unit') || 'Unit'}
                        value={formData.sizeUnit || 'm²'}
                        onChange={e => handleChange('sizeUnit', e.target.value)}
                        className={styles.unitSelect}
                        options={[
                            { value: 'm²', label: 'm²' },
                            { value: 'ft²', label: 'ft²' },
                            { value: 'cm²', label: 'cm²' },
                            { value: 'acres', label: 'acres' },
                        ]}
                    />
                </div>
                <Input
                    label={t('photos.zone.bathroom')}
                    type="number"
                    step={0.5}
                    min={0}
                    value={formData.numBathrooms ?? ''}
                    onChange={e => handleChange('numBathrooms', e.target.value === '' ? undefined : parseFloat(e.target.value))}
                />

                <div className={styles.row}>
                    <Input
                        label={t('label.checkin')}
                        type="time"
                        value={formData.checkInTime || ''}
                        onChange={e => handleChange('checkInTime', e.target.value)}
                    />
                    <Input
                        label={t('label.checkout')}
                        type="time"
                        value={formData.checkOutTime || ''}
                        onChange={e => handleChange('checkOutTime', e.target.value)}
                    />
                </div>

            </div>

            <div className={styles.divider} />

            <h3 className={styles.sectionTitle}>{t('label.documents')}</h3>
            <div className={styles.uploadGrid}>
                {/* CITQ */}
                <div>
                    {formData.citqFile && <p style={{ fontSize: '0.8rem', color: 'green', marginBottom: '0.5rem' }}>✓ {t('profile.uploaded')}</p>}
                    <FileUploader
                        label={t('label.citq')}
                        accept=".pdf,image/*"
                        description="PDF or image (JPG, PNG)"
                        onChange={(files) => handleFileUpload(files, 'citqFile')}
                        disabled={uploading}
                    />
                </div>
                {/* Excel */}
                <div>
                    {formData.reservationsFile && <p style={{ fontSize: '0.8rem', color: 'green', marginBottom: '0.5rem' }}>✓ {t('profile.uploaded')}</p>}
                    <FileUploader
                        label={t('label.reservations')}
                        accept=".xlsx,.csv"
                        description="To analyze your booking history"
                        onChange={(files) => handleFileUpload(files, 'reservationsFile')}
                        disabled={uploading}
                    />
                </div>
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

            <div className={styles.actions}>
                <Button type="submit" size="lg" className={styles.nextBtn}>
                    {t('step.next')} →
                </Button>
            </div>
        </form>
    );
}
