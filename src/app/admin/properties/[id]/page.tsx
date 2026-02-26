'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { generatePropertyPDF } from '@/lib/pdf';
import { Property } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import styles from '../properties.module.css';

export default function PropertyDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const [property, setProperty] = useState<Property | null>(null);
    const [isEditing, setIsEditing] = useState<string | null>(null);
    const [editedData, setEditedData] = useState<any>(null);
    const supabase = createClient();

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

        const { error } = await supabase
            .from('properties')
            .update({ data: editedData })
            .eq('id', property.id);

        if (error) {
            alert('Error updating property: ' + error.message);
            return;
        }

        setProperty({ ...property, data: editedData });
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
                        <Button variant="ghost">← Back</Button>
                    </Link>
                    <div>
                        <h1 className={styles.title}>{data.info?.propertyName || 'Untitled'}</h1>
                        <p className={styles.propId}>Owner ID: {property.ownerId}</p>
                        {data.payment?.accountHolder && (
                            <p className={styles.propId} style={{ marginTop: '0.25rem', fontWeight: 'bold' }}>Client: {data.payment.accountHolder}</p>
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
                    }}>Download All Media</Button>
                    <Button variant="outline" onClick={() => generatePropertyPDF(property)}>Download PDF</Button>
                    <Button
                        style={{ backgroundColor: '#dc3545', color: 'white', border: 'none' }}
                        onClick={async () => {
                            if (confirm('Are you sure you want to delete this property? This action cannot be undone.')) {
                                const { error } = await supabase.from('properties').delete().eq('id', property.id);
                                if (error) {
                                    alert('Error deleting property');
                                    console.error(error);
                                } else {
                                    alert('Property deleted successfully');
                                    router.push('/admin/properties');
                                }
                            }
                        }}
                    >
                        Delete Property
                    </Button>
                </div>
            </div>

            <div className={styles.detailsGrid}>
                <Section
                    title="Basic Info"
                    isEditing={isEditing === 'info'}
                    onEdit={() => setIsEditing('info')}
                    onSave={() => handleSave('info')}
                    onCancel={handleCancel}
                >
                    {isEditing === 'info' ? (
                        <>
                            <EditRow label="Property Name" value={editedData.info?.propertyName} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, propertyName: v } })} />
                            <EditRow label="Type" value={editedData.info?.type} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, type: v } })} />
                            <EditRow label="Address" value={editedData.info?.address} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, address: v } })} />
                            <EditRow label="Floor" value={editedData.info?.floorNumber} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, floorNumber: v } })} />
                            <EditRow label="Size" value={editedData.info?.size} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, size: v } })} />
                            <EditRow label="Num Rooms" value={editedData.info?.numRooms} type="number" onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, numRooms: parseInt(v) } })} />
                            <EditRow label="Num Bathrooms" value={editedData.info?.numBathrooms} type="number" onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, numBathrooms: parseInt(v) } })} />
                            <EditRow label="Check-in" value={editedData.info?.checkInTime} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, checkInTime: v } })} />
                            <EditRow label="Check-out" value={editedData.info?.checkOutTime} onChange={(v) => setEditedData({ ...editedData, info: { ...editedData.info, checkOutTime: v } })} />
                        </>
                    ) : (
                        <>
                            <Row label="Type" value={data.info?.type} />
                            <Row label="Address" value={data.info?.address} />
                            <Row label="Floor" value={data.info?.floorNumber} />
                            <Row label="Size" value={data.info?.size} />
                            <Row label="Rooms" value={`${data.info?.numRooms || 0} bed / ${data.info?.numBathrooms || 0} bath`} />
                            <Row label="Check-in Time" value={data.info?.checkInTime || 'N/A'} />
                            <Row label="Check-out Time" value={data.info?.checkOutTime || 'N/A'} />
                        </>
                    )}
                </Section>

                <Section
                    title="Amenities"
                    isEditing={isEditing === 'amenities'}
                    onEdit={() => setIsEditing('amenities')}
                    onSave={() => handleSave('amenities')}
                    onCancel={handleCancel}
                >
                    {isEditing === 'amenities' ? (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.5rem' }}>Comma separated list:</p>
                                <textarea
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', minHeight: '100px' }}
                                    value={editedData.amenities?.join(', ') || ''}
                                    onChange={(e) => setEditedData({ ...editedData, amenities: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                                />
                            </div>
                            <EditRow label="Pool Opening" value={editedData.poolOpeningDate} onChange={(v) => setEditedData({ ...editedData, poolOpeningDate: v })} />
                            <EditRow label="Hot Tub Opening" value={editedData.hotTubOpeningDate} onChange={(v) => setEditedData({ ...editedData, hotTubOpeningDate: v })} />
                        </>
                    ) : (
                        <>
                            <div className={styles.tags}>
                                {data.amenities?.map((a: string) => (
                                    <span key={a} className={styles.tag}>{a}</span>
                                ))}
                            </div>
                            {data.poolOpeningDate && (
                                <div style={{ marginTop: '1rem' }}>
                                    <Row label="Pool Opening Date" value={data.poolOpeningDate} />
                                </div>
                            )}
                            {data.hotTubOpeningDate && (
                                <div style={{ marginTop: '1rem' }}>
                                    <Row label="Hot Tub Opening Date" value={data.hotTubOpeningDate} />
                                </div>
                            )}
                        </>
                    )}
                </Section>

                <Section
                    title="Rules & Fees"
                    isEditing={isEditing === 'rules'}
                    onEdit={() => setIsEditing('rules')}
                    onSave={() => handleSave('rules')}
                    onCancel={handleCancel}
                >
                    {isEditing === 'rules' ? (
                        <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <input type="checkbox" checked={editedData.rules?.smoking} onChange={(e) => setEditedData({ ...editedData, rules: { ...editedData.rules, smoking: e.target.checked } })} /> Smoking
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <input type="checkbox" checked={editedData.rules?.pets} onChange={(e) => setEditedData({ ...editedData, rules: { ...editedData.rules, pets: e.target.checked } })} /> Pets
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                                    <input type="checkbox" checked={editedData.rules?.events} onChange={(e) => setEditedData({ ...editedData, rules: { ...editedData.rules, events: e.target.checked } })} /> Events
                                </label>
                            </div>
                            <EditRow label="Max Pets" value={editedData.rules?.maxPets} type="number" onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, maxPets: v } })} />
                            <EditRow label="Cleaning Fee" value={editedData.rules?.cleaningFee} type="number" onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, cleaningFee: v } })} />
                            <EditRow label="Security Deposit" value={editedData.rules?.securityDeposit} type="number" onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, securityDeposit: v } })} />
                            <EditRow label="Pet Fee" value={editedData.rules?.petFee} type="number" onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, petFee: v } })} />
                            <EditRow label="Max Guests" value={editedData.rules?.maxGuests} type="number" onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, maxGuests: v } })} />
                            <EditRow label="Quiet Hours" value={editedData.rules?.quietHours} onChange={(v) => setEditedData({ ...editedData, rules: { ...editedData.rules, quietHours: v } })} />
                        </>
                    ) : (
                        <>
                            <Row label="Smoking" value={data.rules?.smoking ? 'Yes' : 'No'} />
                            <Row label="Pets" value={data.rules?.pets ? `Yes (Max: ${data.rules.maxPets || 'Any'})` : 'No'} />
                            <Row label="Events" value={data.rules?.events ? 'Yes' : 'No'} />
                            <Row label="Cleaning Fee" value={data.rules?.cleaningFee ? `$${data.rules.cleaningFee}` : '$0'} />
                            <Row label="Security Deposit" value={(data.rules as any)?.securityDeposit ? `$${(data.rules as any).securityDeposit}` : '$0'} />
                            <Row label="Pet Fee" value={(data.rules as any)?.petFee ? `$${(data.rules as any).petFee}` : '$0'} />
                            <Row label="Max Guests" value={data.rules?.maxGuests || 'N/A'} />
                            <Row label="Quiet Hours" value={data.rules?.quietHours || 'None'} />
                        </>
                    )}
                </Section>

                <Section
                    title="Payment Details"
                    isEditing={isEditing === 'payment'}
                    onEdit={() => setIsEditing('payment')}
                    onSave={() => handleSave('payment')}
                    onCancel={handleCancel}
                >
                    {isEditing === 'payment' ? (
                        <>
                            <EditRow label="Bank" value={editedData.payment?.bankName} onChange={(v) => setEditedData({ ...editedData, payment: { ...editedData.payment, bankName: v } })} />
                            <EditRow label="Holder" value={editedData.payment?.accountHolder} onChange={(v) => setEditedData({ ...editedData, payment: { ...editedData.payment, accountHolder: v } })} />
                            <EditRow label="Account" value={editedData.payment?.accountNumber} onChange={(v) => setEditedData({ ...editedData, payment: { ...editedData.payment, accountNumber: v } })} />
                            <EditRow label="Institution/Routing" value={editedData.payment?.transitInstitution || editedData.payment?.routingNumber} onChange={(v) => setEditedData({ ...editedData, payment: { ...editedData.payment, transitInstitution: v, routingNumber: v } })} />
                            <EditRow label="Branch" value={editedData.payment?.branchNumber} onChange={(v) => setEditedData({ ...editedData, payment: { ...editedData.payment, branchNumber: v } })} />
                        </>
                    ) : (
                        <>
                            <Row label="Bank" value={data.payment?.bankName} />
                            <Row label="Holder" value={data.payment?.accountHolder} />
                            <Row label="Account" value={data.payment?.accountNumber} />
                            <Row label="Institution" value={data.payment?.transitInstitution || data.payment?.routingNumber} />
                            <Row label="Branch" value={data.payment?.branchNumber} />
                        </>
                    )}
                </Section>




                <Section
                    title="Guest Guide & Luggage"
                    isEditing={isEditing === 'guide'}
                    onEdit={() => setIsEditing('guide')}
                    onSave={() => handleSave('guide')}
                    onCancel={handleCancel}
                >
                    {isEditing === 'guide' ? (
                        <>
                            <div style={{ marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>Wi-Fi</h4>
                                <EditRow label="Wi-Fi Details" value={editedData.guide?.wifiDetails} isTextArea onChange={(v) => setEditedData({ ...editedData, guide: { ...editedData.guide, wifiDetails: v } })} />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>Luggage List</h4>
                                <EditRow label="Luggage List" value={editedData.guide?.luggageList} isTextArea onChange={(v) => setEditedData({ ...editedData, guide: { ...editedData.guide, luggageList: v } })} />
                            </div>
                            <EditRow label="Emergency Contacts" value={editedData.guide?.emergencyContacts} isTextArea onChange={(v) => setEditedData({ ...editedData, guide: { ...editedData.guide, emergencyContacts: v } })} />
                        </>
                    ) : (
                        <>
                            {/* Wi-Fi */}
                            <div style={{ marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>Wi-Fi</h4>
                                <Row label="Details" value={data.guide?.wifiDetails || 'None'} />
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                                    {data.guide?.wifiRouterPhoto && (
                                        <a href={data.guide.wifiRouterPhoto} target="_blank" style={{ color: 'blue', fontSize: '0.85rem' }}>📷 Router Photo</a>
                                    )}
                                    {data.guide?.wifiSpeedTestScreenshot && (
                                        <a href={data.guide.wifiSpeedTestScreenshot} target="_blank" style={{ color: 'blue', fontSize: '0.85rem' }}>📷 Speed Test</a>
                                    )}
                                </div>
                            </div>

                            {/* Security */}
                            <div style={{ marginBottom: '1rem' }}>
                                <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>Check-in & Security</h4>
                                {data.guide?.lockVideoUrl && (
                                    <div style={{ marginBottom: '0.5rem' }}>
                                        <span style={{ fontSize: '0.85rem' }}>🎥 Lock Video: </span>
                                        <a href={data.guide.lockVideoUrl} target="_blank" style={{ color: 'blue' }}>View</a>
                                    </div>
                                )}
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    {data.guide?.lockPhoto && (
                                        <a href={data.guide.lockPhoto} target="_blank" style={{ color: 'blue', fontSize: '0.85rem' }}>📷 Lock/KeyBox</a>
                                    )}
                                    {data.guide?.firstAidKitPhoto && (
                                        <a href={data.guide.firstAidKitPhoto} target="_blank" style={{ color: 'blue', fontSize: '0.85rem' }}>📷 First Aid Kit</a>
                                    )}
                                </div>
                            </div>

                            {/* Kitchen */}
                            {data.guide?.kitchenPhotos && data.guide.kitchenPhotos.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>Kitchen ({data.guide.kitchenPhotos.length})</h4>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {data.guide.kitchenPhotos.map((url: string, i: number) => (
                                            <a key={i} href={url} target="_blank" style={{ color: 'blue', fontSize: '0.85rem' }}>Photo {i + 1}</a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* AC */}
                            {data.guide?.acVideoUrl && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>AC Instructions</h4>
                                    <a href={data.guide.acVideoUrl} target="_blank" style={{ color: 'blue' }}>🎥 View AC Video</a>
                                </div>
                            )}

                            {/* Extras */}
                            {data.guide?.extrasPhotos && data.guide.extrasPhotos.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>Extras ({data.guide.extrasPhotos.length})</h4>
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        {data.guide.extrasPhotos.map((url: string, i: number) => (
                                            <a key={i} href={url} target="_blank" style={{ color: 'blue', fontSize: '0.85rem' }}>Extra {i + 1}</a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Luggage List */}
                            {data.guide?.luggageList && (
                                <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>🎒 Host Luggage List</h4>
                                    <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>{data.guide.luggageList}</p>
                                </div>
                            )}

                            {/* General */}
                            <div style={{ marginTop: '1rem' }}>
                                <Row label="Emergency Contacts" value={data.guide?.emergencyContacts || 'None'} />
                                {data.guide?.tourVideo && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <span style={{ fontSize: '0.85rem' }}>🎥 General Tour: </span>
                                        <a href={data.guide.tourVideo} target="_blank" style={{ color: 'blue' }}>View</a>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Section>

                <Section
                    title="Uploads & Access"
                    isEditing={isEditing === 'access'}
                    onEdit={() => setIsEditing('access')}
                    onSave={() => handleSave('access')}
                    onCancel={handleCancel}
                >
                    {isEditing === 'access' ? (
                        <>
                            <EditRow label="External Links (Comma separated)" value={editedData.externalLinks?.join(', ')} isTextArea onChange={(v) => setEditedData({ ...editedData, externalLinks: v.split(',').map((s: string) => s.trim()).filter((s: string) => s) })} />
                            <EditRow label="Google Drive Link" value={editedData.googleDriveLink} onChange={(v) => setEditedData({ ...editedData, googleDriveLink: v })} />
                            <EditRow label="Access Instructions" value={editedData.access?.instructions} isTextArea onChange={(v) => setEditedData({ ...editedData, access: { ...editedData.access, instructions: v } })} />
                        </>
                    ) : (
                        <>
                            <Row
                                label="CITQ"
                                value={data.info?.citqFile ? <a href={data.info.citqFile} target="_blank" style={{ color: 'blue' }}>View PDF</a> : 'Pending...'}
                            />
                            <Row
                                label="Reservations (Excel)"
                                value={data.info?.reservationsFile ? <a href={data.info.reservationsFile} target="_blank" style={{ color: 'blue' }}>Download Excel</a> : 'None'}
                            />
                            <Row label="Photos" value={`${data.photos?.length || 0} uploaded`} />
                            {data.externalLinks && data.externalLinks.length > 0 && (
                                <div style={{ marginBottom: '1rem' }}>
                                    <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem', color: '#666' }}>Past Listing URLs</h4>
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
                                    label="Google Drive"
                                    value={<a href={data.googleDriveLink} target="_blank" rel="noopener noreferrer" style={{ color: 'blue', textDecoration: 'underline' }}>Open Folder</a>}
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
                                                    📄 PDF Plan
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
                            <Row label="Access Type" value={data.access?.videoUrl ? 'Video' : 'Text'} />
                            {data.access?.videoUrl && (
                                <div style={{ marginTop: '0.5rem', marginBottom: '1rem' }}>
                                    <p style={{ fontSize: '0.9rem', marginBottom: '0.25rem' }}>Access Video:</p>
                                    <video src={data.access.videoUrl} controls style={{ width: '100%', borderRadius: '8px', maxHeight: '300px' }} />
                                </div>
                            )}

                            <div style={{ marginTop: '1rem' }}>
                                {data.access?.instructions && (
                                    <div style={{ padding: '1rem', background: '#f8f9fa', borderRadius: '8px' }}>
                                        <strong>Instructions:</strong>
                                        <p>{data.access?.instructions}</p>
                                    </div>
                                )}
                            </div>

                            <div style={{ marginTop: '1rem' }}>
                                <Row label="Tour Video" value={data.guide?.tourVideo ? 'Uploaded' : 'Pending'} />
                                {data.guide?.tourVideo && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                        <video src={data.guide.tourVideo} controls style={{ width: '100%', borderRadius: '8px', maxHeight: '300px' }} />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </Section>

            </div>
        </div >
    );
}

function Section({ title, children, isEditing, onEdit, onSave, onCancel }: { title: string, children: React.ReactNode, isEditing?: boolean, onEdit?: () => void, onSave?: () => void, onCancel?: () => void }) {
    return (
        <div className={styles.sectionCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>
                <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>{title}</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isEditing ? (
                        <>
                            <Button size="sm" onClick={onSave} style={{ backgroundColor: '#28a745', color: 'white' }}>Save</Button>
                            <Button size="sm" variant="outline" onClick={onCancel}>Cancel</Button>
                        </>
                    ) : (
                        onEdit && <Button size="sm" variant="outline" onClick={onEdit}>Edit</Button>
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
