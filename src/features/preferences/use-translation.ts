import { usePreferences } from "./preferences-store";
import { translate } from "./translations";
export function useTranslation() {
  const region = usePreferences();
  return { ...region, t: (source: string) => translate(source, region.language) };
}
