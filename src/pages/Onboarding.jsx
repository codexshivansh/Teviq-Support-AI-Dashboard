import { OnboardingWizard } from "../components/OnboardingWizard";

export function Onboarding({ metadata, onComplete, onNavigate, refreshUser }) {
  return (
    <OnboardingWizard
      metadata={metadata}
      onComplete={onComplete}
      onNavigate={onNavigate}
      refreshUser={refreshUser}
    />
  );
}
