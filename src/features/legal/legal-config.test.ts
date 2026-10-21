import { afterEach, describe, expect, it, vi } from "vitest";

const metadataKeys = ["TERMS", "PRIVACY", "COMMUNITY"].flatMap((id) => [
  `EXPO_PUBLIC_LEGAL_${id}_URL`,
  `EXPO_PUBLIC_LEGAL_${id}_VERSION`,
  `EXPO_PUBLIC_LEGAL_${id}_EFFECTIVE_DATE`,
]);

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("legal publication configuration", () => {
  it("opens the supplied HERE pages but keeps draft acceptance disabled", async () => {
    for (const key of metadataKeys) vi.stubEnv(key, undefined);
    const { LEGAL_DOCUMENTS, legalContentReady, CURRENT_LEGAL_VERSIONS } = await import("./legal-config");
    expect(LEGAL_DOCUMENTS.terms.url).toBe("https://here-web-azure.vercel.app/terms");
    expect(LEGAL_DOCUMENTS.privacy.url).toBe("https://here-web-azure.vercel.app/privacy");
    expect(LEGAL_DOCUMENTS.community.url).toBe("https://here-web-azure.vercel.app/community-guidelines");
    expect(legalContentReady).toBe(false);
    expect(CURRENT_LEGAL_VERSIONS).toEqual({ terms: null, privacy: null, community: null });
    for (const document of Object.values(LEGAL_DOCUMENTS)) expect(document.publishedAt).toBeNull();
  });

  it("preserves explicit release URL overrides and rejects insecure overrides", async () => {
    vi.stubEnv("EXPO_PUBLIC_LEGAL_TERMS_URL", "https://example.com/approved-terms");
    vi.stubEnv("EXPO_PUBLIC_LEGAL_PRIVACY_URL", "http://example.com/privacy");
    const { LEGAL_DOCUMENTS, legalContentReady } = await import("./legal-config");
    expect(LEGAL_DOCUMENTS.terms.url).toBe("https://example.com/approved-terms");
    expect(LEGAL_DOCUMENTS.privacy.url).toBeNull();
    expect(legalContentReady).toBe(false);
  });
});
