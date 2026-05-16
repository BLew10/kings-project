import type { MetricSummary } from "@/types/shots";

export type PlayerRow = MetricSummary & { playerId: string; player: string; playerLabel: string };

export type SortKey =
  | "player"
  | "attempts"
  | "fgPct"
  | "pointsPerShot"
  | "assistedPct"
  | "catchShootPct"
  | "avgDribbles";

export const PLAYER_COLUMNS: Array<{ key: SortKey; label: string; align: "left" | "right" }> = [
  { key: "player", label: "Player", align: "left" },
  { key: "attempts", label: "Attempts", align: "right" },
  { key: "fgPct", label: "FG%", align: "right" },
  { key: "pointsPerShot", label: "PPS", align: "right" },
  { key: "assistedPct", label: "Assisted%", align: "right" },
  { key: "catchShootPct", label: "C&S%", align: "right" },
  { key: "avgDribbles", label: "Avg Dribbles", align: "right" },
];

export function getPlayerSortValue(row: PlayerRow, key: SortKey): number | string {
  if (key === "player") return row.playerLabel;
  return row[key];
}

/** Creates compact initials for anonymized player names. */
export function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}
