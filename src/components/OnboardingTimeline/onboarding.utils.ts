import { OnboardingStep } from "./onboarding.types";

export const getProgressPercentage = (completedIds: number[], totalSteps: number): number => {
  if (totalSteps === 0) return 0;
  return Math.round((completedIds.length / totalSteps) * 100);
};

export const getNextActiveStepId = (steps: OnboardingStep[], completedIds: number[]): number | null => {
  for (const step of steps) {
    if (!completedIds.includes(step.id)) {
      return step.id;
    }
  }
  return null;
};

export const isStepActive = (stepId: number, completedIds: number[], steps: OnboardingStep[]): boolean => {
  const nextId = getNextActiveStepId(steps, completedIds);
  return nextId === stepId;
};
