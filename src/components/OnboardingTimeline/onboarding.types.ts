export type OnboardingPhase = "preparation" | "lancement" | "toutes";

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  phase: "preparation" | "lancement";
  optional: boolean;
  dayRange: string;
  icon: string; // lucide-react icon name
}

export interface OnboardingTimelineProps {
  clientName?: string;
  onStepComplete?: (stepId: number) => void;
  onAllComplete?: () => void;
  initialCompleted?: number[];
  readOnly?: boolean;
}
