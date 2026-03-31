"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { OnboardingTimelineProps, OnboardingPhase } from './onboarding.types';
import { STEPS } from './onboarding.data';
import { getProgressPercentage, getNextActiveStepId } from './onboarding.utils';
import ProgressBar from './ProgressBar';
import PhaseTabs from './PhaseTabs';
import StepCard from './StepCard';
import FinishBanner from './FinishBanner';
import './OnboardingTimeline.css';

const LOCAL_STORAGE_KEY = "pb_onboarding_progress";

const OnboardingTimeline: React.FC<OnboardingTimelineProps> = ({
  clientName,
  onStepComplete,
  onAllComplete,
  initialCompleted = [],
  readOnly = false
}) => {
  // 1. Better initialization: Prefer localStorage over empty props immediately if possible
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved && initialCompleted.length === 0) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) { }
      }
    }
    return initialCompleted;
  });

  const [activePhase, setActivePhase] = useState<OnboardingPhase>('toutes');
  const [isInitialized, setIsInitialized] = useState(false);

  // 2. Sync from props ONLY if they actually change and are not empty
  useEffect(() => {
    if (initialCompleted.length > 0) {
      setCompletedSteps(initialCompleted);
    }
    setIsInitialized(true);
  }, [JSON.stringify(initialCompleted)]); // Stringify for deep comparison

  // 3. Persist to localStorage
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(completedSteps));
    }
  }, [completedSteps, isInitialized]);

  const toggleStep = (stepId: number) => {
    if (readOnly) return;

    // Optimistic Update
    const isCompleted = completedSteps.includes(stepId);
    const nextSteps = isCompleted
      ? completedSteps.filter(id => id !== stepId)
      : [...completedSteps, stepId].sort((a, b) => a - b);

    setCompletedSteps(nextSteps);

    // Call external handlers
    if (!isCompleted && onStepComplete) {
      onStepComplete(stepId);
    }
  };

  const filteredSteps = useMemo(() => {
    if (activePhase === 'toutes') return STEPS;
    return STEPS.filter(step => step.phase === activePhase);
  }, [activePhase]);

  const progress = useMemo(() =>
    getProgressPercentage(completedSteps, STEPS.length),
    [completedSteps]);

  const activeStepId = useMemo(() =>
    getNextActiveStepId(STEPS, completedSteps),
    [completedSteps]);

  const isAllComplete = completedSteps.length === STEPS.length;

  useEffect(() => {
    if (isAllComplete && onAllComplete) {
      onAllComplete();
    }
  }, [isAllComplete, onAllComplete]);

  // Calculate timeline progress line height
  const progressLineHeight = useMemo(() => {
    if (completedSteps.length === 0) return '0%';
    const lastCompletedId = Math.max(...completedSteps);
    const lastIndex = STEPS.findIndex(s => s.id === lastCompletedId);
    if (lastIndex === -1) return '0%';

    // Percentage based on index (rough estimation for visual line)
    return `${((lastIndex + 1) / STEPS.length) * 100}%`;
  }, [completedSteps]);

  return (
    <div className="onboarding-container">
      <header className="onboarding-header">
        <h1 className="onboarding-title">
        </h1>
        <p className="onboarding-subtitle">
          Suivez les étapes de mise en place de votre service de conciergerie VIP.
        </p>
      </header>

      <ProgressBar current={completedSteps.length} total={STEPS.length} />

      <PhaseTabs activePhase={activePhase} onPhaseChange={setActivePhase} />

      <div className="pb-timeline">
        <div className="pb-timeline-line" />
        <div className="pb-timeline-progress-line" style={{ height: progressLineHeight }} />

        {filteredSteps.map((step) => (
          <StepCard
            key={step.id}
            step={step}
            isActive={step.id === activeStepId}
            isCompleted={completedSteps.includes(step.id)}
            onToggle={toggleStep}
            readOnly={readOnly}
          />
        ))}
      </div>

      {isAllComplete && <FinishBanner />}
    </div>
  );
};

export default OnboardingTimeline;
