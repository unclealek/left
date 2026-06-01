import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import type { AuthProvider } from "../../types/left-domain";
import { AUTH_CALLBACK_PATH, NATIVE_AUTH_REDIRECT } from "../../app/leftConfig";

export type GoogleAuthResult =
  | { status: "completed" }
  | { status: "cancelled" }
  | { status: "failed"; message: string };

WebBrowser.maybeCompleteAuthSession();

export function getProvider(session: Session): AuthProvider {
  return (session.user.app_metadata.provider as AuthProvider | undefined) ?? "google";
}

export function getProviderSubject(session: Session, provider: AuthProvider) {
  return session.user.identities?.find((identity) => identity.provider === provider)?.id ?? session.user.id;
}

export function getFirstNameFromSession(session: Session) {
  return (
    (session.user.user_metadata.first_name as string | undefined) ??
    (session.user.user_metadata.name as string | undefined)?.split(" ")[0] ??
    session.user.email?.split("@")[0] ??
    "Friend"
  );
}

export async function getCurrentSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function startGoogleAuthSession(
  logAuthDebug: (step: string, payload?: Record<string, unknown>) => void,
): Promise<GoogleAuthResult> {
  const redirectTo = makeRedirectUri({
    scheme: "left",
    path: AUTH_CALLBACK_PATH,
    native: NATIVE_AUTH_REDIRECT,
  });

  logAuthDebug("starting google auth", {
    redirectTo,
    expectedNativeRedirect: NATIVE_AUTH_REDIRECT,
    usingExpoGo: redirectTo.startsWith("exp://"),
  });

  if (redirectTo.startsWith("exp://")) {
    logAuthDebug("expo go redirect detected", {
      message: "OAuth redirects are more reliable in a development build or standalone app with the native left:// scheme.",
    });
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo, skipBrowserRedirect: true },
  });

  if (error) {
    logAuthDebug("oauth url generation failed", { message: error.message, code: error.code, status: error.status });
    return { status: "failed", message: "Google sign-in could not start." };
  }

  if (!data?.url) {
    logAuthDebug("oauth url missing");
    return { status: "failed", message: "Google sign-in did not return an auth URL." };
  }

  logAuthDebug("oauth url generated", { authUrl: data.url });
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  logAuthDebug("browser auth result", result.type === "success" ? { type: result.type, url: result.url } : { type: result.type });
  if (result.type !== "success" || !result.url) return { status: "cancelled" };

  const { params, errorCode } = QueryParams.getQueryParams(result.url);
  if (errorCode) {
    logAuthDebug("callback query parsing failed", { errorCode, url: result.url });
    return { status: "failed", message: "Google sign-in did not complete." };
  }

  const accessToken = typeof params.access_token === "string" ? params.access_token : null;
  const refreshToken = typeof params.refresh_token === "string" ? params.refresh_token : null;
  const authCode = typeof params.code === "string" ? params.code : null;

  if (accessToken && refreshToken) {
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessionError) {
      logAuthDebug("session set failed", { message: sessionError.message, code: sessionError.code, status: sessionError.status });
      return { status: "failed", message: "Google sign-in did not complete." };
    }
    logAuthDebug("session set from callback tokens");
    return { status: "completed" };
  }

  if (authCode) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(authCode);
    if (exchangeError) {
      logAuthDebug("session exchange failed", { message: exchangeError.message, code: exchangeError.code, status: exchangeError.status });
      return { status: "failed", message: "Google sign-in did not complete." };
    }
    logAuthDebug("session exchange complete");
    return { status: "completed" };
  }

  logAuthDebug("callback missing auth tokens and code", { url: result.url, params });
  return { status: "failed", message: "Google sign-in did not complete." };
}
