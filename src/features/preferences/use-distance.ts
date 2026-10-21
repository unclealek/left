import { formatDistance } from "./preferences-model";
import { useTranslation } from "./use-translation";
export function useDistanceFormatter() {
  const { units, locale, t } = useTranslation();
  return (metres: number | null | undefined) => {
    const distance = formatDistance(metres, units, locale);
    return distance ? `${distance} ${t("away")}` : null;
  };
}
