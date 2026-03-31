import React from 'react';
import * as LucideIcons from 'lucide-react';
import { OnboardingStep } from './onboarding.types';

interface StepCardProps {
  step: OnboardingStep;
  isActive: boolean;
  isCompleted: boolean;
  onToggle: (id: number) => void;
  readOnly?: boolean;
}

const StepCard: React.FC<StepCardProps> = ({ step, isActive, isCompleted, onToggle, readOnly }) => {
  // @ts-ignore - Dynamic icon name from data
  const Icon = LucideIcons[step.icon] || LucideIcons.HelpCircle;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onToggle(step.id);
    }
  };

  return (
    <div 
      className={`pb-step-card ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
      role="button"
      aria-pressed={isCompleted}
      aria-label={`Étape ${step.id}: ${step.title}. ${isCompleted ? 'Complétée' : 'À faire'}`}
      tabIndex={readOnly ? -1 : 0}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!readOnly) onToggle(step.id);
      }}
      onKeyDown={handleKeyDown}
    >
      <div className="pb-step-icon-wrapper">
        {isCompleted ? (
          <LucideIcons.Check size={24} strokeWidth={3} />
        ) : (
          <Icon size={24} />
        )}
      </div>

      <div className="pb-step-content">
        <div className="pb-step-header">
          <h3 className="pb-step-title">
            <span className={`pb-step-number ${isCompleted ? 'hidden-number' : ''}`}>
              {step.id}. 
            </span>
            {step.title}
          </h3>
          <div className="pb-step-badges">
            {step.optional && <span className="pb-badge pb-badge-optional">Optionnel</span>}
            <span className="pb-badge pb-badge-day">{step.dayRange}</span>
          </div>
        </div>
        <p className="pb-step-description">{step.description}</p>
      </div>
    </div>
  );
};

export default StepCard;
