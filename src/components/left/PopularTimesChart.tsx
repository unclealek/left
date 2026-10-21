import { t } from "../../features/preferences/translation-runtime";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { T } from "../theme";
import { chartDay, chartHours, chartSummary, dayLabel, WEEKDAYS } from "../../features/activity/popular-times-chart";
import type { PopularTimesRow } from "../../features/activity/popular-times-model";

export function PopularTimesChart({ data, timezone }: {
  data: NonNullable<PopularTimesRow["popular_times"]>;
  timezone?: string | null;
}) {
  const today = chartDay(timezone);
  const [chosenDay, setChosenDay] = useState<string | null>(null);
  const [showHours, setShowHours] = useState(false);
  const day = chosenDay ?? today ?? WEEKDAYS[0];
  const hours = chartHours(data[day]);
  const summary = chartSummary(day, hours);
  const hasHours = hours.some(value => value.busyness !== null);

  return (
    <View style={s.container}>
      <Text style={s.heading}>{dayLabel(day)}{day === today ? t(" · Today") : ""}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.days} accessibilityRole="tablist" accessibilityLabel={t("Popular-times day")}>
        {WEEKDAYS.map(value => (
          <Pressable key={value} accessibilityRole="tab" accessibilityLabel={dayLabel(value)}
            accessibilityState={{ selected: value === day }}
            onPress={() => { setChosenDay(value); setShowHours(false); }}
            style={({ pressed }) => [s.day, value === day && s.selectedDay, pressed && s.pressed]}>
            <Text style={[s.dayText, value === day && s.selectedText]}>{dayLabel(value).slice(0, 3)}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text style={s.copy} accessibilityLiveRegion="polite">{summary}</Text>
      {hasHours ? (
        <>
          <View accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            <View style={s.bars}>
              {hours.map(value => (
                <View key={value.hour} style={[s.bar, {
                  height: value.busyness === null ? 2 : Math.max(3, value.busyness),
                  backgroundColor: value.busyness === null ? T.borderBlack : T.primary,
                }]} />
              ))}
            </View>
            <View style={s.axis}>
              {['00:00', '06:00', '12:00', '18:00', '23:00'].map(label => <Text key={label} style={s.axisText}>{label}</Text>)}
            </View>
          </View>
          <Text style={s.copy}>{t("Venue local time. Typical activity, not a live count of people. Gray marks mean no data.")}</Text>
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: showHours }}
            onPress={() => setShowHours(value => !value)} style={s.detailsButton}>
            <Text style={s.detailsText}>{showHours ? t("Hide hourly details") : t("Show hourly details")}</Text>
          </Pressable>
          {showHours ? <View style={s.details}>
            {hours.map(value => <Text key={value.hour} style={s.copy}>
              {`${String(value.hour).padStart(2, '0')}:00 — ${value.busyness === null ? t("No data") : t("{percent}% typical activity", { percent: value.busyness })}`}
            </Text>)}
          </View> : null}
        </>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: { gap: 12 },
  heading: { color: T.textPrimary, fontFamily: T.fontBodyBold, fontSize: 18, lineHeight: 26 },
  days: { flexDirection: "row", gap: 6 },
  day: { minWidth: 44, minHeight: 44, padding: 10, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: T.surfaceDim },
  selectedDay: { backgroundColor: T.actionSurface },
  dayText: { color: T.textPrimary, fontFamily: T.fontBodyMedium, fontSize: 14 },
  selectedText: { color: T.actionContent },
  pressed: { opacity: 0.8 },
  copy: { color: T.textSecondary, fontFamily: T.fontBody, fontSize: 14, lineHeight: 21 },
  bars: { height: 110, flexDirection: "row", alignItems: "flex-end", gap: 3, borderBottomWidth: 1, borderBottomColor: T.borderBlack, paddingBottom: 4 },
  bar: { flex: 1, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  axis: { flexDirection: "row", justifyContent: "space-between", paddingTop: 8 },
  axisText: { color: T.textSecondary, fontFamily: T.fontBody, fontSize: 12 },
  detailsButton: { minHeight: 44, justifyContent: "center", alignSelf: "flex-start" },
  detailsText: { color: T.primary, fontFamily: T.fontBodyBold, fontSize: 14 },
  details: { gap: 6 },
});
