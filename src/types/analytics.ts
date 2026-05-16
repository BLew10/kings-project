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
