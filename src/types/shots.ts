export type ShotOutcome = "TRUE" | "FALSE";
export type ContestLevel = "uncontested" | "lightly_contested" | "heavily_contested";
export type ShotType = "heave" | "jumper" | "post" | "floater" | "layup";

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
