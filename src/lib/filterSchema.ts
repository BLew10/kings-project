import type { DribbleBucket, Filters, ShotClockBucket, ShotZone } from "@/types/shots";

export const SHOT_CLOCK_BUCKETS: ShotClockBucket[] = ["early", "middle", "late", "end", "unknown"];
export const DRIBBLE_BUCKETS: DribbleBucket[] = ["0", "1", "2-3", "4+", "unknown"];
export const SHOT_ZONES: ShotZone[] = [
  "rim",
  "paint",
  "short_midrange",
  "long_midrange",
  "corner_three",
  "above_break_three",
  "backcourt",
];
export const SHOT_VALUES: Array<"2" | "3"> = ["2", "3"];
export const PERIODS = ["1", "2", "3", "4", "5"] as const;

export const DEFAULT_FILTERS: Filters = {
  player: [],
  shotType: [],
  complexShotType: [],
  contestLevel: [],
  zone: [],
  shotClockBucket: [],
  dribbleBucket: [],
  shotValue: [],
  period: [],
  assisted: "all",
  catchAndShoot: "all",
  assistOpportunity: "all",
  blocked: "all",
  fouled: "all",
  contested: "all",
  outcome: "all",
  dateFrom: "",
  dateTo: "",
};

export const ARRAY_FILTER_KEYS = [
  "player",
  "shotType",
  "complexShotType",
  "contestLevel",
  "zone",
  "shotClockBucket",
  "dribbleBucket",
  "shotValue",
  "period",
] as const;

export const SCALAR_FILTER_KEYS = [
  "assisted",
  "catchAndShoot",
  "assistOpportunity",
  "blocked",
  "fouled",
  "contested",
  "outcome",
  "dateFrom",
  "dateTo",
] as const;
