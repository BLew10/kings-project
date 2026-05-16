import { useMemo } from "react";
import { DRIBBLE_BUCKETS, PERIODS, SHOT_CLOCK_BUCKETS, SHOT_VALUES, SHOT_ZONES } from "@/lib/filterSchema";
import { formatPeriod } from "@/lib/labels";
import type { FilterOptions } from "@/lib/promptBuilder";
import {
  applyFilters,
  breakdownBy,
  getInsightFlags,
  getLineupShots,
  getOptions,
  getPlayerRows,
  getPlayerZoneShares,
  getPlayers,
  groupShotsByPlayer,
  summarize,
} from "@/lib/stats";
import type { Filters, Shot } from "@/types/shots";

export type DashboardView = "team" | "players" | "lineup";

type Options = {
  shots: Shot[];
  filters: Filters;
  view: DashboardView;
  lineup: string[];
};

/** Builds every derived value the dashboard renders from the raw shot collection plus current state. */
export function useDashboardComputations({ shots, filters, view, lineup }: Options) {
  const players = useMemo(() => getPlayers(shots), [shots]);
  const teamFilters = useMemo(() => ({ ...filters, player: [] }), [filters]);
  const teamShots = useMemo(() => applyFilters(shots, teamFilters), [shots, teamFilters]);
  const filteredShots = useMemo(() => applyFilters(shots, filters), [shots, filters]);
  const lineupShots = useMemo(() => getLineupShots(teamShots, lineup), [teamShots, lineup]);
  const activeShots = view === "lineup" ? lineupShots : filteredShots;

  const summary = useMemo(() => summarize(activeShots), [activeShots]);
  const teamSummary = useMemo(() => summarize(teamShots), [teamShots]);

  const playerRows = useMemo(() => getPlayerRows(teamShots), [teamShots]);
  const playerZones = useMemo(() => getPlayerZoneShares(teamShots), [teamShots]);
  const playerShots = useMemo(() => {
    const grouped: Record<string, Shot[]> = {};
    for (const [playerId, shots] of groupShotsByPlayer(teamShots)) {
      grouped[playerId] = shots;
    }
    return grouped;
  }, [teamShots]);

  const breakdowns = useMemo(
    () => ({
      zone: breakdownBy(activeShots, (s) => s.zone),
      detail: breakdownBy(activeShots, (s) => s.complexShotType),
      context: breakdownBy(activeShots, (s) => s.contestLevel),
      clock: breakdownBy(activeShots, (s) => s.shotClockBucket),
      dribble: breakdownBy(activeShots, (s) => s.dribbleBucket),
      value: breakdownBy(activeShots, (s) => `${s.shotValue}`),
      period: breakdownBy(activeShots, (s) => formatPeriod(s.period)),
    }),
    [activeShots],
  );

  const insights = useMemo(() => getInsightFlags(activeShots, teamShots), [activeShots, teamShots]);

  const dates = useMemo(() => shots.map((s) => s.date).sort(), [shots]);
  const minDate = dates[0] ?? "";
  const maxDate = dates[dates.length - 1] ?? "";

  const shotTypes = useMemo(() => getOptions(shots, (s) => s.shotType), [shots]);
  const complexShotTypes = useMemo(() => getOptions(shots, (s) => s.complexShotType), [shots]);
  const contestLevels = useMemo(() => getOptions(shots, (s) => s.contestLevel), [shots]);
  const promptFilterOptions = useMemo<FilterOptions>(
    () => ({
      players,
      shotTypes,
      shotDetails: complexShotTypes,
      contestLevels,
      shotClockBuckets: SHOT_CLOCK_BUCKETS,
      zones: SHOT_ZONES,
      dribbleBuckets: DRIBBLE_BUCKETS,
      shotValues: SHOT_VALUES,
      periods: [...PERIODS],
    }),
    [complexShotTypes, contestLevels, players, shotTypes],
  );

  return {
    players,
    teamFilters,
    teamShots,
    activeShots,
    summary,
    teamSummary,
    playerRows,
    playerZones,
    playerShots,
    breakdowns,
    insights,
    minDate,
    maxDate,
    shotTypes,
    complexShotTypes,
    contestLevels,
    promptFilterOptions,
  };
}
