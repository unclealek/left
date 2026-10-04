function resolveParts(timezone: string, date: Date) {
  const formatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: timezone,
    hour12: false,
    weekday: "short",
    hour: "2-digit",
  });

  const parts = formatter.formatToParts(date);
  const weekday = parts.find((part) => part.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");

  return { weekday, hour };
}

const weekdayMap: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 0,
};

export function getVenueLocalSlot(timezone?: string | null, date = new Date()) {
  const safeTimezone = timezone || "UTC";

  try {
    const { weekday, hour } = resolveParts(safeTimezone, date);
    let dayOfWeek = weekdayMap[weekday] ?? 0;
    let normalizedHour = hour;

    // BestTime documents a 06:00 -> 05:00 window. Hours before 06:00 belong to the prior day.
    if (normalizedHour < 6) {
      dayOfWeek = (dayOfWeek + 6) % 7;
      normalizedHour += 24;
    }

    return {
      timezone: safeTimezone,
      dayOfWeek,
      hour: normalizedHour,
    };
  } catch {
    return getVenueLocalSlot("UTC", date);
  }
}

// Account for zones whose UTC offset includes 30 or 45 minutes, and DST changes.
export function nextVenueHour(timezone?: string | null, date = new Date()): Date {
  let formatter: Intl.DateTimeFormat;
  try { formatter = new Intl.DateTimeFormat("en-GB", { timeZone: timezone || "UTC", minute: "2-digit" }); }
  catch { formatter = new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", minute: "2-digit" }); }
  const start = Math.floor(date.getTime() / 60_000) * 60_000;
  for (let minutes = 1; minutes <= 60; minutes++) {
    const candidate = new Date(start + minutes * 60_000);
    if (formatter.formatToParts(candidate).some(part => part.type === "minute" && Number(part.value) === 0)) return candidate;
  }
  return new Date(start + 3_600_000);
}
