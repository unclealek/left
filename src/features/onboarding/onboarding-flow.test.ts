import { describe, expect, it } from "vitest";
import {
  canCompleteLegalStep,
  getLocationRecoveryMessage,
  getPreviousOnboardingStep,
} from "./onboarding-flow";

describe("onboarding recovery", () => {
  it("walks back without discarding earlier steps", () => {
    expect(getPreviousOnboardingStep("complete")).toBe("location");
    expect(getPreviousOnboardingStep("location")).toBe("avatar");
    expect(getPreviousOnboardingStep("avatar")).toBe("name");
    expect(getPreviousOnboardingStep("name")).toBeNull();
  });

  it("requires every published legal document and never records pending content", () => {
    const complete = { terms: true, privacy: true, community: true };
    expect(canCompleteLegalStep(true, complete)).toBe(true);
    expect(canCompleteLegalStep(true, { ...complete, privacy: false })).toBe(false);
    expect(canCompleteLegalStep(false, { terms: false, privacy: false, community: false })).toBe(true);
  });

  it("gives actionable permission recovery copy", () => {
    expect(getLocationRecoveryMessage("foreground_denied")).toContain("device settings");
    expect(getLocationRecoveryMessage("background_denied")).toContain("Always");
    expect(getLocationRecoveryMessage("registration_failed")).toContain("try again");
  });
});
