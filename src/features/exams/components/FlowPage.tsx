import React, { useState } from "react";

// Define a type for steps that can accept an onNext prop
interface StepProps {
  onNext?: () => void;
}

interface FlowPageProps {
  steps: React.ReactElement<StepProps>[];
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
    <div>
      {React.isValidElement(CurrentStep) &&
        React.cloneElement(CurrentStep, { onNext: nextStep })}
    </div>
  );
}
