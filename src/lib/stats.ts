import { labelFor } from "./labels";
import { formatPointsPerShot, formatZone } from "./shotModel";
import type { BreakdownRow, Filters, MetricSummary, RankedInsight, Shot } from "../types/shots";

/** Applies all dashboard filters to a shot collection. */
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

/** Aggregates headline scoring, creation, and clock metrics for a shot collection. */
export function summarize(shots: Shot[]): MetricSummary {
  const attempts = shots.length;
  const makes = shots.filter((shot) => shot.outcome).length;
  const points = shots.reduce((total, shot) => total + (shot.outcome ? shot.shotValue : 0), 0);
  const sum = <T extends number>(values: T[]) => values.reduce((total, value) => total + value, 0);
  const rate = (count: number) => (attempts ? count / attempts : 0);

  return {
    attempts,
    makes,
    points,
    fgPct: rate(makes),
    pointsPerShot: attempts ? points / attempts : 0,
    assistedPct: rate(shots.filter((shot) => shot.assisted).length),
    catchShootPct: rate(shots.filter((shot) => shot.catchAndShoot).length),
    blockedPct: rate(shots.filter((shot) => shot.blocked).length),
    fouledPct: rate(shots.filter((shot) => shot.fouled).length),
    avgShotClock: attempts ? sum(shots.map((shot) => shot.shotClock)) / attempts : 0,
    avgDribbles: attempts ? sum(shots.map((shot) => shot.dribblesBefore)) / attempts : 0,
  };
}

/** Breaks shots into rows by a caller-provided grouping key. */
export function breakdownBy(shots: Shot[], getKey: (shot: Shot) => string): BreakdownRow[] {
  const groups = new Map<string, Shot[]>();
  for (const shot of shots) {
    const key = getKey(shot);
    groups.set(key, [...(groups.get(key) ?? []), shot]);
  }

  return [...groups.entries()]
    .map(([key, group]) => {
      const makes = group.filter((shot) => shot.outcome).length;
      const points = group.reduce((total, shot) => total + (shot.outcome ? shot.shotValue : 0), 0);
      return {
        key,
        attempts: group.length,
        makes,
        points,
        fgPct: group.length ? makes / group.length : 0,
        pointsPerShot: group.length ? points / group.length : 0,
        share: shots.length ? group.length / shots.length : 0,
      };
    })
    .sort((a, b) => b.attempts - a.attempts);
}

/** Returns the sorted unique player names in a shot collection. */
export function getPlayers(shots: Shot[]): string[] {
  return [...new Set(shots.map((shot) => shot.shooterName))].sort();
}

/** Returns sorted unique values for a shot field selector. */
export function getOptions(shots: Shot[], getKey: (shot: Shot) => string): string[] {
  return [...new Set(shots.map(getKey))].sort();
}

/** Builds sortable per-player summary rows. */
export function getPlayerRows(shots: Shot[]) {
  return getPlayers(shots)
    .map((player) => {
      const playerShots = shots.filter((shot) => shot.shooterName === player);
      return { player, ...summarize(playerShots) };
    })
    .sort((a, b) => b.attempts - a.attempts);
}

/** Builds per-player zone share rows used by the player comparison sparkline. */
export function getPlayerZoneShares(shots: Shot[]): Record<string, BreakdownRow[]> {
  const result: Record<string, BreakdownRow[]> = {};
  for (const player of getPlayers(shots)) {
    const playerShots = shots.filter((shot) => shot.shooterName === player);
    result[player] = breakdownBy(playerShots, (shot) => shot.zone);
  }
  return result;
}

/** Returns concise zone-efficiency flags against a baseline profile. */
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

/** Builds ranked, copy-ready coaching insights from the active profile and team baseline. */
export function getRankedInsights(shots: Shot[], baseline: Shot[]): RankedInsight[] {
  const insights: RankedInsight[] = [];
  const summary = summarize(shots);
  const baselineSummary = summarize(baseline);

  insights.push(...buildBreakdownInsights("zone", breakdownBy(shots, (shot) => shot.zone), breakdownBy(baseline, (shot) => shot.zone), formatZone));
  insights.push(
    ...buildBreakdownInsights(
      "detail",
      breakdownBy(shots, (shot) => shot.complexShotType),
      breakdownBy(baseline, (shot) => shot.complexShotType),
      labelFor,
    ),
  );

  if (summary.attempts >= 80) {
    const assistedDelta = summary.assistedPct - baselineSummary.assistedPct;
    if (Math.abs(assistedDelta) >= 0.08) {
      insights.push({
        id: "role-creation",
        priority: "role",
        title: assistedDelta > 0 ? "Role signal: assisted finisher" : "Role signal: self-creation heavy",
        detail:
          assistedDelta > 0
            ? `Assisted rate is ${(assistedDelta * 100).toFixed(1)} pts above baseline, so the profile depends more on advantage creation by teammates.`
            : `Assisted rate is ${(Math.abs(assistedDelta) * 100).toFixed(1)} pts below baseline, signaling more off-dribble or bailout creation burden.`,
        attempts: summary.attempts,
      });
    }

    const catchShootDelta = summary.catchShootPct - baselineSummary.catchShootPct;
    if (Math.abs(catchShootDelta) >= 0.08) {
      insights.push({
        id: "role-touch-type",
        priority: "role",
        title: catchShootDelta > 0 ? "Role signal: spacing profile" : "Role signal: on-ball profile",
        detail:
          catchShootDelta > 0
            ? `Catch-and-shoot rate is ${(catchShootDelta * 100).toFixed(1)} pts above baseline; preserve actions that generate quick feet-set looks.`
            : `Catch-and-shoot rate is ${(Math.abs(catchShootDelta) * 100).toFixed(1)} pts below baseline; evaluate whether the on-ball diet is intentional or forced.`,
        attempts: summary.attempts,
      });
    }
  }

  if (summary.attempts < 80) {
    insights.push({
      id: "caveat-sample",
      priority: "caveat",
      title: "Sample caveat",
      detail: `${summary.attempts.toLocaleString()} attempts is useful for exploration but thin for firm coaching conclusions.`,
      attempts: summary.attempts,
    });
  }

  return insights
    .sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority) || b.attempts - a.attempts)
    .slice(0, 5);
}

/** Filters a shot collection down to the selected lineup players. */
export function getLineupShots(shots: Shot[], selectedPlayers: string[]): Shot[] {
  const selected = new Set(selectedPlayers);
  return shots.filter((shot) => selected.has(shot.shooterName));
}

/** Creates preserve/trim insight candidates for one categorical breakdown. */
function buildBreakdownInsights(
  scope: string,
  rows: BreakdownRow[],
  baselineRows: BreakdownRow[],
  formatKey: (key: string) => string,
): RankedInsight[] {
  const minAttempts = 40;
  const minShare = 0.08;
  const baselineByKey = new Map(baselineRows.map((row) => [row.key, row]));

  return rows
    .filter((row) => row.attempts >= minAttempts && row.share >= minShare)
    .flatMap((row): RankedInsight[] => {
      const baseline = baselineByKey.get(row.key);
      if (!baseline || baseline.attempts < minAttempts) return [];

      const ppsDelta = row.pointsPerShot - baseline.pointsPerShot;
      if (ppsDelta >= 0.12) {
        return [{
          id: `preserve-${scope}-${row.key}`,
          priority: "preserve" as const,
          title: `Best bet: ${formatKey(row.key)}`,
          detail: `${formatPointsPerShot(row.pointsPerShot)} PPS on ${row.attempts.toLocaleString()} attempts, ${ppsDelta.toFixed(2)} above the team baseline for that slice.`,
          attempts: row.attempts,
        }];
      }

      if (ppsDelta <= -0.12) {
        return [{
          id: `trim-${scope}-${row.key}`,
          priority: "trim" as const,
          title: `Trim candidate: ${formatKey(row.key)}`,
          detail: `${formatPointsPerShot(row.pointsPerShot)} PPS on ${row.attempts.toLocaleString()} attempts, ${Math.abs(ppsDelta).toFixed(2)} below the team baseline for that slice.`,
          attempts: row.attempts,
        }];
      }

      return [];
    })
    .sort((a, b) => priorityWeight(a.priority) - priorityWeight(b.priority) || b.attempts - a.attempts);
}

/** Orders insight categories by how actionable they usually are for staff. */
function priorityWeight(priority: RankedInsight["priority"]): number {
  const weights: Record<RankedInsight["priority"], number> = {
    preserve: 0,
    trim: 1,
    role: 2,
    caveat: 3,
  };
  return weights[priority];
}
