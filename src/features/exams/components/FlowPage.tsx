import React, { useState } from "react";

interface FlowPageProps {
  steps: React.ReactNode[];
}

export default function FlowPage({ steps }: FlowPageProps) {
  const [step, setStep] = useState(0);

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep((prev) => prev + 1);
    }
  };

  const CurrentStep = steps[step];

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted px-4">
      {/* Current stepga `onNext` propini uzatamiz */}
      {React.isValidElement(CurrentStep) &&
        React.cloneElement(CurrentStep, { onNext: nextStep })}
    </div>
  );
}
