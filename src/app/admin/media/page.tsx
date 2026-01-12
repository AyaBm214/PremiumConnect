'use client';
import React, { useEffect, useState } from 'react';
import styles from '../dashboard/dashboard.module.css';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface MediaItem {
    url: string;
    propertyId: string;
    propertyName: string;
}

export default function MediaPage() {
    const supabase = createClient();
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMedia = async () => {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .order('updated_at', { ascending: false });

            if (data) {
                const items: MediaItem[] = [];
                data.forEach(p => {
                    const photos: string[] = p.data.photos || [];
                    photos.forEach(url => {
                        items.push({
                            url,
                            propertyId: p.id,
                            propertyName: p.name || p.data.info?.propertyName || 'Untitled'
                        });
                    });
                });
                setMedia(items);
            }
            setLoading(false);
        };
        fetchMedia();
    }, []);

    return (
        <div>
            <h1 className={styles.title}>Media Library</h1>
            <p style={{ marginBottom: '2rem', color: '#666' }}>
                All photos from property listings ({media.length} items)
            </p>

            {loading ? (
                <div>Loading...</div>
            ) : media.length === 0 ? (
                <div className={styles.section}>
                    <p className={styles.placeholder}>No photos uploaded yet.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                    {media.map((item, i) => (
                        <div key={i} style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                            <img
                                src={item.url}
                                alt="Property"
                                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                            />
                            <div style={{ padding: '0.5rem', fontSize: '0.8rem', background: '#f8f9fa' }}>
                                <Link href={`/admin/properties/${item.propertyId}`} style={{ color: 'blue', textDecoration: 'none' }}>
                                    {item.propertyName}
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
