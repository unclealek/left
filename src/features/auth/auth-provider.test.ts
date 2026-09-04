import type { Session } from "@supabase/supabase-js";
import { describe, expect, it } from "vitest";
import {
  getProvider,
  getProviderSubject,
  UnsupportedAuthProviderError,
} from "./auth-identity";

function sessionWithProviders(
  primaryProvider: string,
  identities: Array<{ id: string; provider: string }>,
  metadataProviders?: string[],
) {
  return {
    user: {
      id: "user-1",
      app_metadata: {
        provider: primaryProvider,
        providers: metadataProviders,
      },
      identities,
    },
  } as Session;
}

describe("authentication provider resolution", () => {
  it("uses a supported primary provider", () => {
    const session = sessionWithProviders("google", [{ id: "google-1", provider: "google" }]);
    expect(getProvider(session)).toBe("google");
    expect(getProviderSubject(session, "google")).toBe("google-1");
  });

  it("uses a linked Google identity when the primary provider remains email", () => {
    const session = sessionWithProviders("email", [
      { id: "email-1", provider: "email" },
      { id: "google-1", provider: "google" },
    ]);
    expect(getProvider(session)).toBe("google");
    expect(getProviderSubject(session, "google")).toBe("google-1");
  });

  it("rejects an email-only session before it reaches the profile database", () => {
    const session = sessionWithProviders("email", [{ id: "email-1", provider: "email" }]);
    expect(() => getProvider(session)).toThrow(UnsupportedAuthProviderError);
  });
});
