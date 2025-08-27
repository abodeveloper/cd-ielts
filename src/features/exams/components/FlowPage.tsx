import React, { useEffect, useState } from "react";

// Step props uchun interfeys
interface StepProps {
  onNext?: (data?: Record<string, any>) => void;
  formData?: Record<string, any>;
  disableOverflow?: boolean; // Har bir step uchun ixtiyoriy boolean
}

interface FlowPageProps {
  steps: React.ReactElement<StepProps>[];
}

export default function FlowPage({ steps }: FlowPageProps) {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Keyingi stepga o'tish
  const nextStep = (newData?: Record<string, any>) => {
    if (step < steps.length - 1) {
      if (newData) {
        setFormData((prev) => ({ ...prev, ...newData }));
      }
      setStep((prev) => prev + 1);
    }
  };

  useEffect(() => {
    // Joriy stepning disableOverflow qiymatini olish
    const currentStep = steps[step];
    const disableOverflow = currentStep?.props?.disableOverflow ?? false; // Agar yo'q bo'lsa, false deb hisoblaymiz

    if (!disableOverflow) {
      document.body.style.overflow = "hidden";
    }

    // Sahifa yopilganda eski holatga qaytarish
    return () => {
      if (!disableOverflow) {
        document.body.style.overflow = "auto";
      }
    };
  }, [step, steps]);

  const CurrentStep = steps[step];

  return (
    <div>
      {React.isValidElement(CurrentStep) &&
        React.cloneElement(CurrentStep, {
          onNext: nextStep,
          formData,
        })}
    </div>
  );
}
