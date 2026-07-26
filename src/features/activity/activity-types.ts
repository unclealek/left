export type VenueActivityLabel =
  | "quiet"
  | "light"
  | "active"
  | "busy"
  | "packed"
  | "unknown"
  | "closed";

export type VenueActivityComparison =
  | "quieter_than_usual"
  | "as_expected"
  | "busier_than_usual"
  | "unknown";

export type VenueActivity = {
  label: VenueActivityLabel;
  displayText: string;
  score: number | null;
  forecastScore: number | null;
  liveAvailable: boolean;
  comparison: VenueActivityComparison;
  comparisonText: string;
  updatedAt: string | null;
  isStale: boolean;
  refreshing: boolean;
  source: "besttime" | "left";
};

export type VenuePresenceCounts = {
  total: number;
  visible: number;
  openToMeet: number;
};

export type VenueActivityEnvelope = {
  venueId: string;
  googlePlaceId: string | null;
  name: string;
  activity: VenueActivity;
  leftPresence: VenuePresenceCounts;
};
