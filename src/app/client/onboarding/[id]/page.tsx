'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { Property } from '@/lib/types';
import { ONBOARDING_STEPS } from '@/lib/constants';
import styles from './onboarding.module.css';
import Step1Info from '@/components/onboarding/Step1Info';
import Step2Amenities from '@/components/onboarding/Step2Amenities';
import Step3Photos from '@/components/onboarding/Step3Photos';
import Step4Access from '@/components/onboarding/Step4Access';
import Step5Rules from '@/components/onboarding/Step5Rules';
import Step6Guide from '@/components/onboarding/Step6Guide';
import Step7Payment from '@/components/onboarding/Step7Payment';
import StepOwnerRequests from '@/components/onboarding/StepOwnerRequests';
import StepContract from '@/components/onboarding/StepContract';
import { notifyAdminOnCompletion } from '@/app/actions/onboarding-actions';
import { useLanguage } from '@/lib/LanguageContext';

import { calculateStepProgress, calculateTotalProgress } from '@/lib/onboarding-utils';

export default function OnboardingPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const { user } = useAuth();
    const { t } = useLanguage();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const isAdmin = user?.user_metadata?.type === 'admin';

    // Load property
    useEffect(() => {
        if (!user) return; // Wait for auth
        const propId = params.id;

        const fetchProperty = async () => {
            const { data, error } = await supabase
                .from('properties')
                .select('*')
                .eq('id', propId)
                .single();

            if (error || !data) {
                console.error('Error fetching property:', error);
                router.push('/client/dashboard');
                return;
            }

            // Allow if owner OR admin
            if (data.owner_id !== user.id && !isAdmin) {
                router.push('/client/dashboard'); // Unauthorized
                return;
            }

            // Map DB snake_case to TS camelCase
            const mappedProp: Property = {
                id: data.id,
                ownerId: data.owner_id,
                name: data.name,
                status: data.status,
                currentStep: data.current_step,
                totalSteps: data.total_steps,
                progress: data.progress,
                updatedAt: data.updated_at,
                data: data.data || {}
            };

            setProperty(mappedProp);
            setLoading(false);
        };

        fetchProperty();
    }, [params.id, user, router, supabase, isAdmin]);

    const handleUpdate = async (updates: Partial<Property>) => {
        if (!property) return;
        const updated = { ...property, ...updates, updatedAt: new Date().toISOString() };

        // Calculate total progress using the shared utility
        const totalProgress = calculateTotalProgress(updated.data);

        // Optimistic update
        setProperty({ ...updated, progress: totalProgress });

        // Map TS camelCase to DB snake_case for saving
        const dbPayload = {
            id: updated.id,
            owner_id: updated.ownerId,
            name: updated.name,
            status: updated.status,
            current_step: updated.currentStep,
            total_steps: updated.totalSteps,
            progress: totalProgress,
            data: updated.data,
            updated_at: updated.updatedAt
        };

        const query = supabase
            .from('properties');

        const { error } = isAdmin
            ? await query.update(dbPayload).eq('id', updated.id)
            : await query.upsert(dbPayload);

        if (error) {
            console.error('Error saving property:', error);
            alert('Error saving: ' + error.message);
        }
    };
    const nextStep = () => {
        if (!property) return;
        const next = Math.min(property.currentStep + 1, 8);
        handleUpdate({ currentStep: next });
    };

    const prevStep = () => {
        if (!property) return;
        const prev = Math.max(property.currentStep - 1, 1);
        handleUpdate({ currentStep: prev });
    };

    const handleSaveExit = async () => {
        if (isAdmin) {
            router.push('/admin/properties');
        } else {
            router.push('/client/dashboard');
        }
    };

    if (loading || !property) return <div>Loading...</div>;

    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <img src="/logo.png" alt="Premium Booking" />
                </div>

                <div className={styles.progressSection}>
                    <div className={styles.stepProgress}>
                        <span className={styles.stepPercentage}>{Math.round(property.progress)}%</span>
                        <span className={styles.progressLabel}>{t('onboarding.progress.total') || 'Progress'}</span>
                    </div>
                    <div className={styles.miniProgressBar}>
                        <div 
                            className={styles.miniProgressFill} 
                            style={{ width: `${property.progress}%` }} 
                        />
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    {ONBOARDING_STEPS.map(step => (
                        <div
                            key={step.id}
                            className={`
                                ${styles.stepItem} 
                                ${step.id === property.currentStep ? styles.activeStep : ''}
                                ${step.id < property.currentStep ? styles.completedStep : ''}
                            `}
                        >
                            <div className={styles.stepCircle}>
                                {step.id < property.currentStep ? '✓' : step.id}
                            </div>
                            <span className={styles.stepTitle}>{t(step.key || '')}</span>
                        </div>
                    ))}
                </nav>
            </aside>

            <div className={styles.contentWrapper}>
                {/* Top Header */}
                <header className={styles.topHeader}>
                    <div className={styles.headerActions}>
                        {isAdmin && (
                            <button
                                onClick={() => router.push('/admin/properties')}
                                className={styles.saveExitBtn}
                                style={{ backgroundColor: '#f0f4f8', borderColor: '#d1d9e6', color: '#1a2b4b' }}
                            >
                                <span>←</span> {t('admin.details.back')}
                            </button>
                        )}
                        <button onClick={handleSaveExit} className={styles.saveExitBtn}>
                            {isAdmin ? 'Save & Return to Admin' : 'Save & Exit'}
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className={styles.main}>
                    {isAdmin && (
                        <div style={{
                            backgroundColor: '#fff7ed',
                            border: '1px solid #ffedd5',
                            padding: '0.75rem 1.5rem',
                            marginBottom: '1.5rem',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            color: '#9a3412',
                            fontWeight: 600,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                        }}>
                            <span style={{ fontSize: '1.2rem' }}>🛠️</span>
                            <span>Mode Admin : Vous modifiez cette propriété pour le client.</span>
                        </div>
                    )}
                    <header className={styles.header}>
                        <h2>{t(ONBOARDING_STEPS[property.currentStep - 1].key || '')}</h2>
                        <div className={styles.progressText}>Step {property.currentStep} of {ONBOARDING_STEPS.length}</div>
                    </header>

                    <div className={styles.stepContent}>
                        {property.currentStep === 1 && (
                            <Step1Info
                                propertyId={property.id}
                                data={property.data.info}
                                onUpdate={(data) => handleUpdate({ data: { ...property.data, info: data } })}
                                onNext={nextStep}
                            />
                        )}
                        {property.currentStep === 2 && (
                            <Step2Amenities
                                data={property.data.amenities}
                                info={property.data.info} // Pass info for bedroom/bathroom counts
                                poolOpeningDate={property.data.poolOpeningDate}
                                hotTubOpeningDate={property.data.hotTubOpeningDate}
                                bbqOpeningDate={property.data.bbqOpeningDate}
                                comments={property.data.amenitiesComments}
                                onUpdate={({ amenities, poolOpeningDate, hotTubOpeningDate, bbqOpeningDate, comments }) => handleUpdate({
                                    data: { ...property.data, amenities, poolOpeningDate, hotTubOpeningDate, bbqOpeningDate, amenitiesComments: comments }
                                })}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {property.currentStep === 3 && (
                            <Step3Photos
                                propertyId={property.id}
                                data={{
                                    photos: property.data.photos,
                                    externalLinks: property.data.externalLinks,
                                    googleDriveLink: property.data.googleDriveLink,
                                    platforms: property.data.platforms,
                                    otherPlatform: property.data.otherPlatform,
                                    comments: property.data.photosComments
                                }}
                                info={property.data.info} // Pass info for bedroom count
                                onUpdate={(updates) => handleUpdate({
                                    data: {
                                        ...property.data,
                                        ...updates,
                                        photosComments: updates.comments
                                    }
                                })}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {/* Step 4 Access */}
                        {property.currentStep === 4 && (
                            <Step5Rules
                                data={property.data.rules}
                                onUpdate={(rules) => handleUpdate({ data: { ...property.data, rules } })}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {property.currentStep === 5 && (
                            <Step6Guide
                                propertyId={property.id}
                                data={property.data.guide}
                                info={property.data.info}
                                amenities={property.data.amenities}
                                photos={property.data.photos}
                                onUpdate={(guide) => handleUpdate({ data: { ...property.data, guide } })}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {property.currentStep === 6 && (
                            <StepOwnerRequests
                                data={property.data.ownerRequests}
                                onUpdate={(ownerRequests) => handleUpdate({ data: { ...property.data, ownerRequests } })}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {property.currentStep === 7 && (
                            <Step7Payment
                                propertyId={property.id}
                                propertyName={property.name}
                                data={property.data.payment}
                                onUpdate={(payment) => handleUpdate({ data: { ...property.data, payment } })}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {property.currentStep === 8 && (
                            <StepContract
                                data={property.data.contract}
                                onUpdate={(contract) => handleUpdate({ data: { ...property.data, contract } })}
                                onNext={async () => {
                                    // Don't force 100%, let handleUpdate calculate it from data
                                    await handleUpdate({ status: 'pending_review' });
                                    await notifyAdminOnCompletion(property.id, property.data.info?.propertyName || 'Untitled');
                                    if (isAdmin) {
                                        router.push('/admin/properties');
                                    } else {
                                        router.push('/client/dashboard');
                                    }
                                }}
                                onBack={prevStep}
                            />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
}
