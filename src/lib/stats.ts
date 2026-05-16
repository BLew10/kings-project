import type { BreakdownRow, Filters, MetricSummary, Shot } from "../types/shots";

export function applyFilters(shots: Shot[], filters: Filters): Shot[] {
  return shots.filter((shot) => {
    if (filters.player.length > 0 && !filters.player.includes(shot.shooterName)) return false;
    if (filters.shotType.length > 0 && !filters.shotType.includes(shot.shotType)) return false;
    if (filters.complexShotType.length > 0 && !filters.complexShotType.includes(shot.complexShotType)) return false;
    if (filters.contestLevel.length > 0 && !filters.contestLevel.includes(shot.contestLevel)) return false;
    if (filters.assisted !== "all" && String(shot.assisted) !== filters.assisted) return false;
    if (filters.catchAndShoot !== "all" && String(shot.catchAndShoot) !== filters.catchAndShoot) return false;
    if (filters.shotClockBucket.length > 0 && !filters.shotClockBucket.includes(shot.shotClockBucket)) return false;
    if (filters.dateFrom && shot.date < filters.dateFrom) return false;
    if (filters.dateTo && shot.date > filters.dateTo) return false;
    return true;
  });
}

export function summarize(shots: Shot[]): MetricSummary {
  const attempts = shots.length;
  const makes = shots.filter((shot) => shot.outcome).length;
  const sum = <T extends number>(values: T[]) => values.reduce((total, value) => total + value, 0);
  const rate = (count: number) => (attempts ? count / attempts : 0);

  return {
    attempts,
    makes,
    fgPct: rate(makes),
    assistedPct: rate(shots.filter((shot) => shot.assisted).length),
    catchShootPct: rate(shots.filter((shot) => shot.catchAndShoot).length),
    blockedPct: rate(shots.filter((shot) => shot.blocked).length),
    fouledPct: rate(shots.filter((shot) => shot.fouled).length),
    avgShotClock: attempts ? sum(shots.map((shot) => shot.shotClock)) / attempts : 0,
    avgDribbles: attempts ? sum(shots.map((shot) => shot.dribblesBefore)) / attempts : 0,
  };
}

export function breakdownBy(shots: Shot[], getKey: (shot: Shot) => string): BreakdownRow[] {
  const groups = new Map<string, Shot[]>();
  for (const shot of shots) {
    const key = getKey(shot);
    groups.set(key, [...(groups.get(key) ?? []), shot]);
  }

  return [...groups.entries()]
    .map(([key, group]) => {
      const makes = group.filter((shot) => shot.outcome).length;
      return {
        key,
        attempts: group.length,
        makes,
        fgPct: group.length ? makes / group.length : 0,
        share: shots.length ? group.length / shots.length : 0,
      };
    })
    .sort((a, b) => b.attempts - a.attempts);
}

export function getPlayers(shots: Shot[]): string[] {
  return [...new Set(shots.map((shot) => shot.shooterName))].sort();
}

export function getOptions(shots: Shot[], getKey: (shot: Shot) => string): string[] {
  return [...new Set(shots.map(getKey))].sort();
}

export function getPlayerRows(shots: Shot[]) {
  return getPlayers(shots)
    .map((player) => {
      const playerShots = shots.filter((shot) => shot.shooterName === player);
      return { player, ...summarize(playerShots) };
    })
    .sort((a, b) => b.attempts - a.attempts);
}

export function getPlayerZoneShares(shots: Shot[]): Record<string, BreakdownRow[]> {
  const result: Record<string, BreakdownRow[]> = {};
  for (const player of getPlayers(shots)) {
    const playerShots = shots.filter((shot) => shot.shooterName === player);
    result[player] = breakdownBy(playerShots, (shot) => shot.zone);
  }
  return result;
}

export function getInsightFlags(shots: Shot[], baseline: Shot[]): string[] {
  const flags: string[] = [];
  const minSample = 40;
  const zones = breakdownBy(shots, (shot) => shot.zone);
  const baselineZones = breakdownBy(baseline, (shot) => shot.zone);

  for (const zone of zones) {
    if (zone.attempts < minSample) continue;
    const base = baselineZones.find((item) => item.key === zone.key);
    if (!base || base.attempts < minSample) continue;
    const delta = zone.fgPct - base.fgPct;
    if (delta >= 0.07) flags.push(`${zone.key}: efficient strength (+${(delta * 100).toFixed(1)} pts vs team).`);
    if (delta <= -0.07) flags.push(`${zone.key}: below team baseline (${(delta * 100).toFixed(1)} pts).`);
  }

  return flags.slice(0, 4);
}

export function getLineupShots(shots: Shot[], selectedPlayers: string[]): Shot[] {
  const selected = new Set(selectedPlayers);
  return shots.filter((shot) => selected.has(shot.shooterName));
}
