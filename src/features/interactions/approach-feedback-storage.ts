import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  activeApproach: "left/interactions/active-approach",
  pendingApproachFeedback: "left/interactions/pending-approach-feedback",
} as const;

export type StoredActiveApproach = {
  userId: string;
  approachId: string;
  targetUserId: string;
  targetFirstName: string;
  presenceSessionId: string;
  approachPrompt: string;
  startedAt: string;
  expiresAt: string;
};

export type PendingApproachFeedback = {
  userId: string;
  approachId: string;
  targetUserId: string;
  targetFirstName: string;
  presenceSessionId: string;
  approachPrompt: string;
  startedAt: string;
  expiresAt: string;
  createdAt: string;
};

async function readJson<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function writeJson<T>(key: string, value: T | null) {
  if (value === null) {
    await AsyncStorage.removeItem(key);
    return;
  }
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getStoredActiveApproach(userId: string) {
  const value = await readJson<StoredActiveApproach>(STORAGE_KEYS.activeApproach);
  if (!value || value.userId !== userId) return null;
  return value;
}

export async function saveStoredActiveApproach(value: StoredActiveApproach) {
  await writeJson(STORAGE_KEYS.activeApproach, value);
}

export async function clearStoredActiveApproach() {
  await writeJson(STORAGE_KEYS.activeApproach, null);
}

export async function getPendingApproachFeedback(userId: string) {
  const value = await readJson<PendingApproachFeedback>(STORAGE_KEYS.pendingApproachFeedback);
  if (!value || value.userId !== userId) return null;
  return value;
}

export async function savePendingApproachFeedback(value: PendingApproachFeedback) {
  await writeJson(STORAGE_KEYS.pendingApproachFeedback, value);
}

export async function clearPendingApproachFeedback() {
  await writeJson(STORAGE_KEYS.pendingApproachFeedback, null);
}
