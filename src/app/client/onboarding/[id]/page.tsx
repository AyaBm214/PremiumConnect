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
import { notifyAdminOnCompletion } from '@/app/actions/onboarding-actions';

export default function OnboardingPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    // Load property
    useEffect(() => {
        if (!user) return; // Wait for auth
        const propId = params.id as string;

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

            if (data.owner_id !== user.id) {
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
    }, [params.id, user, router, supabase]);

    const handleUpdate = async (updates: Partial<Property>) => {
        if (!property) return;
        const updated = { ...property, ...updates, updatedAt: new Date().toISOString() };

        // Optimistic update
        setProperty(updated);

        // Map TS camelCase to DB snake_case for saving
        const dbPayload = {
            id: updated.id,
            owner_id: updated.ownerId,
            name: updated.name,
            status: updated.status,
            current_step: updated.currentStep,
            total_steps: updated.totalSteps,
            progress: updates.progress ?? (updated.status === 'pending_review' ? 100 : Math.round(((updated.currentStep - 1) / 6) * 100)),
            data: updated.data,
            updated_at: updated.updatedAt
        };

        // Update state progress too if it wasn't passed in updates
        if (updates.currentStep) {
            updated.progress = dbPayload.progress;
            setProperty({ ...updated });
        }

        const { error } = await supabase
            .from('properties')
            .upsert(dbPayload);

        if (error) {
            console.error('Error saving property:', error);
            // Optionally revert state here if save fails
        }
    };

    const nextStep = () => {
        if (!property) return;
        const next = Math.min(property.currentStep + 1, 6);
        handleUpdate({ currentStep: next });
    };

    const prevStep = () => {
        if (!property) return;
        const prev = Math.max(property.currentStep - 1, 1);
        handleUpdate({ currentStep: prev });
    };

    const handleSaveExit = async () => {
        // Just ensure latest state is saved (it should be real-time/optimistic already)
        // Check local storage if we still used it? No.
        router.push('/client/dashboard');
    };

    if (loading || !property) return <div className={styles.loading}>Loading...</div>;

    return (
        <div className={styles.layout}>
            {/* Sidebar / Timeline */}
            <aside className={styles.sidebar}>
                <div className={styles.logo}>
                    <img src="/logo.png" alt="Premium Booking" />
                </div>
                <nav className={styles.timeline}>
                    {ONBOARDING_STEPS.map(step => (
                        <div
                            key={step.id}
                            className={`
                ${styles.stepItem} 
                ${step.id === property.currentStep ? styles.activeStep : ''}
                ${step.id < property.currentStep ? styles.completedStep : ''}
              `}
                        >
                            <div className={styles.stepIcon}>{step.icon}</div>
                            <span className={styles.stepTitle}>{step.title}</span>
                            {step.id < property.currentStep && <span className={styles.check}>✓</span>}
                        </div>
                    ))}
                </nav>
                <button onClick={handleSaveExit} className={styles.saveExitBtn}>
                    Save & Exit
                </button>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                <header className={styles.header}>
                    <h2>{ONBOARDING_STEPS[property.currentStep - 1].title}</h2>
                    <div className={styles.progress}>Step {property.currentStep} of 7</div>
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
                            onUpdate={({ amenities, poolOpeningDate, hotTubOpeningDate }) => handleUpdate({
                                data: { ...property.data, amenities, poolOpeningDate, hotTubOpeningDate }
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
                                googleDriveLink: property.data.googleDriveLink
                            }}
                            info={property.data.info} // Pass info for bedroom count
                            onUpdate={(updates) => handleUpdate({ data: { ...property.data, ...updates } })}
                            onNext={nextStep}
                            onBack={prevStep}
                        />
                    )}
                    {/* Step 4 Access Removed */}
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
                        <Step7Payment
                            propertyId={property.id}
                            propertyName={property.name}
                            data={property.data.payment}
                            onUpdate={(payment) => handleUpdate({ data: { ...property.data, payment } })}

                            // ...
                            onNext={async () => {
                                handleUpdate({ status: 'pending_review', progress: 100 });
                                await notifyAdminOnCompletion(property.id, property.data.info?.propertyName || 'Untitled');
                                router.push('/client/dashboard');
                            }}
                            onBack={prevStep}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
