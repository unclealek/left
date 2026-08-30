const NAME_PATTERN = /^[\p{L}\p{M}' -]+$/u;

export function validateFirstName(value: string) {
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized) return { valid: false as const, normalized, message: "Enter your first name." };
  if (normalized.length > 40) {
    return { valid: false as const, normalized, message: "Use 40 characters or fewer." };
  }
  if (!NAME_PATTERN.test(normalized)) {
    return {
      valid: false as const,
      normalized,
      message: "Use letters, spaces, apostrophes, or hyphens only.",
    };
  }
  return { valid: true as const, normalized, message: null };
}
