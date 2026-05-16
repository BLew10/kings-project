import { useMemo } from "react";
import { applyFilters, breakdownBy, getInsightFlags, summarize } from "@/lib/stats";
import { formatZone } from "@/lib/shotModel";
import type { BreakdownRow, Filters, MetricSummary, Shot } from "@/types/shots";
import type { PlayerRow } from "@/components/player/playerTableColumns";

type Options = {
  shots: Shot[];
  teamShots: Shot[];
  teamFilters: Filters;
  selected: string | undefined;
  playerRows: PlayerRow[];
};

type PromptPlayerProfile = {
  playerId: string | undefined;
  label: string | undefined;
  filters: Filters;
  summary: MetricSummary;
  zoneRows: BreakdownRow[];
  detailRows: BreakdownRow[];
  contextRows: BreakdownRow[];
  insights: string[];
};

/** Builds the selected player's filtered profile for the Players view expansion panel. */
export function usePromptPlayerProfile({
  shots,
  teamShots,
  teamFilters,
  selected,
  playerRows,
}: Options): PromptPlayerProfile {
  const playerId = selected && playerRows.some((row) => row.playerId === selected) ? selected : undefined;
  const label = playerId
    ? playerRows.find((row) => row.playerId === playerId)?.playerLabel ?? playerId
    : undefined;

  const filters = useMemo<Filters>(
    () => ({ ...teamFilters, player: playerId ? [playerId] : [] }),
    [playerId, teamFilters],
  );
  const playerShots = useMemo(() => (playerId ? applyFilters(shots, filters) : []), [filters, playerId, shots]);
  const summary = useMemo(() => summarize(playerShots), [playerShots]);
  const zoneRows = useMemo(() => breakdownBy(playerShots, (s) => s.zone), [playerShots]);
  const detailRows = useMemo(() => breakdownBy(playerShots, (s) => s.complexShotType), [playerShots]);
  const contextRows = useMemo(() => breakdownBy(playerShots, (s) => s.contestLevel), [playerShots]);
  const insights = useMemo(
    () => getInsightFlags(playerShots, teamShots).map(formatInsight),
    [playerShots, teamShots],
  );

  return { playerId, label, filters, summary, zoneRows, detailRows, contextRows, insights };
}

/** Converts raw insight flag strings into display labels with formatted zones. */
export function formatInsight(insight: string): string {
  const [zone, ...rest] = insight.split(":");
  return `${formatZone(zone)}: ${rest.join(":").trim()}`;
}
