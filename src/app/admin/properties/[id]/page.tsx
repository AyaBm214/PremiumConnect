'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { generatePropertyPDF, downloadRemoteFile } from '@/lib/pdf';
import { Property } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import styles from '../properties.module.css';
import { useLanguage } from '@/lib/LanguageContext';

import { calculateTotalProgress } from '@/lib/onboarding-utils';
import { downloadPhotosAsZip, PhotoToDownload } from '@/lib/download-utils';
import PropertyStructureDisplay from '@/components/admin/PropertyStructureDisplay';

export default function PropertyDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<Property | null>(null);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editedData, setEditedData] = useState<any>(null);
    const [downloading, setDownloading] = useState(false);
    const [downloadProgress, setDownloadProgress] = useState({ current: 0, total: 0 });
    const supabase = createClient();
    const { t } = useLanguage();

    useEffect(() => {
        const fetchProperty = async () => {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('id', params.id)
                .single();

            if (error || !data) {
                console.error('Error fetching property:', error);
                return;
            }

            const mapped: Property = {
                id: data.id,
                ownerId: data.owner_id,
                name: data.name || 'Untitled',
                status: data.status,
                currentStep: data.current_step,
                totalSteps: data.total_steps,
                progress: data.progress,
                data: data.data,
                updatedAt: data.updated_at
            };

            setProperty(mapped);
            setEditedData(JSON.parse(JSON.stringify(data.data)));
        };

        fetchProperty();
    }, [params.id, router]);
    const handleSave = async (section: string) => {
        if (!property) return;

        const newProgress = calculateTotalProgress(editedData);

        const { error } = await supabase
            .from('properties')
            .update({
                data: editedData,
                progress: newProgress
            })
            .eq('id', property.id);

        if (error) {
            alert('Error updating property: ' + error.message);
            return;
        }

        setProperty({ ...property, data: editedData, progress: newProgress });
        setIsEditing(null);
    };

    const handleCancel = () => {
        if (property) {
            setEditedData(JSON.parse(JSON.stringify(property.data)));
        }
        setIsEditing(null);
    };

    if (!property) return <div>Loading...</div>;

    const { data } = property;

    return (
        <div>
            <div className={styles.header}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <Link href="/admin/properties">
                        <Button variant="ghost">← {t('admin.details.back')}</Button>
                    </Link>
                    <div>
                        <h1 className={styles.title}>{data.info?.propertyName || 'Untitled'}</h1>
                        <p className={styles.propId}>{t('admin.details.owner_id')}: {property.ownerId}</p>
                        {data.payment?.accountHolder && (
                            <p className={styles.propId} style={{ marginTop: '0.25rem', fontWeight: 'bold' }}>{t('admin.details.client')}: {data.payment.accountHolder}</p>
                        )}
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <Button
                        variant="outline"
                        disabled={downloading}
                        onClick={async () => {
                            if (!property || !data.photos?.length) {
                                alert('No photos to download');
                                return;
                            }

                            const photosToZip: PhotoToDownload[] = [];
                            if (data.photos) data.photos.forEach((url, i) => photosToZip.push({ url, filename: `main_${i + 1}` }));
                            if (data.guide?.wifiRouterPhoto) photosToZip.push({ url: data.guide.wifiRouterPhoto, filename: 'guide_wifi_router' });
                            if (data.guide?.wifiSpeedTestScreenshot) photosToZip.push({ url: data.guide.wifiSpeedTestScreenshot, filename: 'guide_wifi_speedtest' });
                            if (data.guide?.firstAidKitPhoto) photosToZip.push({ url: data.guide.firstAidKitPhoto, filename: 'guide_first_aid' });
                            if (data.guide?.lockPhoto) photosToZip.push({ url: data.guide.lockPhoto, filename: 'guide_lock' });
                            if (data.guide?.kitchenPhotos) data.guide.kitchenPhotos.forEach((url, i) => photosToZip.push({ url, filename: `guide_kitchen_${i + 1}` }));
                            if (data.guide?.extrasPhotos) data.guide.extrasPhotos.forEach((url, i) => photosToZip.push({ url, filename: `guide_extras_${i + 1}` }));

                            setDownloading(true);
                            setDownloadProgress({ current: 0, total: photosToZip.length });

                            try {
                                const dateStr = new Date().toISOString().split('T')[0];
                                const zipName = `photos_export_${dateStr}.zip`;
                                await downloadPhotosAsZip(photosToZip, zipName, (current, total) => {
                                    setDownloadProgress({ current, total });
                                });
                            } catch (error) {
                                console.error('Error creating ZIP:', error);
                                alert('Failed to create ZIP archive.');
                            } finally {
                                setDownloading(false);
                            }
                        }}
                    >
                        {downloading ? `📦 ${downloadProgress.current}/${downloadProgress.total}...` : t('admin.details.download_all_photos') || 'Download All Photos'}
                    </Button>
                    <Button variant="outline" onClick={() => generatePropertyPDF(property)}>{t('admin.details.download_pdf')}</Button>
                    {data.info?.citqFile && (
                        <Button
                            variant="outline"
                            style={{ borderColor: '#007bff', color: '#007bff' }}
                            onClick={() => {
                                if (data.info?.citqFile) {
                                    const safeName = (data.info.propertyName || property.id).replace(/[^a-z0-9]/gi, '_').toLowerCase();
                                    downloadRemoteFile(data.info.citqFile, `CITQ_${safeName}.pdf`);
                                }
                            }}
                        >
                            {t('admin.details.download_citq')}
                        </Button>
                    )}
                    <Button
                        style={{ backgroundColor: '#dc3545', color: 'white', border: 'none' }}
                        onClick={async () => {
                            if (confirm(t('admin.details.delete_confirm'))) {
                                const { error } = await supabase.from('properties').delete().eq('id', property.id);
                                if (error) {
                                    alert(t('admin.details.delete_error'));
                                    console.error(error);
                                } else {
                                    alert(t('admin.details.delete_success'));
                                    router.push('/admin/properties');
                                }
                            }
                        }}
                    >
                        {t('admin.details.delete_prop')}
                    </Button>
                </div>
            </div>

            <div className={styles.detailsGrid}>
                <Section
                    title={t('admin.details.section.info')}
                    isEditing={isEditing === 'info'}
                    onEdit={() => setIsEditing('info')}
                    onSave={() => handleSave('info')}
                    onCancel={handleCancel}
                >
                    {isEditing === 'info' ? (
                        <>
                            <EditRow label={t('admin.details.info.type')} value={editedData.info?.propertyName} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, propertyName: v } })} />
                            <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center' }}>
                                <span style={{ minWidth: '120px', fontSize: '0.9rem', color: '#666' }}>{t('admin.details.info.property_type')}</span>
                                <select
                                    style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                                    value={editedData.info?.type || 'other'}
                                    onChange={(e) => setEditedData({ ...editedData, info: { ...editedData.info, type: e.target.value } })}
                                >
                                    <option value="condo">Condo</option>
                                    <option value="apartment">Appartement</option>
                                    <option value="villa">Villa</option>
                                    <option value="chalet">Chalet</option>
                                    <option value="other">Autre / Other</option>
                                </select>
                            </div>
                            <EditRow label={t('label.address')} value={editedData.info?.address} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, address: v } })} />
                            <EditRow label={t('label.google_maps_url')} value={editedData.info?.googleMapsUrl} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, googleMapsUrl: v } })} />
                            <EditRow label={t('label.instruction_date')} type="date" value={editedData.info?.instructionDate} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, instructionDate: v } })} />
                            <EditRow label={t('label.property_type')} value={editedData.info?.type} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, type: v } })} />
                            <EditRow label={t('admin.details.info.floor')} value={editedData.info?.floorNumber} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, floorNumber: v } })} />
                            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', alignItems: 'flex-end' }}>
                                <div style={{ flex: 1 }}>
                                    <EditRow label={t('admin.details.info.size')} value={editedData.info?.size} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, size: v } })} />
                                </div>
                                <div style={{ width: '120px', marginBottom: '0.75rem' }}>
                                    <select
                                        style={{ width: '100%', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                                        value={editedData.info?.sizeUnit || 'm²'}
                                        onChange={(e) => setEditedData({ ...editedData, info: { ...editedData.info, sizeUnit: e.target.value } })}
                                    >
                                        <option value="m²">m²</option>
                                        <option value="ft²">ft²</option>
                                        <option value="cm²">cm²</option>
                                        <option value="acres">acres</option>
                                    </select>
                                </div>
                            </div>
                            <EditRow label={t('admin.details.info.floors')} value={editedData.info?.numFloors} type="number" onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, numFloors: parseInt(v) } })} />
                            <EditRow label={t('admin.details.info.rooms_dist')} value={editedData.info?.roomsPerFloor?.join(', ')} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, roomsPerFloor: v.split(',').map((s: string) => parseInt(s.trim())) } })} />
                            <EditRow label={t('admin.details.info.beds_dist')} value={editedData.info?.bedsPerBedroom?.join(', ')} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, bedsPerBedroom: v.split(',').map((s: string) => parseInt(s.trim())) } })} />
                            
                            <EditRow label={t('admin.details.info.rooms')} value={editedData.info?.numRooms} type="number" onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, numRooms: parseInt(v) } })} />
                            <EditRow label={t('admin.details.info.rooms')} value={editedData.info?.numBathrooms} type="number" onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, numBathrooms: parseInt(v) } })} />
                            <EditRow label={t('admin.details.info.checkin')} value={editedData.info?.checkInTime} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, checkInTime: v } })} />
                            <EditRow label={t('admin.details.info.checkout')} value={editedData.info?.checkOutTime} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, checkOutTime: v } })} />
                            <EditRow label={t('step.comments_label')} value={editedData.info?.comments} isTextArea onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, comments: v } })} />
                        </>
                    ) : (
                        <>
                            <Row label={t('admin.details.info.property_type')} value={data.info?.type} />
                            <Row label={t('label.address')} value={data.info?.address} />
                            <Row 
                                label={t('label.google_maps_url')} 
                                value={data.info?.googleMapsUrl ? <a href={data.info.googleMapsUrl} target="_blank" style={{ color: 'blue', textDecoration: 'underline' }}>{t('admin.props.view')}</a> : 'N/A'} 
                            />
                            <Row label={t('label.instruction_date')} value={data.info?.instructionDate} />
                            <Row label={t('label.property_type')} value={data.info?.type} />
                            <Row label={t('admin.details.info.size')} value={data.info?.size ? `${data.info.size} ${data.info.sizeUnit || 'm²'}` : 'N/A'} />
                            
                            <PropertyStructureDisplay 
                                numFloors={data.info?.numFloors}
                                numRooms={data.info?.numRooms}
                                roomsPerFloor={data.info?.roomsPerFloor}
                                bedsPerBedroom={data.info?.bedsPerBedroom}
                            />

                            <Row label={t('admin.details.info.checkin')} value={data.info?.checkInTime || 'N/A'} />
                            <Row label={t('admin.details.info.checkout')} value={data.info?.checkOutTime || 'N/A'} />
                            <Row label={t('step.comments_label')} value={data.info?.comments} />
                        </>
                    )}
                </Section>

                <Section
                    title={t('admin.details.section.amenities')}
                    isEditing={isEditing === 'amenities'}
                    onEdit={() => setIsEditing('amenities')}
                    onSave={() => handleSave('amenities')}
                    onCancel={handleCancel}
                >
                    {isEditing === 'amenities' ? (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>{t('admin.details.amenities.comma_list')}</p>
                                <textarea
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', minHeight: '100px' }}
                                    value={editedData.amenities?.join(', ') || ''}
                                    onChange={(e) => setEditedData({ ...editedData, amenities: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                                />
                            </div>
                            <EditRow label={t('amenity.pool_date')} value={editedData.poolOpeningDate} onChange={(v) => setEditedData({ ...editedData, poolOpeningDate: v })} />
                            <EditRow label={t('amenity.hottub_date')} value={editedData.hotTubOpeningDate} onChange={(v) => setEditedData({ ...editedData, hotTubOpeningDate: v })} />
                            <EditRow label={t('amenity.bbq_date')} value={editedData.bbqOpeningDate} onChange={(v) => setEditedData({ ...editedData, bbqOpeningDate: v })} />
                            <EditRow label={t('step.comments_label')} value={editedData.amenitiesComments} isTextArea onChange={(v) => setEditedData({ ...editedData, amenitiesComments: v })} />
                        </>
                    ) : (
                        <>
                            <div className={styles.tags}>
                                {data.amenities?.map((a: string) => (
                                    <span key={a} className={styles.tag}>{t(`amenity.${a}`)}</span>
                                ))}
                            </div>
                            {data.poolOpeningDate && (
                                <div style={{ marginTop: '1rem' }}>
                                    <Row label={t('amenity.pool_date')} value={data.poolOpeningDate} />
                                </div>
                            )}
                            {data.hotTubOpeningDate && (
                                <div style={{ marginTop: '1rem' }}>
                                    <Row label={t('amenity.hottub_date')} value={data.hotTubOpeningDate} />
                                </div>
                            )}
                            {data.bbqOpeningDate && (
                                <div style={{ marginTop: '1rem' }}>
                                    <Row label={t('amenity.bbq_date')} value={data.bbqOpeningDate} />
                                </div>
                            )}
                            <Row label={t('step.comments_label')} value={data.amenitiesComments} />
                        </>
                    )}
                </Section>

                <Section
                    title={t('admin.details.section.rules')}
                    isEditing={isEditing === 'rules'}
                    onEdit={() => setIsEditing('rules')}
                    onSave={() => handleSave('rules')}
                    onCancel={handleCancel}
                >
                    {isEditing === 'rules' ? (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <input type="checkbox" checked={editedData.rules?.smoking} onChange={(e) => setEditedData({ ...editedData, rules: { ...editedData.rules, smoking: e.target.checked } })} /> {t('admin.details.rules.smoking')}
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <input type="checkbox" checked={editedData.rules?.pets} onChange={(e) => setEditedData({ ...editedData, rules: { ...editedData.rules, pets: e.target.checked } })} /> {t('admin.details.rules.pets')}
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <input type="checkbox" checked={editedData.rules?.events} onChange={(e) => setEditedData({ ...editedData, rules: { ...editedData.rules, events: e.target.checked } })} /> {t('admin.details.rules.events')}
                                </label>
                            </div>
                            <EditRow label={t('admin.details.rules.max_pets')} value={editedData.rules?.maxPets} type="number" onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, maxPets: v } })} />
                            <EditRow label={t('admin.details.rules.cleaning')} value={editedData.rules?.cleaningFee} type="number" onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, cleaningFee: v } })} />
                            <EditRow label={t('admin.details.rules.deposit')} value={editedData.rules?.securityDeposit} type="number" onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, securityDeposit: v } })} />
                            <EditRow label={t('admin.details.rules.pet_fee')} value={editedData.rules?.petFee} type="number" onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, petFee: v } })} />
                            <EditRow label={t('admin.details.rules.max_guests')} value={editedData.rules?.maxGuests} type="number" onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, maxGuests: v } })} />
                            <EditRow label={t('admin.details.rules.quiet_hours')} value={editedData.rules?.quietHours} onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, quietHours: v } })} />

                            <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>{t('admin.details.rules.access_security')}</h4>
                                <EditRow label={t('admin.details.rules.door_code')} value={editedData.rules?.doorCode} onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, doorCode: v } })} />
                                <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center' }}>
                                    <span style={{ minWidth: '120px', fontSize: '0.9rem', color: '#666' }}>{t('admin.details.rules.lock_type')}</span>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}>
                                            <input type="checkbox" checked={editedData.rules?.lockType?.includes('smart_lock')} onChange={(e) => {
                                                const current = editedData.rules?.lockType || [];
                                                const updated = e.target.checked ? [...current, 'smart_lock'] : current.filter((t: string) => t !== 'smart_lock');
                                                setEditedData({ ...editedData, rules: { ...editedData.rules, lockType: updated } });
                                            }} /> {t('rules.lock_type.smart')}
                                        </label>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem' }}>
                                            <input type="checkbox" checked={editedData.rules?.lockType?.includes('lockbox')} onChange={(e) => {
                                                const current = editedData.rules?.lockType || [];
                                                const updated = e.target.checked ? [...current, 'lockbox'] : current.filter((t: string) => t !== 'lockbox');
                                                setEditedData({ ...editedData, rules: { ...editedData.rules, lockType: updated } });
                                            }} /> {t('rules.lock_type.lockbox')}
                                        </label>
                                    </div>
                                </div>
                                {editedData.rules?.lockType?.includes('smart_lock') && (
                                    <>
                                        <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center' }}>
                                            <span style={{ minWidth: '120px', fontSize: '0.9rem', color: '#666' }}>{t('admin.details.rules.smart_lock_brand')}</span>
                                            <select
                                                style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                                                value={editedData.rules?.smartLockBrand || ''}
                                                onChange={(e) => setEditedData({ ...editedData, rules: { ...editedData.rules, smartLockBrand: e.target.value } })}
                                            >
                                                <option value="">N/A</option>
                                                <option value="schlage">Schlage</option>
                                                <option value="yale">Yale</option>
                                                <option value="eufy">Eufy</option>
                                                <option value="other">Autre / Other</option>
                                            </select>
                                        </div>
                                        {editedData.rules?.smartLockBrand === 'other' && (
                                            <EditRow label={t('admin.details.rules.other_brand')} value={editedData.rules?.otherSmartLockBrand} onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, otherSmartLockBrand: v } })} />
                                        )}
                                    </>
                                )}
                                <EditRow label={t('admin.details.rules.alarm_code')} value={editedData.rules?.alarmCode} onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, alarmCode: v } })} />
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
                                    <input type="checkbox" checked={editedData.rules?.hasCameras} onChange={(e) => setEditedData({ ...editedData, rules: { ...editedData.rules, hasCameras: e.target.checked } })} /> {t('admin.details.rules.has_cameras')}
                                </label>
                                {editedData.rules?.hasCameras && (
                                    <>
                                        <EditRow label={t('admin.details.rules.num_cameras')} value={editedData.rules?.numCameras} type="number" onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, numCameras: parseInt(v) } })} />
                                        <EditRow label={t('admin.details.rules.camera_placements')} value={editedData.rules?.cameraPlacements} isTextArea onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, cameraPlacements: v } })} />
                                    </>
                                )}
                            </div>

                            <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>{t('admin.details.rules.ops_contacts')}</h4>
                                <EditRow label={t('admin.details.rules.cleaning_contact')} value={editedData.rules?.cleaningContact} onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, cleaningContact: v } })} />
                                <EditRow label={t('admin.details.rules.snow_removal')} value={editedData.rules?.snowRemovalContact} onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, snowRemovalContact: v } })} />
                                <EditRow label={t('admin.details.rules.additional_notes')} value={editedData.rules?.additionalNotes} isTextArea onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, additionalNotes: v } })} />
                            </div>

                            <EditRow label={t('step.comments_label')} value={editedData.rules?.comments} isTextArea onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, comments: v } })} />
                        </>
                    ) : (
                        <>
                            <Row label={t('admin.details.rules.smoking')} value={data.rules?.smoking ? 'Yes' : 'No'} />
                            <Row label={t('admin.details.rules.pets')} value={data.rules?.pets ? `Yes (Max: ${data.rules.maxPets || 'Any'})` : 'No'} />
                            <Row label={t('admin.details.rules.events')} value={data.rules?.events ? 'Yes' : 'No'} />
                            <Row label={t('admin.details.rules.cleaning')} value={data.rules?.cleaningFee ? `$${data.rules.cleaningFee}` : '$0'} />
                            <Row label={t('admin.details.rules.deposit')} value={(data.rules as any)?.securityDeposit ? `$${(data.rules as any).securityDeposit}` : '$0'} />
                            <Row label={t('admin.details.rules.pet_fee')} value={(data.rules as any)?.petFee ? `$${(data.rules as any).petFee}` : '$0'} />
                            <Row label={t('admin.details.rules.max_guests')} value={data.rules?.maxGuests || 'N/A'} />
                            <Row label={t('admin.details.rules.quiet_hours')} value={data.rules?.quietHours || 'None'} />

                            <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>{t('admin.details.rules.access_security')}</h4>
                                <Row label={t('admin.details.rules.door_code')} value={data.rules?.doorCode} />
                                <Row label={t('admin.details.rules.lock_type')} value={data.rules?.lockType?.map((lt: string) => t(`rules.lock_type.${lt.split('_')[0]}`)).join(', ')} />
                                {data.rules?.lockType?.includes('smart_lock') && (
                                    <Row label={t('admin.details.rules.smart_lock_brand')} value={data.rules.smartLockBrand === 'other' ? data.rules.otherSmartLockBrand : data.rules.smartLockBrand} />
                                )}
                                <Row label={t('admin.details.rules.alarm_code')} value={data.rules?.alarmCode} />
                                <Row label={t('admin.details.rules.has_cameras')} value={data.rules?.hasCameras ? t('signup.name').includes('m') ? 'Oui' : 'Yes' : t('signup.name').includes('m') ? 'Non' : 'No'} />
                                {data.rules?.hasCameras && (
                                    <>
                                        <Row label={t('admin.details.rules.num_cameras')} value={data.rules?.numCameras} />
                                        <Row label={t('admin.details.rules.camera_placements')} value={data.rules?.cameraPlacements} />
                                    </>
                                )}
                            </div>

                            <div style={{ marginTop: '1rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>{t('admin.details.rules.ops_contacts')}</h4>
                                <Row label={t('admin.details.rules.cleaning_contact')} value={data.rules?.cleaningContact} />
                                <Row label={t('admin.details.rules.snow_removal')} value={data.rules?.snowRemovalContact} />
                                <Row label={t('admin.details.rules.additional_notes')} value={data.rules?.additionalNotes} />
                            </div>

                            <Row label={t('step.comments_label')} value={data.rules?.comments} />
                        </>
                    )}
                </Section>

                <Section
                    title={t('step.owner_requests')}
                    isEditing={isEditing === 'ownerRequests'}
                    onEdit={() => setIsEditing('ownerRequests')}
                    onSave={() => handleSave('ownerRequests')}
                    onCancel={handleCancel}
                >
                    {isEditing === 'ownerRequests' ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* 1. Spa */}
                            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>{t('owner_req.spa.title')}</h4>
                                <EditRow label={t('owner_req.spa.treatment')} value={editedData.ownerRequests?.spa?.treatmentType} onChange={(v) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, spa: { ...editedData.ownerRequests?.spa, treatmentType: v } } })} />
                                <EditRow label={t('owner_req.spa.products')} value={editedData.ownerRequests?.spa?.productsUsed} onChange={(v) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, spa: { ...editedData.ownerRequests?.spa, productsUsed: v } } })} />
                                <EditRow label={t('owner_req.spa.location')} value={editedData.ownerRequests?.spa?.productsLocation} onChange={(v) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, spa: { ...editedData.ownerRequests?.spa, productsLocation: v } } })} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <input type="checkbox" checked={editedData.ownerRequests?.spa?.hasMaintenanceContract} onChange={(e) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, spa: { ...editedData.ownerRequests?.spa, hasMaintenanceContract: e.target.checked } } })} />
                                    <span style={{ fontSize: '0.9rem' }}>{t('owner_req.spa.contract')}</span>
                                </div>
                            </div>

                            {/* 2. Bedding */}
                            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>{t('owner_req.bedding.title')}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <input type="checkbox" checked={editedData.ownerRequests?.bedding?.hasProtection} onChange={(e) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, bedding: { ...editedData.ownerRequests?.bedding, hasProtection: e.target.checked } } })} />
                                    <span style={{ fontSize: '0.9rem' }}>{t('owner_req.bedding.protection')}</span>
                                </div>
                                <EditRow label={t('owner_req.bedding.pillows')} type="number" value={editedData.ownerRequests?.bedding?.pillowsCount} onChange={(v) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, bedding: { ...editedData.ownerRequests?.bedding, pillowsCount: parseInt(v) } } })} />
                                <EditRow label={t('owner_req.bedding.blankets')} type="number" value={editedData.ownerRequests?.bedding?.blanketsCount} onChange={(v) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, bedding: { ...editedData.ownerRequests?.bedding, blanketsCount: parseInt(v) } } })} />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <input type="checkbox" checked={editedData.ownerRequests?.bedding?.hasExchangeLinen} onChange={(e) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, bedding: { ...editedData.ownerRequests?.bedding, hasExchangeLinen: e.target.checked } } })} />
                                    <span style={{ fontSize: '0.9rem' }}>{t('owner_req.bedding.exchange')}</span>
                                </div>
                            </div>

                            {/* 3. Consumables */}
                            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>{t('owner_req.consumables.title')}</h4>
                                <EditRow label={t('owner_req.consumables.products')} isTextArea value={editedData.ownerRequests?.consumables?.productsProvided} onChange={(v) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, consumables: { ...editedData.ownerRequests?.consumables, productsProvided: v } } })} />
                                <EditRow label={t('owner_req.consumables.refill')} value={editedData.ownerRequests?.consumables?.whoRefills} onChange={(v) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, consumables: { ...editedData.ownerRequests?.consumables, whoRefills: v } } })} />
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                                    <div style={{ flex: 1 }}>
                                        <EditRow label={t('owner_req.consumables.budget')} type="number" value={editedData.ownerRequests?.consumables?.approxBudget} onChange={(v) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, consumables: { ...editedData.ownerRequests?.consumables, approxBudget: parseFloat(v) } } })} />
                                    </div>
                                    <div style={{ width: '100px', marginBottom: '1rem' }}>
                                        <label style={{ fontSize: '0.8rem', color: '#666', display: 'block', marginBottom: '0.25rem' }}>{t('owner_req.consumables.currency')}</label>
                                        <select
                                            style={{ width: '100%', padding: '0.4rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                            value={editedData.ownerRequests?.consumables?.approxBudgetCurrency || 'CAD'}
                                            onChange={(e) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, consumables: { ...editedData.ownerRequests?.consumables, approxBudgetCurrency: e.target.value } } })}
                                        >
                                            <option value="CAD">CAD</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* 4. BBQ */}
                            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>{t('owner_req.bbq.title')}</h4>
                                <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                        <input type="checkbox" checked={editedData.ownerRequests?.bbq?.hasPropane} onChange={(e) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, bbq: { ...editedData.ownerRequests?.bbq, hasPropane: e.target.checked } } })} /> {t('owner_req.bbq.propane')}
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                        <input type="checkbox" checked={editedData.ownerRequests?.bbq?.hasGauge} onChange={(e) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, bbq: { ...editedData.ownerRequests?.bbq, hasGauge: e.target.checked } } })} /> {t('owner_req.bbq.gauge')}
                                    </label>
                                </div>
                                <EditRow label={t('owner_req.bbq.procedure')} isTextArea value={editedData.ownerRequests?.bbq?.emptyBottleProcedure} onChange={(v) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, bbq: { ...editedData.ownerRequests?.bbq, emptyBottleProcedure: v } } })} />
                            </div>

                            {/* 5. Emergency Kit */}
                            <div style={{ borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>{t('owner_req.emergency.title')}</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <input type="checkbox" checked={editedData.ownerRequests?.emergencyKit?.hasKit} onChange={(e) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, emergencyKit: { ...editedData.ownerRequests?.emergencyKit, hasKit: e.target.checked } } })} />
                                    <span style={{ fontSize: '0.9rem' }}>{t('owner_req.emergency.presence')}</span>
                                </div>
                                <div style={{ marginBottom: '0.75rem' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>{t('owner_req.emergency.content')}</p>
                                    <div style={{ display: 'flex', gap: '1rem' }}>
                                        {['first_aid', 'flashlight', 'batteries'].map(k => (
                                            <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={(editedData.ownerRequests?.emergencyKit?.kitContents || []).includes(k)}
                                                    onChange={(e) => {
                                                        const current = editedData.ownerRequests?.emergencyKit?.kitContents || [];
                                                        const updated = e.target.checked ? [...current, k] : current.filter((x: string) => x !== k);
                                                        setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, emergencyKit: { ...editedData.ownerRequests?.emergencyKit, kitContents: updated } } });
                                                    }}
                                                /> {t(`owner_req.emergency.${k}`)}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                                <EditRow label={t('owner_req.emergency.location')} value={editedData.ownerRequests?.emergencyKit?.kitLocation} onChange={(v) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, emergencyKit: { ...editedData.ownerRequests?.emergencyKit, kitLocation: v } } })} />
                            </div>

                            {/* 7. Expense Auth */}
                            <div>
                                <h4 style={{ fontSize: '0.9rem', color: '#666', marginBottom: '0.5rem' }}>{t('owner_req.expense.title')}</h4>
                                <EditRow label={t('owner_req.expense.max_amount')} type="number" value={editedData.ownerRequests?.expenseAuth?.maxAmountNoValidation} onChange={(v) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, expenseAuth: { ...editedData.ownerRequests?.expenseAuth, maxAmountNoValidation: parseFloat(v) } } })} />
                                <EditRow label={t('owner_req.expense.types')} isTextArea value={editedData.ownerRequests?.expenseAuth?.allowedExpenseTypes} onChange={(v) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, expenseAuth: { ...editedData.ownerRequests?.expenseAuth, allowedExpenseTypes: v } } })} />
                                <EditRow label={t('owner_req.expense.comm_mode')} value={editedData.ownerRequests?.expenseAuth?.preferredCommMode} onChange={(v) => setEditedData({ ...editedData, ownerRequests: { ...editedData.ownerRequests, expenseAuth: { ...editedData.ownerRequests?.expenseAuth, preferredCommMode: v } } })} />
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Spa */}
                            {data.ownerRequests?.spa && (
                                <div>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t('owner_req.spa.title')}</h4>
                                    <Row label={t('owner_req.spa.treatment')} value={data.ownerRequests.spa.treatmentType} />
                                    <Row label={t('owner_req.spa.products')} value={data.ownerRequests.spa.productsUsed} />
                                    <Row label={t('owner_req.spa.location')} value={data.ownerRequests.spa.productsLocation} />
                                    <Row label={t('owner_req.spa.contract')} value={data.ownerRequests.spa.hasMaintenanceContract ? 'Yes' : 'No'} />
                                </div>
                            )}

                            {/* Bedding */}
                            {data.ownerRequests?.bedding && (
                                <div>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t('owner_req.bedding.title')}</h4>
                                    <Row label={t('owner_req.bedding.protection')} value={data.ownerRequests.bedding.hasProtection ? 'Yes' : 'No'} />
                                    <Row label={t('owner_req.bedding.pillows')} value={data.ownerRequests.bedding.pillowsCount} />
                                    <Row label={t('owner_req.bedding.blankets')} value={data.ownerRequests.bedding.blanketsCount} />
                                    <Row label={t('owner_req.bedding.exchange')} value={data.ownerRequests.bedding.hasExchangeLinen ? 'Yes' : 'No'} />
                                </div>
                            )}

                            {/* Consumables */}
                            {data.ownerRequests?.consumables && (
                                <div>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t('owner_req.consumables.title')}</h4>
                                    <Row label={t('owner_req.consumables.products')} value={data.ownerRequests.consumables.productsProvided} />
                                    <Row label={t('owner_req.consumables.refill')} value={data.ownerRequests.consumables.whoRefills} />
                                    <Row
                                        label={t('owner_req.consumables.budget')}
                                        value={`${data.ownerRequests.consumables.approxBudget ?? 0} ${data.ownerRequests.consumables.approxBudgetCurrency || 'CAD'}`}
                                    />
                                </div>
                            )}

                            {/* BBQ */}
                            {data.ownerRequests?.bbq && (
                                <div>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t('owner_req.bbq.title')}</h4>
                                    <Row label={t('owner_req.bbq.propane')} value={data.ownerRequests.bbq.hasPropane ? 'Yes' : 'No'} />
                                    <Row label={t('owner_req.bbq.gauge')} value={data.ownerRequests.bbq.hasGauge ? 'Yes' : 'No'} />
                                    <Row label={t('owner_req.bbq.procedure')} value={data.ownerRequests.bbq.emptyBottleProcedure} />
                                </div>
                            )}

                            {/* Emergency */}
                            {data.ownerRequests?.emergencyKit && (
                                <div>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t('owner_req.emergency.title')}</h4>
                                    <Row label={t('owner_req.emergency.presence')} value={data.ownerRequests.emergencyKit.hasKit ? 'Yes' : 'No'} />
                                    <Row label={t('owner_req.emergency.content')} value={data.ownerRequests.emergencyKit.kitContents?.map((k: string) => t(`owner_req.emergency.${k}`)).join(', ')} />
                                    <Row label={t('owner_req.emergency.location')} value={data.ownerRequests.emergencyKit.kitLocation} />
                                </div>
                            )}

                            {/* Expense */}
                            {data.ownerRequests?.expenseAuth && (
                                <div>
                                    <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{t('owner_req.expense.title')}</h4>
                                    <Row label={t('owner_req.expense.max_amount')} value={data.ownerRequests.expenseAuth.maxAmountNoValidation ? `$${data.ownerRequests.expenseAuth.maxAmountNoValidation}` : 'N/A'} />
                                    <Row label={t('owner_req.expense.types')} value={data.ownerRequests.expenseAuth.allowedExpenseTypes} />
                                    <Row label={t('owner_req.expense.comm_mode')} value={data.ownerRequests.expenseAuth.preferredCommMode} />
                                </div>
                            )}
                        </div>
                    )}
                </Section>

                <Section
                    title={t('admin.details.section.payment')}
                    isEditing={isEditing === 'payment'}
                    onEdit={() => setIsEditing('payment')}
                    onSave={() => handleSave('payment')}
                    onCancel={handleCancel}
                >
                    {isEditing === 'payment' ? (
                        <>
                            <EditRow label={t('payment.bank')} value={editedData.payment?.bankName} onChange={(v) => setEditedData({ ...editedData, payment: { ...editedData.payment, bankName: v } })} />
                            <EditRow label={t('payment.holder')} value={editedData.payment?.accountHolder} onChange={(v) => setEditedData({ ...editedData, payment: { ...editedData.payment, accountHolder: v } })} />
                            <EditRow label={t('payment.account')} value={editedData.payment?.accountNumber} onChange={(v) => setEditedData({ ...editedData, payment: { ...editedData.payment, accountNumber: v } })} />
                            <EditRow label={t('payment.institution')} value={editedData.payment?.transitInstitution || editedData.payment?.routingNumber} onChange={(v) => setEditedData({ ...editedData, payment: { ...editedData.payment, transitInstitution: v, routingNumber: v } })} />
                            <EditRow label={t('payment.branch')} value={editedData.payment?.branchNumber} onChange={(v) => setEditedData({ ...editedData, payment: { ...editedData.payment, branchNumber: v } })} />
                            <EditRow label={t('step.comments_label')} value={editedData.payment?.comments} isTextArea onChange={(v) => setEditedData({ ...editedData, payment: { ...editedData.payment, comments: v } })} />
                        </>
                    ) : (
                        <>
                            <Row label={t('payment.bank')} value={data.payment?.bankName} />
                            <Row label={t('payment.holder')} value={data.payment?.accountHolder} />
                            <Row label={t('payment.account')} value={data.payment?.accountNumber} />
                            <Row label={t('payment.institution')} value={data.payment?.transitInstitution || data.payment?.routingNumber} />
                            <Row label={t('payment.branch')} value={data.payment?.branchNumber} />
                            <Row label={t('step.comments_label')} value={data.payment?.comments} />
                        </>
                    )}
                </Section>




                <Section
                    title={t('admin.details.section.guide')}
                    isEditing={isEditing === 'guide'}
                    onEdit={() => setIsEditing('guide')}
                    onSave={() => handleSave('guide')}
                    onCancel={handleCancel}
                >
                    {isEditing === 'guide' ? (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>{t('admin.details.guide.wifi')}</h4>
                                <EditRow label={t('admin.details.guide.wifi')} value={editedData.guide?.wifiDetails} isTextArea onChange={(v) => setEditedData({ ...editedData, guide: { ...editedData.guide, wifiDetails: v } })} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>{t('admin.details.guide.luggage')}</h4>
                                <EditRow label={t('admin.details.guide.luggage')} value={editedData.guide?.luggageList} isTextArea onChange={(v) => setEditedData({ ...editedData, guide: { ...editedData.guide, luggageList: v } })} />
                            </div>
                            <EditRow label={t('admin.details.guide.emergency')} value={editedData.guide?.emergencyContacts} isTextArea onChange={(v) => setEditedData({ ...editedData, guide: { ...editedData.guide, emergencyContacts: v } })} />
                            <EditRow label={t('step.comments_label')} value={editedData.guide?.comments} isTextArea onChange={(v) => setEditedData({ ...editedData, guide: { ...editedData.guide, comments: v } })} />
                        </>
                    ) : (
                        <>
                            {/* Wi-Fi */}
                            <div style={{ marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>{t('admin.details.guide.wifi')}</h4>
                                <Row label={t('admin.details.access.instructions')} value={data.guide?.wifiDetails || 'None'} />
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    {data.guide?.wifiRouterPhoto && (
                                        <a href={data.guide.wifiRouterPhoto} target="_blank" style={{ color: 'blue', fontSize: '0.85rem' }}>📷 {t('admin.details.guide.router')}</a>
                                    )}
                                    {data.guide?.wifiSpeedTestScreenshot && (
                                        <a href={data.guide.wifiSpeedTestScreenshot} target="_blank" style={{ color: 'blue', fontSize: '0.85rem' }}>📷 {t('admin.details.guide.speedtest')}</a>
                                    )}
                                </div>
                            </div>

                            {/* Security */}
                            <div style={{ marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>{t('guide.checkin')}</h4>
                                {data.guide?.lockVideoUrl && (
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.85rem' }}>🎥 {t('admin.details.guide.lock_video')}: </span>
                                        <a href={data.guide.lockVideoUrl} target="_blank" style={{ color: 'blue' }}>{t('admin.props.view')}</a>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {data.guide?.lockPhoto && (
                                        <a href={data.guide.lockPhoto} target="_blank" style={{ color: 'blue', fontSize: '0.85rem' }}>📷 {t('admin.details.guide.lock_photo')}</a>
                                    )}
                                    {data.guide?.firstAidKitPhoto && (
                                        <a href={data.guide.firstAidKitPhoto} target="_blank" style={{ color: 'blue', fontSize: '0.85rem' }}>📷 {t('admin.details.guide.first_aid')}</a>
                                    )}
                                </div>
                            </div>

                            {/* Kitchen */}
                            {data.guide?.kitchenPhotos && data.guide.kitchenPhotos.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>{t('admin.details.guide.kitchen')} ({data.guide.kitchenPhotos.length})</h4>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {data.guide.kitchenPhotos.map((url: string, i: number) => (
                                            <a key={i} href={url} target="_blank" style={{ color: 'blue', fontSize: '0.85rem' }}>{t('photos.zone.kitchen')} {i + 1}</a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AC */}
                            {data.guide?.acVideoUrl && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>{t('admin.details.guide.ac')}</h4>
                                    <a href={data.guide.acVideoUrl} target="_blank" style={{ color: 'blue' }}>🎥 {t('admin.props.view')}</a>
                                </div>
                            )}

                            {/* Extras */}
                            {data.guide?.extrasPhotos && data.guide.extrasPhotos.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>{t('admin.details.guide.extras')} ({data.guide.extrasPhotos.length})</h4>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {data.guide.extrasPhotos.map((url: string, i: number) => (
                                            <a key={i} href={url} target="_blank" style={{ color: 'blue', fontSize: '0.85rem' }}>{t('admin.details.guide.extras')} {i + 1}</a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Luggage List */}
                            {data.guide?.luggageList && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>🎒 {t('admin.details.guide.luggage')}</h4>
                                    <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{data.guide.luggageList}</p>
                                </div>
                            )}

                            {/* General */}
                            <div style={{ marginTop: '1rem' }}>
                                <Row label={t('admin.details.guide.emergency')} value={data.guide?.emergencyContacts || 'None'} />
                                {data.guide?.tourVideo && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <span style={{ fontSize: '0.85rem' }}>🎥 {t('admin.details.guide.tour')}: </span>
                                        <a href={data.guide.tourVideo} target="_blank" style={{ color: 'blue' }}>{t('admin.props.view')}</a>
                                    </div>
                                )}
                            </div>
                            <Row label={t('step.comments_label')} value={data.guide?.comments} />
                        </>
                    )}
                </Section>

                <Section
                    title={t('admin.details.section.access')}
                    isEditing={isEditing === 'access'}
                    onEdit={() => setIsEditing('access')}
                    onSave={() => handleSave('access')}
                    onCancel={handleCancel}
                >
                    {isEditing === 'access' ? (
                        <>
                            <EditRow label={t('admin.details.access.platforms')} value={editedData.platforms?.join(', ')} onChange={(v) => setEditedData({ ...editedData, platforms: v.split(',').map((s: string) => s.trim()).filter((s: string) => s) })} />
                            {editedData.platforms?.includes('other') && (
                                <EditRow label={t('photos.platforms.other_label')} value={editedData.otherPlatform} onChange={(v) => setEditedData({ ...editedData, otherPlatform: v })} />
                            )}
                            <EditRow label={t('admin.details.access.external')} value={editedData.externalLinks?.join(', ')} isTextArea onChange={(v) => setEditedData({ ...editedData, externalLinks: v.split(',').map((s: string) => s.trim()).filter((s: string) => s) })} />
                            <EditRow label={t('admin.details.access.drive')} value={editedData.googleDriveLink} onChange={(v) => setEditedData({ ...editedData, googleDriveLink: v })} />
                            <EditRow label={t('admin.details.access.instructions')} value={editedData.access?.instructions} isTextArea onChange={(v) => setEditedData({ ...editedData, access: { ...editedData.access, instructions: v } })} />
                            <EditRow label={t('step.comments_label')} value={editedData.photosComments} isTextArea onChange={(v) => setEditedData({ ...editedData, photosComments: v })} />
                        </>
                    ) : (
                        <>
                            <Row label={t('admin.details.access.platforms')} value={data.platforms?.join(' • ') || 'N/A'} />
                            {data.otherPlatform && <Row label={t('photos.platforms.other_label')} value={data.otherPlatform} />}
                            <Row
                                label={t('admin.details.access.citq')}
                                value={data.info?.citqFile ? <a href={data.info.citqFile} target="_blank" style={{ color: 'blue' }}>{t('admin.props.view')} PDF</a> : 'Pending...'}
                            />
                            <Row
                                label={t('admin.details.access.reservations')}
                                value={data.info?.reservationsFile ? <a href={data.info.reservationsFile} target="_blank" style={{ color: 'blue' }}>{t('admin.users.download')} Excel</a> : 'None'}
                            />
                            <Row label={t('admin.details.access.photos')} value={`${data.photos?.length || 0} ${t('profile.uploaded').toLowerCase()}`} />
                            {data.externalLinks && data.externalLinks.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>{t('admin.details.access.external')}</h4>
                                    <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem' }}>
                                        {data.externalLinks.map((link: string, i: number) => (
                                            <li key={i}>
                                                <a href={link} target="_blank" rel="noopener noreferrer" style={{ color: 'blue' }}>{link}</a>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {data.googleDriveLink && (
                                <Row
                                    label={t('admin.details.access.drive')}
                                    value={<a href={data.googleDriveLink} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>{t('photos.drive_link')}</a>}
                                />
                            )}
                            {data.photos && data.photos.length > 0 && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '0.5rem', marginTop: '1rem', marginBottom: '1rem' }}>
                                    {data.photos.map((url: string, i: number) => {
                                        const isPdf = url.toLowerCase().includes('.pdf');
                                        if (isPdf) {
                                            return (
                                                <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    width: '100%', height: '100px', borderRadius: '4px', border: '1px solid #eee',
                                                    background: '#f0f0f0', textDecoration: 'none', color: '#333', fontSize: '0.8rem'
                                                }}>
                                                    📄 {t('photos.zone.plan')}
                                                </a>
                                            );
                                        }
                                        return (
                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                                                <img
                                                    src={url}
                                                    alt={`Property photo ${i + 1}`}
                                                    style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #eee' }}
                                                />
                                            </a>
                                        );
                                    })}
                                </div>
                            )}
                            <Row label={t('admin.details.access.type')} value={data.access?.videoUrl ? 'Video' : 'Text'} />
                            {data.access?.videoUrl && (
                                <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>{t('admin.details.access.type')} Video:</p>
                                    <video src={data.access.videoUrl} controls style={{ width: '100%', borderRadius: '8px', maxHeight: '300px' }} />
                                </div>
                            )}

                            <div style={{ marginTop: '1rem' }}>
                                {data.access?.instructions && (
                                    <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                                        <strong>{t('admin.details.access.instructions')}:</strong>
                                        <p>{data.access?.instructions}</p>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <Row label={t('admin.details.access.tour')} value={data.guide?.tourVideo ? t('profile.uploaded') : 'Pending'} />
                                {data.guide?.tourVideo && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <video src={data.guide.tourVideo} controls style={{ width: '100%', borderRadius: '8px', maxHeight: '300px' }} />
                                    </div>
                                )}
                            </div>
                            <Row label={t('step.comments_label')} value={data.photosComments} />
                        </>
                    )}
                </Section>

                <Section
                    title={t('admin.details.section.contract')}
                >
                    <Row label={t('admin.details.contract.status')} value={data.contract?.status === 'approved' ? t('contract.approve') : (data.contract?.status === 'changes_requested' ? t('contract.request_changes') : 'Pending')} />
                    {data.contract?.comments && (
                        <div style={{ marginTop: '1rem', padding: '1rem', background: '#fff9f0', borderRadius: '8px', border: '1px solid #f59e0b' }}>
                            <strong style={{ fontSize: '0.9rem', color: '#92400e' }}>{t('admin.details.contract.comments')}:</strong>
                            <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem', marginTop: '0.5rem' }}>{data.contract.comments}</p>
                        </div>
                    )}
                    {data.contract?.reviewedAt && (
                        <Row
                            label={t('admin.details.contract.date')}
                            value={new Date(data.contract.reviewedAt).toLocaleString()}
                        />
                    )}
                </Section>
            </div>
        </div>
    );
}

function Section({ title, children, isEditing, onEdit, onSave, onCancel }: { title: string, children: React.ReactNode, isEditing?: boolean, onEdit?: () => void, onSave?: () => void, onCancel?: () => void }) {
    const { t } = useLanguage();
    return (
        <div className={styles.sectionCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>{title}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isEditing ? (
                        <>
                            <Button size="sm" onClick={onSave} style={{ backgroundColor: '#28a745', color: 'white' }}>{t('admin.details.save')}</Button>
                            <Button size="sm" variant="outline" onClick={onCancel}>{t('admin.details.cancel')}</Button>
                        </>
                    ) : (
                        onEdit && <Button size="sm" variant="outline" onClick={onEdit}>{t('admin.details.edit')}</Button>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
}

function Row({ label, value }: { label: string, value?: string | number | React.ReactNode }) {
    if (!value && value !== 0) return null;
    return (
        <div className={styles.row}>
            <span className={styles.label}>{label}</span>
            <span className={styles.value}>{value}</span>
        </div>
    );
}

function EditRow({ label, value, onChange, type = 'text', isTextArea = false }: { label: string, value: any, onChange: (val: any) => void, type?: string, isTextArea?: boolean }) {
    return (
        <div className={styles.row} style={{ alignItems: isTextArea ? 'flex-start' : 'center', marginBottom: '0.75rem' }}>
            <span className={styles.label} style={{ minWidth: '120px' }}>{label}</span>
            {isTextArea ? (
                <textarea
                    style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: '1px solid #ddd', minHeight: '80px', fontSize: '0.9rem' }}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                />
            ) : (
                <input
                    type={type}
                    style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.9rem' }}
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                />
            )}
        </div>
    );
}
