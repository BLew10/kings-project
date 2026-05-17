import type { DribbleBucket, ShotClockBucket, ShotZone } from "../types/shots";

export const HOOP_X = -47;
export const HOOP_Y = 0;
const HALF_COURT_X = 0;
export const CORNER_ABS_Y = 22;
export const ABOVE_BREAK_DISTANCE = 23.75;
// Where the straight corner-3 line intersects the 23'9" arc:
// (x - HOOP_X)^2 + y^2 = 23.75^2, with |y| fixed at 22.
const CORNER_END_X = HOOP_X + Math.sqrt(ABOVE_BREAK_DISTANCE ** 2 - CORNER_ABS_Y ** 2);
const BACKCOURT_MIN_DISTANCE = 47;

/** Calculates Euclidean shot distance in feet from the modeled offensive hoop. */
export function getShotDistance(x: number, y: number): number {
  return Math.hypot(x - HOOP_X, y - HOOP_Y);
}

/** Maps raw court coordinates to a pragmatic basketball shot zone. */
export function getShotZone(x: number, y: number): ShotZone {
  if (x > HALF_COURT_X && getShotDistance(x, y) > BACKCOURT_MIN_DISTANCE) return "backcourt";

  const distance = getShotDistance(x, y);
  const absY = Math.abs(y);

  if (isCornerThree(x, absY)) return "corner_three";
  if (isThreePointShot(x, y)) return "above_break_three";

  if (distance <= 4) return "rim";
  if (distance <= 8) return "paint";
  if (distance <= 16) return "short_midrange";
  return "long_midrange";
}

/** Returns whether coordinates are beyond the modeled three-point line. */
export function isThreePointShot(x: number, y: number): boolean {
  const distance = getShotDistance(x, y);
  const absY = Math.abs(y);
  // The above-break line is a true arc, so every non-corner shot is checked
  // against its radial distance from the hoop, not against fixed x/y buckets.
  return distance >= ABOVE_BREAK_DISTANCE || isCornerThree(x, absY);
}

/** Buckets shot-clock time into coaching-friendly possession phases. */
export function getShotClockBucket(shotClock: number): ShotClockBucket {
  if (!Number.isFinite(shotClock)) return "unknown";
  if (shotClock >= 18) return "early";
  if (shotClock >= 8) return "middle";
  if (shotClock >= 4) return "late";
  return "end";
}

/** Buckets dribble count into compact labels for filtering and summary text. */
export function getDribbleBucket(dribbles: number): DribbleBucket {
  if (!Number.isFinite(dribbles)) return "unknown";
  if (dribbles === 0) return "0";
  if (dribbles === 1) return "1";
  if (dribbles <= 3) return "2-3";
  return "4+";
}

/** Returns the point value implied by raw coordinates. */
export function getShotValue(x: number, y: number): 2 | 3 {
  return isThreePointShot(x, y) ? 3 : 2;
}

function isCornerThree(x: number, absY: number): boolean {
  return absY >= CORNER_ABS_Y && x <= CORNER_END_X;
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

/** Formats shot zones with the distance rules used to derive them. */
export function formatZoneWithRange(zone: ShotZone | string): string {
  const labels: Record<string, string> = {
    rim: "Rim (0-4 ft)",
    paint: "Paint (4-8 ft)",
    short_midrange: "Short Midrange (8-16 ft)",
    long_midrange: "Long Midrange (16 ft-arc)",
    corner_three: "Corner 3 (sideline 22+ ft)",
    above_break_three: "Above-Break 3 (23.75+ ft)",
    backcourt: "Backcourt Heave (beyond half court)",
  };
  return labels[zone] ?? formatZone(zone);
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
