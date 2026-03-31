import React from 'react';
import { OnboardingPhase } from './onboarding.types';

interface PhaseTabsProps {
  activePhase: OnboardingPhase;
  onPhaseChange: (phase: OnboardingPhase) => void;
}

const PhaseTabs: React.FC<PhaseTabsProps> = ({ activePhase, onPhaseChange }) => {
  const phases: { label: string; value: OnboardingPhase }[] = [
    { label: 'Toutes', value: 'toutes' },
    { label: 'Préparation', value: 'preparation' },
    { label: 'Lancement', value: 'lancement' },
  ];

  return (
    <div className="pb-tabs">
      {phases.map((phase) => (
        <button
          key={phase.value}
          className={`pb-tab ${activePhase === phase.value ? 'active' : ''}`}
          onClick={() => onPhaseChange(phase.value)}
        >
          {phase.label}
        </button>
      ))}
    </div>
  );
};

export default PhaseTabs;
