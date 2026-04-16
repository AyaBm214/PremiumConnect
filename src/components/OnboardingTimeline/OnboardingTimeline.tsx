"use client";

import React from 'react';
import { OnboardingTimelineProps } from './onboarding.types';
import { Check, MoreHorizontal, Lock, Flag } from 'lucide-react';
import './OnboardingTimeline.css';

const PHASES = [
  { id: 1, label: "Signature du contrat", icon: Check },
  { id: 2, label: "Audit documentaire", icon: Check },
  { id: 3, label: "Démarrage d'embarquement", icon: MoreHorizontal },
  { id: 4, label: "Vérification des accès", icon: Lock },
  { id: 5, label: "Finalisation", icon: Flag },
];

const OnboardingTimeline: React.FC<OnboardingTimelineProps> = ({
  onboardingPhase = 1,
}) => {
  return (
    <div className="onboarding-container">
      <div className="stepper-wrapper">
        <div className="stepper-container">
          {/* Background Line */}
          <div className="stepper-line-bg" />
          
          {/* Progress Line */}
          <div 
            className="stepper-line-progress" 
            style={{ width: `${((onboardingPhase - 1) / (PHASES.length - 1)) * 100}%` }}
          />

          {PHASES.map((phase) => {
            const Icon = phase.icon;
            const isCompleted = onboardingPhase > phase.id;
            const isActive = onboardingPhase === phase.id;
            const isLocked = onboardingPhase < phase.id;

            return (
              <div key={phase.id} className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${isLocked ? 'locked' : ''}`}>
                <div className="step-circle-wrapper">
                  <div className="step-circle">
                    <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                  </div>
                  {isActive && <div className="step-glow" />}
                </div>
                <span className="step-label">{phase.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OnboardingTimeline;
