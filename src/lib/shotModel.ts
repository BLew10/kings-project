import type { DribbleBucket, ShotClockBucket, ShotZone } from "../types/shots";

const HOOP_X = -47;
const HOOP_Y = 0;

/** Calculates Euclidean shot distance in feet from the modeled offensive hoop. */
export function getShotDistance(x: number, y: number): number {
  return Math.hypot(x - HOOP_X, y - HOOP_Y);
}

/** Maps raw court coordinates to a pragmatic basketball shot zone. */
export function getShotZone(x: number, y: number): ShotZone {
  if (x > 0) return "backcourt";

  const distance = getShotDistance(x, y);
  const absY = Math.abs(y);

  if (distance <= 4) return "rim";
  if (distance <= 8) return "paint";
  if (distance <= 16) return "short_midrange";

  const isThree = distance >= 23 || (x <= -33 && absY >= 22);
  if (!isThree) return "long_midrange";
  if (x <= -34 && absY >= 21) return "corner_three";
  return "above_break_three";
}

/** Buckets shot-clock time into coaching-friendly possession phases. */
export function getShotClockBucket(shotClock: number): ShotClockBucket {
  if (shotClock >= 18) return "early";
  if (shotClock >= 8) return "middle";
  if (shotClock >= 4) return "late";
  return "end";
}

/** Buckets dribble count into compact labels for filtering and summary text. */
export function getDribbleBucket(dribbles: number): DribbleBucket {
  if (dribbles === 0) return "0";
  if (dribbles === 1) return "1";
  if (dribbles <= 3) return "2-3";
  return "4+";
}

/** Returns the point value implied by a derived shot zone. */
export function getShotValue(zone: ShotZone): 2 | 3 {
  return zone === "corner_three" || zone === "above_break_three" || zone === "backcourt" ? 3 : 2;
}

/** Formats derived shot zones for display. */
export function formatZone(zone: ShotZone | string): string {
  const labels: Record<string, string> = {
    rim: "Rim",
    paint: "Paint",
    short_midrange: "Short Midrange",
    long_midrange: "Long Midrange",
    corner_three: "Corner 3",
    above_break_three: "Above-Break 3",
    backcourt: "Backcourt",
  };
  return labels[zone] ?? zone;
}

/** Formats a decimal rate as a one-decimal percentage. */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0.0%";
  return `${(value * 100).toFixed(1)}%`;
}

/** Formats points per shot with two decimal places. */
export function formatPointsPerShot(value: number): string {
  if (!Number.isFinite(value)) return "0.00";
  return value.toFixed(2);
}
