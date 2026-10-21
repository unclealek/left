import { useEffect } from "react";
import { posthog } from "./posthog";
import type { Screen } from "../app/leftConfig";

// LEFT uses state-driven navigation, so the SDK's React Navigation integration
// cannot observe these transitions. Only names are sent, never route content.
export function usePostHogScreen(
  screen: Screen | "shared-gathering",
  accessMode: "member" | "guest" = "member",
) {
  useEffect(() => {
    void posthog?.screen(screen, { access_mode: accessMode }).catch(() => {
      // Analytics must not interrupt navigation, including while offline.
    });
  }, [screen, accessMode]);
}
