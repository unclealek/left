import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import { Platform } from "react-native";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "../../lib/supabase";
import { AUTH_CALLBACK_PATH, NATIVE_AUTH_REDIRECT } from "../../app/leftConfig";
export {
  getProvider,
  getProviderSubject,
  UnsupportedAuthProviderError,
} from "./auth-identity";

export type GoogleAuthResult =
  | { status: "completed" }
  | { status: "cancelled" }
  | { status: "failed"; message: string };

WebBrowser.maybeCompleteAuthSession();

export function getFirstNameFromSession(session: Session) {
  const explicitFirstName = session.user.user_metadata.first_name;
  if (typeof explicitFirstName === "string") return explicitFirstName.trim();

  const displayName = session.user.user_metadata.name;
  if (typeof displayName === "string") return displayName.trim().split(/\s+/)[0] ?? "";

  return "";
}

export async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) throw error;
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

  if (Platform.OS === "web") {
    const isEmbeddedPreview = window.self !== window.top;
    const authWindow = isEmbeddedPreview ? window.open("", "_blank") : null;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo, skipBrowserRedirect: true },
    });

    if (error) {
      authWindow?.close();
      logAuthDebug("web oauth redirect failed", { message: error.message, code: error.code, status: error.status });
      return { status: "failed", message: "Google sign-in could not start." };
    }

    if (!data?.url) {
      authWindow?.close();
      logAuthDebug("web oauth url missing");
      return { status: "failed", message: "Google sign-in did not return an auth URL." };
    }

    if (isEmbeddedPreview) {
      if (!authWindow) {
        logAuthDebug("web oauth tab blocked");
        return { status: "failed", message: "Open the app in a new tab, then try Google sign-in again." };
      }
      authWindow.location.replace(data.url);
      logAuthDebug("web oauth opened in external tab");
    } else {
      window.location.assign(data.url);
      logAuthDebug("web oauth same-tab redirect started");
    }

    return { status: "completed" };
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

  logAuthDebug("oauth url generated");
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  logAuthDebug("browser auth result", { type: result.type });
  if (result.type !== "success" || !result.url) return { status: "cancelled" };

  const { params, errorCode } = QueryParams.getQueryParams(result.url);
  if (errorCode) {
    logAuthDebug("callback query parsing failed", { errorCode });
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

  logAuthDebug("callback missing auth tokens and code");
  return { status: "failed", message: "Google sign-in did not complete." };
}
