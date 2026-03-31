"use client";

import OnboardingTimeline from '@/components/OnboardingTimeline';

export default function OnboardingDemoPage() {
  const handleStepComplete = (stepId: number) => {
    console.log(`Step ${stepId} completed!`);
  };

  const handleAllComplete = () => {
    console.log("All steps completed! Redirecting...");
    // alert("Félicitations ! Votre onboarding est terminé.");
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
          <OnboardingTimeline 
            clientName="Mohamed"
            onStepComplete={handleStepComplete}
            onAllComplete={handleAllComplete}
          />
        </div>
      </div>
    </main>
  );
}
