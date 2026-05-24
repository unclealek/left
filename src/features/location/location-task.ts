import * as TaskManager from "expo-task-manager";
import type * as Location from "expo-location";
import { LOCATION_TASK_NAME, processLocationFix } from "./location-service";

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  if (error) {
    console.warn("[location] background task failed", error.message);
    return;
  }

  const payload = data as { locations?: Location.LocationObject[] } | undefined;
  const latest = payload?.locations?.at(-1);
  if (!latest) return;

  try {
    await processLocationFix(latest.coords);
  } catch (taskError) {
    console.warn("[location] processing fix failed", taskError);
  }
});
