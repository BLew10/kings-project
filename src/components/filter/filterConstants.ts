import type { ScalarBooleanFilter } from "@/types/filters";

export type FilterSegmentOption = { value: ScalarBooleanFilter; label: string };

export const CREATION_OPTIONS: FilterSegmentOption[] = [
  { value: "all", label: "Any" },
  { value: "true", label: "Assisted" },
  { value: "false", label: "Self-created" },
];

export const TOUCH_OPTIONS: FilterSegmentOption[] = [
  { value: "all", label: "Any" },
  { value: "true", label: "Catch & shoot" },
  { value: "false", label: "Off dribble" },
];

export const BOOLEAN_FILTER_OPTIONS: FilterSegmentOption[] = [
  { value: "all", label: "Any" },
  { value: "true", label: "Yes" },
  { value: "false", label: "No" },
];

export const OUTCOME_OPTIONS: FilterSegmentOption[] = [
  { value: "all", label: "Any" },
  { value: "true", label: "Make" },
  { value: "false", label: "Miss" },
];

export const FILTER_TOOLTIPS = {
  player: "The player who took the shot.",
  shotType: "Broad shot family, such as jumper, post shot, floater, layup, or heave.",
  complexShotType: "More specific shot action, such as pull-up jumper, stepback, lob, or tip.",
  contestLevel: "How strongly the defense challenged the shot: uncontested, lightly contested, or heavily contested.",
  dateRange: "Filters shots by the game date.",
  assisted: "Whether the made shot was marked with an assist in play-by-play.",
  catchAndShoot: "Whether the shooter dribbled before shooting. True means 0 dribbles; false means the shooter dribbled.",
  shotClockBucket: "Seconds remaining on the shot clock when the shot was released, grouped into clock buckets.",
  zone: "Derived shot area based on the release location and NBA court geometry.",
  dribbleBucket: "Number of dribbles the shooter took before shooting, grouped into buckets.",
  shotValue: "Derived 2-point or 3-point attempt value based on the shot location and NBA three-point line.",
  period: "Game period. Periods 1-4 are quarters; period 5 and up are overtime periods.",
  outcome: "Whether the shot was made or missed.",
  assistOpportunity: "True when the shooter took 1 or fewer dribbles and held the ball less than 2.5 seconds.",
  blocked: "Whether the shot was blocked.",
  fouled: "Whether the shooter was fouled.",
  contested: "Whether any defenders contested the shot.",
} as const;
