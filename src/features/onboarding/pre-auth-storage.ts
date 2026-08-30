import AsyncStorage from "@react-native-async-storage/async-storage";

const PRE_AUTH_ONBOARDING_SEEN_KEY = "left/onboarding/pre-auth-seen";

export async function hasSeenPreAuthOnboarding() {
  return (await AsyncStorage.getItem(PRE_AUTH_ONBOARDING_SEEN_KEY)) === "true";
}

export async function markPreAuthOnboardingSeen() {
  await AsyncStorage.setItem(PRE_AUTH_ONBOARDING_SEEN_KEY, "true");
}