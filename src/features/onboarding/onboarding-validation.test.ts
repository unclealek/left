import { describe, expect, it } from "vitest";
import { validateFirstName } from "./onboarding-validation";

describe("validateFirstName", () => {
  it("normalizes a valid name without discarding spaces", () => {
    expect(validateFirstName("  Mary   Jane  ")).toEqual({
      valid: true,
      normalized: "Mary Jane",
      message: null,
    });
  });

  it("rejects empty and unsupported input", () => {
    expect(validateFirstName("   ").valid).toBe(false);
    expect(validateFirstName("Kelvin123").valid).toBe(false);
  });

  it("supports accented names, apostrophes, and hyphens", () => {
    expect(validateFirstName("Élodie").valid).toBe(true);
    expect(validateFirstName("O'Connor").valid).toBe(true);
    expect(validateFirstName("Anne-Marie").valid).toBe(true);
  });
});
