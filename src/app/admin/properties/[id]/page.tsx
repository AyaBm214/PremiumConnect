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

export default function PropertyDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<Property | null>(null);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editedData, setEditedData] = useState<any>(null);
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
                    <Button variant="outline" onClick={() => {
                        // Open all photos in new tabs
                        if (data.photos?.length) {
                            data.photos.forEach((url: string) => window.open(url, '_blank'));
                        } else {
                            alert('No photos to download');
                        }
                    }}>{t('admin.details.download_media')}</Button>
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
                            <EditRow label={t('admin.details.info.type')} value={editedData.info?.type} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, type: v } })} />
                            <EditRow label={t('admin.details.info.address')} value={editedData.info?.address} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, address: v } })} />
                            <EditRow label={t('admin.details.info.floor')} value={editedData.info?.floorNumber} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, floorNumber: v } })} />
                            <EditRow label={t('admin.details.info.size')} value={editedData.info?.size} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, size: v } })} />
                            <EditRow label={t('admin.details.info.rooms')} value={editedData.info?.numRooms} type="number" onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, numRooms: parseInt(v) } })} />
                            <EditRow label={t('admin.details.info.rooms')} value={editedData.info?.numBathrooms} type="number" onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, numBathrooms: parseInt(v) } })} />
                            <EditRow label={t('admin.details.info.checkin')} value={editedData.info?.checkInTime} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, checkInTime: v } })} />
                            <EditRow label={t('admin.details.info.checkout')} value={editedData.info?.checkOutTime} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, checkOutTime: v } })} />
                        </>
                    ) : (
                        <>
                            <Row label={t('admin.details.info.type')} value={data.info?.type} />
                            <Row label={t('admin.details.info.address')} value={data.info?.address} />
                            <Row label={t('admin.details.info.floor')} value={data.info?.floorNumber} />
                            <Row label={t('admin.details.info.size')} value={data.info?.size} />
                            <Row label={t('admin.details.info.rooms')} value={`${data.info?.numRooms || 0} ${t('admin.details.info.bed')} / ${data.info?.numBathrooms || 0} ${t('admin.details.info.bath')}`} />
                            <Row label={t('admin.details.info.checkin')} value={data.info?.checkInTime || 'N/A'} />
                            <Row label={t('admin.details.info.checkout')} value={data.info?.checkOutTime || 'N/A'} />
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
                        </>
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
                        </>
                    ) : (
                        <>
                            <Row label={t('payment.bank')} value={data.payment?.bankName} />
                            <Row label={t('payment.holder')} value={data.payment?.accountHolder} />
                            <Row label={t('payment.account')} value={data.payment?.accountNumber} />
                            <Row label={t('payment.institution')} value={data.payment?.transitInstitution || data.payment?.routingNumber} />
                            <Row label={t('payment.branch')} value={data.payment?.branchNumber} />
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
                            <EditRow label={t('admin.details.access.external')} value={editedData.externalLinks?.join(', ')} isTextArea onChange={(v) => setEditedData({ ...editedData, externalLinks: v.split(',').map((s: string) => s.trim()).filter((s: string) => s) })} />
                            <EditRow label={t('admin.details.access.drive')} value={editedData.googleDriveLink} onChange={(v) => setEditedData({ ...editedData, googleDriveLink: v })} />
                            <EditRow label={t('admin.details.access.instructions')} value={editedData.access?.instructions} isTextArea onChange={(v) => setEditedData({ ...editedData, access: { ...editedData.access, instructions: v } })} />
                        </>
                    ) : (
                        <>
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
