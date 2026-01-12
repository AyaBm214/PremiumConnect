import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { FileUploader } from '@/components/ui/FileUploader';
import { Input } from '@/components/ui/Input';
import { Property } from '@/lib/types';
import styles from './Step.module.css';

import { createClient } from '@/lib/supabase/client';

interface Step4Props {
    propertyId: string;
    data?: Property['data']['access'];
    onUpdate: (data: any) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function Step4Access({ propertyId, data, onUpdate, onNext, onBack }: Step4Props) {
    const [instructions, setInstructions] = useState(data?.instructions || '');
    const [uploading, setUploading] = useState(false);
    const supabase = createClient();

    const handleChange = (val: string) => {
        setInstructions(val);
        onUpdate({ ...data, instructions: val });
    };

    const handleVideoUpload = async (files: File[]) => {
        if (!files.length) return;
        setUploading(true);
        try {
            const file = files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `access_${Date.now()}.${fileExt}`;
            const filePath = `${propertyId}/videos/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('properties')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('properties')
                .getPublicUrl(filePath);

            onUpdate({ ...data, videoUrl: publicUrl });
        } catch (error) {
            console.error('Video upload failed', error);
            alert('Video upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.sectionTitle}>Property Access</h3>
            <p style={{ color: 'var(--text-muted)' }}>How do guests get in? (Video is mandatory)</p>

            <div className={styles.categoryBlock}>
                <h4 className={styles.categoryTitle}>Video Instructions {data?.videoUrl ? '✓' : ''} <span style={{ color: 'red' }}>*</span></h4>
                {data?.videoUrl && <p style={{ fontSize: '0.8rem', color: 'green' }}>Video uploaded!</p>}
                <FileUploader
                    label=""
                    accept="video/*"
                    description="Upload a video showing how to find keys or use the smart lock."
                    onChange={handleVideoUpload}
                    disabled={uploading}
                />
                {!data?.videoUrl && <p style={{ color: 'red', fontSize: '0.8rem' }}>Required</p>}
            </div>

            <div className={styles.divider} />

            <div className={styles.categoryBlock}>
                <h4 className={styles.categoryTitle}>Written Instructions</h4>
                <textarea
                    className={styles.textarea}
                    rows={5}
                    placeholder="e.g. The key is in the lockbox code 1234..."
                    value={instructions}
                    onChange={(e) => handleChange(e.target.value)}
                />
            </div>

            <div className={styles.actions} style={{ justifyContent: 'space-between' }}>
                <Button variant="outline" onClick={onBack}>Back</Button>
                <Button size="lg" onClick={() => {
                    if (!data?.videoUrl) {
                        alert("Access video is mandatory.");
                        return;
                    }
                    onNext();
                }} className={styles.nextBtn}>
                    Next Step: Rules →
                </Button>
            </div>
        </div>
    );
}
