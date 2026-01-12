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
                // router.push('/admin/properties'); // Commented out to see error if any
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
        };

        fetchProperty();
    }, [params.id, router]);

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
                    {/* <Button>Approve Listing</Button> */}
                </div>
            </div>

            <div className={styles.detailsGrid}>
                <Section title="Basic Info">
                    <Row label="Type" value={data.info?.type} />
                    <Row label="Address" value={data.info?.address} />
                    <Row label="Floor" value={data.info?.floorNumber} />
                    <Row label="Size" value={data.info?.size} />
                    <Row label="Rooms" value={`${data.info?.numRooms || 0} bed / ${data.info?.numBathrooms || 0} bath`} />
                    <Row label="Check-in Time" value={data.info?.checkInTime || 'N/A'} />
                    <Row label="Check-out Time" value={data.info?.checkOutTime || 'N/A'} />
                </Section>

                <Section title="Amenities">
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
                </Section>

                <Section title="Rules & Fees">
                    <Row label="Smoking" value={data.rules?.smoking ? 'Yes' : 'No'} />
                    <Row label="Pets" value={data.rules?.pets ? `Yes (Max: ${data.rules.maxPets || 'Any'})` : 'No'} />
                    <Row label="Events" value={data.rules?.events ? 'Yes' : 'No'} />
                    <Row label="Cleaning Fee" value={data.rules?.cleaningFee ? `$${data.rules.cleaningFee}` : '$0'} />
                    <Row label="Security Deposit" value={(data.rules as any)?.securityDeposit ? `$${(data.rules as any).securityDeposit}` : '$0'} />
                    <Row label="Pet Fee" value={(data.rules as any)?.petFee ? `$${(data.rules as any).petFee}` : '$0'} />
                    <Row label="Max Guests" value={data.rules?.maxGuests || 'N/A'} />
                    <Row label="Quiet Hours" value={data.rules?.quietHours || 'None'} />
                </Section>

                <Section title="Payment Details">
                    <Row label="Bank" value={data.payment?.bankName} />
                    <Row label="Holder" value={data.payment?.accountHolder} />
                    <Row label="Account" value={data.payment?.accountNumber} />
                    <Row label="Institution" value={data.payment?.transitInstitution || data.payment?.routingNumber} />
                    <Row label="Branch" value={data.payment?.branchNumber} />
                </Section>



                <Section title="Guest Guide & Luggage">
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

                </Section>

                <Section title="Uploads & Access">
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
                    {/* Explicitly cast value to any because Row expects string|number but we are passing JSX. 
                        Ideally we'd update Row props but this is quicker and JS allows it. 
                        Wait, TS will complain. Let's look at Row definition. 
                        Row values are string | number. 
                        I should update Row definition or just render it directly.
                        Rendering directly is safer.
                    */}
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
                </Section>
            </div>
        </div >
    );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className={styles.sectionCard}>
            <h3 className={styles.sectionTitle}>{title}</h3>
            {children}
        </div>
    );
}

function Row({ label, value }: { label: string, value?: string | number | React.ReactNode }) {
    if (!value) return null;
    return (
        <div className={styles.row}>
            <span className={styles.label}>{label}</span>
            <span className={styles.value}>{value}</span>
        </div>
    );
}
