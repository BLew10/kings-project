import { ABOVE_BREAK_DISTANCE, CORNER_ABS_Y, HOOP_X, HOOP_Y } from "@/lib/shotModel";
import type { Shot } from "@/types/shots";

export const COURT = {
  minX: -52,
  maxX: 0,
  minY: -25,
  maxY: 25,
  width: 520,
  height: 500,
} as const;

export type CourtPoint = { x: number; y: number };
export type CourtBin = {
  x: number;
  y: number;
  attempts: number;
  makes: number;
  points: number;
  marker?: "backcourt";
};

/** Converts data coordinates to SVG viewport coordinates. */
export function toCourtPoint(x: number, y: number): CourtPoint {
  const courtX = ((x - COURT.minX) / (COURT.maxX - COURT.minX)) * COURT.width;
  const courtY = 250 - (y / (COURT.maxY - COURT.minY)) * COURT.height;
  return { x: courtX, y: courtY };
}

function isInsideHalfCourtView(x: number, y: number): boolean {
  return x >= COURT.minX && x <= COURT.maxX && y >= COURT.minY && y <= COURT.maxY;
}

function courtPixelsPerFoot(): number {
  return COURT.width / (COURT.maxX - COURT.minX);
}

export const THREE_POINT_LINE = (() => {
  const cornerEndX = HOOP_X + Math.sqrt(ABOVE_BREAK_DISTANCE ** 2 - CORNER_ABS_Y ** 2);
  const topCorner = toCourtPoint(cornerEndX, CORNER_ABS_Y);
  const bottomCorner = toCourtPoint(cornerEndX, -CORNER_ABS_Y);
  const baseline = toCourtPoint(COURT.minX, HOOP_Y);
  const arcRadius = ABOVE_BREAK_DISTANCE * courtPixelsPerFoot();
  return {
    baseline,
    cornerEnd: topCorner,
    topCorner,
    bottomCorner,
    arcPath: `M ${topCorner.x} ${topCorner.y} A ${arcRadius} ${arcRadius} 0 0 1 ${bottomCorner.x} ${bottomCorner.y}`,
  };
})();

export const LANE = (() => {
  const baseline = toCourtPoint(COURT.minX, HOOP_Y);
  const hoop = toCourtPoint(HOOP_X, HOOP_Y);
  const freeThrowLine = toCourtPoint(HOOP_X + 15, HOOP_Y);
  const top = toCourtPoint(COURT.minX, 8);
  const bottom = toCourtPoint(COURT.minX, -8);
  const topSideline = toCourtPoint(HOOP_X, CORNER_ABS_Y);
  const bottomSideline = toCourtPoint(HOOP_X, -CORNER_ABS_Y);
  const freeThrowRadius = 6 * courtPixelsPerFoot();
  return {
    baseline,
    hoop,
    top,
    bottom,
    topSideline,
    bottomSideline,
    width: freeThrowLine.x - baseline.x,
    height: bottom.y - top.y,
    freeThrowArcPath: `M ${freeThrowLine.x} ${freeThrowLine.y - freeThrowRadius} A ${freeThrowRadius} ${freeThrowRadius} 0 0 1 ${freeThrowLine.x} ${freeThrowLine.y + freeThrowRadius}`,
  };
})();

/** Maps field-goal efficiency and volume intensity to a heatmap fill color. */
export function fillFor(makeRate: number, intensity: number): string {
  const base = makeRate >= 0.5 ? "16, 185, 129" : makeRate >= 0.4 ? "245, 158, 11" : "244, 63, 94";
  const opacity = 0.35 + intensity * 0.6;
  return `rgba(${base}, ${opacity.toFixed(2)})`;
}

/** Groups nearby shot attempts into rendered heatmap cells. */
export function getBins(shots: Shot[]): CourtBin[] {
  const groups = new Map<string, CourtBin>();
  for (const shot of shots) {
    if (!Number.isFinite(shot.x) || !Number.isFinite(shot.y)) continue;
    const isBackcourt = shot.zone === "backcourt";
    if (!isBackcourt && !isInsideHalfCourtView(shot.x, shot.y)) continue;
    const x = isBackcourt ? COURT.maxX - 2 : Math.round(shot.x / 3) * 3;
    const y = isBackcourt ? 0 : Math.round(shot.y / 3) * 3;
    const key = isBackcourt ? "backcourt" : `${x}:${y}`;
    const existing = groups.get(key) ?? {
      x,
      y,
      attempts: 0,
      makes: 0,
      points: 0,
      marker: isBackcourt ? "backcourt" : undefined,
    };
    existing.attempts += 1;
    existing.makes += shot.outcome ? 1 : 0;
    existing.points += shot.outcome ? shot.shotValue : 0;
    groups.set(key, existing);
  }
  return [...groups.values()];
}
