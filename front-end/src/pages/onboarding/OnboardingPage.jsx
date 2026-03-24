import { useState } from "react";
import { useNavigate } from "react-router-dom";

import OnboardingStepGoal from "../../components/OnboardingStepGoal";
import OnboardingStepLevel from "../../components/OnboardingStepLevel";
import OnboardingStepAvailability from "../../components/OnboardingStepAvailability";

function focusKey(practiceFocus) {
  return [...(practiceFocus ?? [])].sort().join("|");
}

function OnboardingPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [step1Data, setStep1Data] = useState(null);
  const [step2Draft, setStep2Draft] = useState(null);
  const [step2Data, setStep2Data] = useState(null);
  const [step3Draft, setStep3Draft] = useState(null);

  return (
    <div className="App">
      {step === 1 && (
        <OnboardingStepGoal
          initialValues={step1Data}
          onNext={(payload) => {
            setStep1Data((prev) => {
              if (prev != null) {
                const focusChanged =
                  prev.role !== payload.role ||
                  focusKey(prev.practiceFocus) !== focusKey(payload.practiceFocus);

                if (focusChanged) {
                  setStep2Draft(null);
                  setStep3Draft(null);
                }
              }
              return payload;
            });
            setStep(2);
          }}
        />
      )}

      {step === 2 && step1Data != null && (
        <OnboardingStepLevel
          stepOneData={step1Data}
          initialValues={step2Draft}
          onBack={(draft) => {
            setStep2Draft(draft);
            setStep(1);
          }}
          onNext={(payload) => {
            setStep2Data((prev) => {
              if (prev != null && JSON.stringify(prev) !== JSON.stringify(payload)) {
                setStep3Draft(null);
              }
              return payload;
            });
            setStep2Draft(null);
            setStep(3);
          }}
        />
      )}

      {step === 3 && step1Data != null && step2Data != null && (
        <OnboardingStepAvailability
          initialValues={step3Draft}
          onBack={(draft) => {
            setStep3Draft(draft);
            setStep(2);
          }}
          onComplete={(payload) => {
            console.log("onboarding complete", {
              step1: step1Data,
              step2: step2Data,
              step3: payload,
            });

            setStep3Draft(null);
            //WAIT FOR DISCOVERY TO COMPLETE BEFORE NAVIGATING
            navigate("/");
          }}
        />
      )}
    </div>
  );
}

export default OnboardingPage;