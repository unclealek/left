import type { LegalDocumentId } from "../legal/legal-content";
import type { OnboardingDraftStep } from "./onboarding-storage";

export function getPreviousOnboardingStep(step: OnboardingDraftStep): OnboardingDraftStep | null {
  if (step === "complete") return "location";
  if (step === "location") return "notifications";
  if (step === "notifications") return "legal";
  if (step === "legal") return "name";
  if (step === "avatar") return "name";
  return null;
}

export function canCompleteLegalStep(
  contentReady: boolean,
  checks: Record<LegalDocumentId, boolean>,
) {
  return !contentReady || Object.values(checks).every(Boolean);
}

export function getLocationRecoveryMessage(
  reason: "foreground_denied" | "background_denied" | "registration_failed",
) {
  if (reason === "foreground_denied") {
    return "Location access was denied. Allow location in device settings, then try again.";
  }
  if (reason === "background_denied") {
    return "Background location is still off. Enable “Always” access in device settings, then retry.";
  }
  return "Venue detection could not start on this device yet. Check device settings and try again.";
}
