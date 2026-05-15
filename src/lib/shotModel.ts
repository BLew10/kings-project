import type { DribbleBucket, ShotClockBucket, ShotZone } from "../types/shots";

const HOOP_X = -47;
const HOOP_Y = 0;

export function getShotDistance(x: number, y: number): number {
  return Math.hypot(x - HOOP_X, y - HOOP_Y);
}

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

export function getShotClockBucket(shotClock: number): ShotClockBucket {
  if (shotClock >= 18) return "early";
  if (shotClock >= 8) return "middle";
  if (shotClock >= 4) return "late";
  return "end";
}

export function getDribbleBucket(dribbles: number): DribbleBucket {
  if (dribbles === 0) return "0";
  if (dribbles === 1) return "1";
  if (dribbles <= 3) return "2-3";
  return "4+";
}

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

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "0.0%";
  return `${(value * 100).toFixed(1)}%`;
}
