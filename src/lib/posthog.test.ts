import { afterEach, beforeEach, expect, it, vi } from "vitest";

const runtime = vi.hoisted(() => ({ options: undefined as any, token: "", storage: {}, screen: vi.fn(), optIn: vi.fn(), optOut: vi.fn() }));
vi.mock("posthog-react-native", () => ({ default: class {
  optIn = runtime.optIn;
  optOut = runtime.optOut;
  constructor(token: string, options: unknown) { runtime.token = token; runtime.options = options; }
} }));
vi.mock("@react-native-async-storage/async-storage", () => ({ default: runtime.storage }));

beforeEach(() => { vi.resetModules(); vi.stubGlobal("__DEV__", false); runtime.options = undefined; runtime.optIn.mockResolvedValue(undefined); runtime.optOut.mockResolvedValue(undefined); });
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

it("uses persistent storage and captures lifecycle events and JS errors", async () => {
  vi.stubEnv("EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_test");
  vi.stubEnv("EXPO_PUBLIC_POSTHOG_HOST", "https://eu.i.posthog.com");
  const module = await import("./posthog");
  expect(module.posthog).toBeUndefined();
  await module.applyAnalyticsPreference(true);
  expect(module.posthog).toBeDefined();
  expect(runtime.options.customStorage).toBe(runtime.storage);
  expect(runtime.options.captureAppLifecycleEvents).toBe(true);
  expect(runtime.options.errorTracking.autocapture).toEqual({ uncaughtExceptions: true, unhandledRejections: true });
});

it.each(["EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN", "EXPO_PUBLIC_POSTHOG_HOST"])("does not start with missing %s", async key => {
  vi.stubEnv("EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_test");
  vi.stubEnv("EXPO_PUBLIC_POSTHOG_HOST", "https://eu.i.posthog.com");
  vi.stubEnv(key, "");
  expect((await import("./posthog")).posthog).toBeUndefined();
});

it("warns developers when both configuration values are missing", async () => {
  vi.stubGlobal("__DEV__", true);
  vi.stubEnv("EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN", "");
  vi.stubEnv("EXPO_PUBLIC_POSTHOG_HOST", "");
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  expect((await import("./posthog")).posthog).toBeUndefined();
  expect(error).toHaveBeenCalledTimes(2);
});

it("denies analytics before preference load, applies opt-out and fails closed", async () => {
  vi.stubEnv("EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN", "phc_test");
  vi.stubEnv("EXPO_PUBLIC_POSTHOG_HOST", "https://eu.i.posthog.com");
  runtime.optIn.mockResolvedValue(undefined); runtime.optOut.mockResolvedValue(undefined);
  const { applyAnalyticsPreference } = await import("./posthog");
  const event = { event: "test" };
  expect(runtime.options).toBeUndefined();
  await applyAnalyticsPreference(false);
  expect(runtime.options).toBeUndefined();
  await applyAnalyticsPreference(true);
  expect(runtime.options.defaultOptIn).toBe(false);
  expect(runtime.options.before_send(event)).toBe(event);
  await applyAnalyticsPreference(false);
  expect(runtime.optOut).toHaveBeenCalled();
  expect(runtime.options.before_send(event)).toBeNull();
  runtime.optIn.mockRejectedValueOnce(new Error("storage"));
  await expect(applyAnalyticsPreference(true)).rejects.toThrow();
  expect(runtime.options.before_send(event)).toBeNull();
});
