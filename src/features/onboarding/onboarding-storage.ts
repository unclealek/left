import AsyncStorage from "@react-native-async-storage/async-storage";
import type { AvatarStyle } from "../../types/left-domain";

export type OnboardingDraftStep = "name" | "avatar" | "location" | "complete";

export type OnboardingDraft = {
  firstName: string;
  avatarStyle: AvatarStyle;
  step: OnboardingDraftStep;
  updatedAt: string;
};

function storageKey(userId: string) {
  return `left/onboarding/draft/${userId}`;
}

export async function loadOnboardingDraft(userId: string): Promise<OnboardingDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(storageKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OnboardingDraft>;
    if (
      typeof parsed.firstName !== "string" ||
      !["geometric", "abstract", "minimal", "soft"].includes(parsed.avatarStyle ?? "") ||
      !["name", "avatar", "location", "complete"].includes(parsed.step ?? "")
    ) {
      return null;
    }
    return parsed as OnboardingDraft;
  } catch (error) {
    console.warn("[onboarding] could not load draft", error);
    return null;
  }
}

export async function saveOnboardingDraft(
  userId: string,
  input: Omit<OnboardingDraft, "updatedAt">,
) {
  try {
    await AsyncStorage.setItem(
      storageKey(userId),
      JSON.stringify({ ...input, updatedAt: new Date().toISOString() }),
    );
    return true;
  } catch (error) {
    console.warn("[onboarding] could not save draft", error);
    return false;
  }
}

export async function clearOnboardingDraft(userId: string) {
  try {
    await AsyncStorage.removeItem(storageKey(userId));
  } catch (error) {
    console.warn("[onboarding] could not clear draft", error);
  }
}
