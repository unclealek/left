import { analyticsAllowed, setAnalyticsAllowed } from "./analytics-consent";
import PostHog from "posthog-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const projectToken = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST;
if (__DEV__ && !projectToken) console.error("EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN is missing; analytics is unavailable.");
if (__DEV__ && !host) console.error("EXPO_PUBLIC_POSTHOG_HOST is missing; analytics is unavailable.");

// Do not construct the SDK until this device's saved opt-in has loaded. A previous
// SDK's persisted opt-in/queue must not cause startup transmission before a choice.
export let posthog: PostHog | undefined;
export async function applyAnalyticsPreference(enabled: boolean) {
  setAnalyticsAllowed(enabled);
  try {
    if (enabled) {
      if (!posthog && projectToken && host) posthog = new PostHog(projectToken, {
        host,
        defaultOptIn: false,
        before_send: event => analyticsAllowed() ? event : null,
        customStorage: AsyncStorage,
        captureAppLifecycleEvents: true,
        logs: { serviceName: "left-mobile" },
        errorTracking: { autocapture: { uncaughtExceptions: true, unhandledRejections: true } },
      });
      await posthog?.optIn();
    } else {
      await posthog?.optOut();
    }
  } catch (error) {
    setAnalyticsAllowed(false);
    throw error;
  }
}

export function resetAnalyticsIdentity() {
  posthog?.reset();
  if (analyticsAllowed()) void applyAnalyticsPreference(true).catch(() => {});
}
