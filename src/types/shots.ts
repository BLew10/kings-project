export type ShotOutcome = "TRUE" | "FALSE";
export type ContestLevel = "uncontested" | "lightly_contested" | "heavily_contested";
export type ShotType = "heave" | "jumper" | "post" | "floater" | "layup";
export type ScalarBooleanFilter = "all" | "true" | "false";

export type Shot = {
  shooterId: string;
  shooterName: string;
  date: string;
  year: number;
  month: number;
  day: number;
  period: number;
  startGameClock: number;
  endGameClock: number;
  shotClock: number;
  x: number;
  y: number;
  outcome: boolean;
  passerX: number | null;
  passerY: number | null;
  assisted: boolean;
  assistOpportunity: boolean;
  blocked: boolean;
  fouled: boolean;
  shotType: ShotType;
  complexShotType: string;
  contested: boolean;
  contestLevel: ContestLevel;
  catchAndShoot: boolean;
  dribblesBefore: number;
  zone: ShotZone;
  distance: number;
  shotValue: 2 | 3;
  shotClockBucket: ShotClockBucket;
  dribbleBucket: DribbleBucket;
};

export type ShotZone =
  | "rim"
  | "paint"
  | "short_midrange"
  | "long_midrange"
  | "corner_three"
  | "above_break_three"
  | "backcourt";

export type ShotClockBucket = "early" | "middle" | "late" | "end" | "unknown";
export type DribbleBucket = "0" | "1" | "2-3" | "4+" | "unknown";

export type Filters = {
  player: string[];
  shotType: ShotType[];
  complexShotType: string[];
  contestLevel: ContestLevel[];
  zone: ShotZone[];
  shotClockBucket: ShotClockBucket[];
  dribbleBucket: DribbleBucket[];
  shotValue: Array<"2" | "3">;
  period: string[];
  assisted: ScalarBooleanFilter;
  catchAndShoot: ScalarBooleanFilter;
  assistOpportunity: ScalarBooleanFilter;
  blocked: ScalarBooleanFilter;
  fouled: ScalarBooleanFilter;
  contested: ScalarBooleanFilter;
  outcome: ScalarBooleanFilter;
  dateFrom: string;
  dateTo: string;
};

export type PlayerOption = {
  id: string;
  name: string;
  label: string;
};

export type MetricSummary = {
  attempts: number;
  makes: number;
  points: number;
  fgPct: number;
  pointsPerShot: number;
  assistedPct: number;
  catchShootPct: number;
  blockedPct: number;
  fouledPct: number;
  avgShotClock: number;
  avgDribbles: number;
  avgDistance: number;
  avgShotDuration: number;
  avgPassDistance: number;
};

export type BreakdownRow = {
  key: string;
  attempts: number;
  makes: number;
  points: number;
  fgPct: number;
  pointsPerShot: number;
  share: number;
};

