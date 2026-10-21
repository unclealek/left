import { beforeEach, expect, it, vi } from "vitest";

const runtime = vi.hoisted(() => ({ screen: vi.fn(), effect: undefined as undefined | (() => void) }));
vi.mock("react", () => ({ useEffect: (effect: () => void) => { runtime.effect = effect; } }));
vi.mock("./posthog", () => ({ posthog: { screen: runtime.screen } }));
import { usePostHogScreen } from "./use-posthog-screen";

beforeEach(() => { runtime.screen.mockReset().mockResolvedValue(undefined); });

it("tracks the named member screen without profile or venue content", () => {
  usePostHogScreen("venue-detail"); runtime.effect!();
  expect(runtime.screen).toHaveBeenCalledWith("venue-detail", { access_mode: "member" });
});

it("distinguishes guest screen views", () => {
  usePostHogScreen("shared-gathering", "guest"); runtime.effect!();
  expect(runtime.screen).toHaveBeenCalledWith("shared-gathering", { access_mode: "guest" });
});

it("does not turn a tracking failure into an unhandled rejection", async () => {
  runtime.screen.mockRejectedValue(new Error("offline"));
  usePostHogScreen("home"); runtime.effect!();
  await Promise.resolve();
});
