import { analyticsAllowed } from "./analytics-consent";
import { posthog } from "./posthog";

type LogAttributes = Record<string, string | number | boolean>;

/**
 * Dedicated logger for the small set of operational lines this app exports to
 * PostHog Logs. Existing console output intentionally remains local.
 */
export const posthogLog = {
  info(message: string, attributes: LogAttributes) {
    if (analyticsAllowed()) posthog?.logger.info(message, attributes);
  },
};
