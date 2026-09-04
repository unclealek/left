import type { Session } from "@supabase/supabase-js";
import type { AuthProvider } from "../../types/left-domain";

const SUPPORTED_AUTH_PROVIDERS: AuthProvider[] = ["google", "apple"];

function isSupportedAuthProvider(value: unknown): value is AuthProvider {
  return typeof value === "string" && SUPPORTED_AUTH_PROVIDERS.includes(value as AuthProvider);
}

export class UnsupportedAuthProviderError extends Error {
  constructor(provider: unknown) {
    super(`Unsupported authentication provider: ${typeof provider === "string" ? provider : "unknown"}`);
    this.name = "UnsupportedAuthProviderError";
  }
}

export function getProvider(session: Session): AuthProvider {
  const primaryProvider = session.user.app_metadata.provider;
  if (isSupportedAuthProvider(primaryProvider)) return primaryProvider;

  const linkedIdentityProvider = SUPPORTED_AUTH_PROVIDERS.find((provider) =>
    session.user.identities?.some((identity) => identity.provider === provider),
  );
  if (linkedIdentityProvider) return linkedIdentityProvider;

  const metadataProviders = session.user.app_metadata.providers;
  const linkedMetadataProvider = Array.isArray(metadataProviders)
    ? metadataProviders.find(isSupportedAuthProvider)
    : undefined;
  if (linkedMetadataProvider) return linkedMetadataProvider;

  throw new UnsupportedAuthProviderError(primaryProvider);
}

export function getProviderSubject(session: Session, provider: AuthProvider) {
  return session.user.identities?.find((identity) => identity.provider === provider)?.id ?? session.user.id;
}
