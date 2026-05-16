import { booleanFilterLabel, filterLabel, formatPeriod, labelFor } from "@/lib/labels";
import { formatPercent, formatPointsPerShot, formatZone } from "@/lib/shotModel";
import type { BreakdownRow, Filters, MetricSummary, PlayerOption, ScalarBooleanFilter } from "@/types/shots";

export type FilterOptions = {
  players: PlayerOption[];
  shotTypes: string[];
  shotDetails: string[];
  contestLevels: string[];
  shotClockBuckets: string[];
  zones: string[];
  dribbleBuckets: string[];
  shotValues: string[];
  periods: string[];
};

export type PromptInput = {
  subject: string;
  mode: "team" | "player" | "lineup";
  filters: Filters;
  filterOptions: FilterOptions;
  summary: MetricSummary;
  baselineSummary: MetricSummary;
  zoneRows: BreakdownRow[];
  shotDetailRows: BreakdownRow[];
  contextRows: BreakdownRow[];
  insights: string[];
  lineup?: string[];
};

/** Builds a self-contained coaching prompt from the currently visible dashboard profile. */
export function buildPrompt(input: PromptInput): string {
  const { subject, mode, filters, filterOptions, summary, baselineSummary, zoneRows, shotDetailRows, contextRows, insights, lineup } = input;
  const subjectType = mode === "lineup" ? "five-player lineup" : mode === "player" ? "individual player" : "assumed team";
  const fgDelta = summary.fgPct - baselineSummary.fgPct;
  const baselineLine =
    mode === "team"
      ? `Team baseline: ${formatPercent(baselineSummary.fgPct)} FG, ${formatPointsPerShot(baselineSummary.pointsPerShot)} PPS.`
      : `Team baseline under the same non-player filters: ${formatPercent(baselineSummary.fgPct)} FG, ${formatPointsPerShot(baselineSummary.pointsPerShot)} PPS (${formatSignedPoints(fgDelta)} FG vs baseline).`;

  return [
    "You are an NBA coaching and basketball analytics assistant.",
    "",
    `Build a practical action plan for this ${subjectType}: ${subject}.`,
    lineup?.length ? `Lineup players: ${lineup.join(", ")}.` : "",
    "",
    "Use the shot-profile data below to identify what to preserve, what to change, and how to coach or roster around it. Be specific and separate recommendations into:",
    "1. Key diagnosis",
    "2. Shot diet priorities",
    "3. Practice or player-development actions",
    "4. Game-plan usage recommendations",
    "5. Risks, caveats, and follow-up data to request",
    "",
    "Current filter context:",
    formatFilters(filters, filterOptions),
    "",
    "Summary metrics:",
    `- Attempts: ${summary.attempts.toLocaleString()}`,
    `- Makes: ${summary.makes.toLocaleString()}`,
    `- Points: ${summary.points.toLocaleString()}`,
    `- FG%: ${formatPercent(summary.fgPct)}`,
    `- Points per shot: ${formatPointsPerShot(summary.pointsPerShot)}`,
    `- Assisted rate: ${formatPercent(summary.assistedPct)}`,
    `- Catch-and-shoot rate: ${formatPercent(summary.catchShootPct)}`,
    `- Blocked rate: ${formatPercent(summary.blockedPct)}`,
    `- Fouled rate: ${formatPercent(summary.fouledPct)}`,
    `- Average dribbles before shot: ${summary.avgDribbles.toFixed(1)}`,
    `- Average shot clock: ${summary.avgShotClock.toFixed(1)} seconds`,
    `- Average distance: ${summary.avgDistance.toFixed(1)} feet`,
    `- Average shot release window: ${summary.avgShotDuration.toFixed(1)} seconds`,
    `- Average pass distance on assisted/pass-tracked shots: ${summary.avgPassDistance.toFixed(1)} feet`,
    `- ${baselineLine}`,
    "",
    "Zone profile:",
    formatRows(zoneRows, formatZone),
    "",
    "Shot-detail mix:",
    formatRows(shotDetailRows, labelFor),
    "",
    "Contest context:",
    formatRows(contextRows, labelFor),
    "",
    "Existing dashboard insight flags:",
    insights.length
      ? insights.map((insight) => `- ${insight}`).join("\n")
      : "- No major zone-level deviation cleared the sample-size threshold.",
    "",
    mode === "lineup"
      ? "Important caveat: this is a combined shot diet for selected players, not true shared-court lineup performance. Do not infer net rating, chemistry, or plus-minus from this data alone."
      : "Important caveat: this is shot-level data only. Do not infer full player value without possession, opponent, score, role, and lineup context.",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatRows(rows: BreakdownRow[], formatKey: (key: string) => string): string {
  if (!rows.length) return "- No data for the current filters.";
  return rows
    .slice(0, 7)
    .map(
      (row) =>
        `- ${formatKey(row.key)}: ${row.attempts.toLocaleString()} attempts, ${formatPointsPerShot(row.pointsPerShot)} PPS, ${formatPercent(row.fgPct)} FG, ${(row.share * 100).toFixed(1)}% of attempts`,
    )
    .join("\n");
}

function formatFilters(filters: Filters, filterOptions: FilterOptions): string {
  const playerLabel = playerLabeler(filterOptions.players);
  const lines = [
    `- ${filterLabel("player")}: ${formatMultiFilter(filters.player, filterOptions.players.map((player) => player.id), playerLabel)}`,
    `- ${filterLabel("shotType")}: ${formatMultiFilter(filters.shotType, filterOptions.shotTypes, labelFor)}`,
    `- ${filterLabel("complexShotType")}: ${formatMultiFilter(filters.complexShotType, filterOptions.shotDetails, labelFor)}`,
    `- ${filterLabel("contestLevel")}: ${formatMultiFilter(filters.contestLevel, filterOptions.contestLevels, labelFor)}`,
    `- ${filterLabel("zone")}: ${formatMultiFilter(filters.zone, filterOptions.zones, labelFor)}`,
    `- ${filterLabel("assisted")}: ${formatBooleanFilter("assisted", filters.assisted)}`,
    `- ${filterLabel("catchAndShoot")}: ${formatBooleanFilter("catchAndShoot", filters.catchAndShoot)}`,
    `- ${filterLabel("assistOpportunity")}: ${formatBooleanFilter("assistOpportunity", filters.assistOpportunity)}`,
    `- ${filterLabel("blocked")}: ${formatBooleanFilter("blocked", filters.blocked)}`,
    `- ${filterLabel("fouled")}: ${formatBooleanFilter("fouled", filters.fouled)}`,
    `- ${filterLabel("contested")}: ${formatBooleanFilter("contested", filters.contested)}`,
    `- ${filterLabel("outcome")}: ${formatBooleanFilter("outcome", filters.outcome)}`,
    `- ${filterLabel("shotClockBucket")}: ${formatMultiFilter(filters.shotClockBucket, filterOptions.shotClockBuckets, labelFor)}`,
    `- ${filterLabel("dribbleBucket")}: ${formatMultiFilter(filters.dribbleBucket, filterOptions.dribbleBuckets, labelFor)}`,
    `- ${filterLabel("shotValue")}: ${formatMultiFilter(filters.shotValue, filterOptions.shotValues, labelFor)}`,
    `- ${filterLabel("period")}: ${formatMultiFilter(filters.period, filterOptions.periods, formatPeriod)}`,
    `- Date range: ${filters.dateFrom || "start"} to ${filters.dateTo || "end"}`,
  ];
  return lines.join("\n");
}

function formatMultiFilter(
  selected: string[],
  allOptions: string[],
  formatOption: (value: string) => string,
): string {
  if (selected.length > 0) return selected.map(formatOption).join(", ");
  if (!allOptions.length) return "All";
  return `All (${allOptions.map(formatOption).join(", ")})`;
}

type BooleanFilterKey =
  | "assisted"
  | "catchAndShoot"
  | "assistOpportunity"
  | "blocked"
  | "fouled"
  | "contested"
  | "outcome";

function formatBooleanFilter(key: BooleanFilterKey, value: ScalarBooleanFilter): string {
  if (value !== "all") return booleanFilterLabel(key, value);
  if (key === "assisted") return "All (Assisted, Self-Created)";
  if (key === "catchAndShoot") return "All (Catch and Shoot, Off the Dribble)";
  return "All (Yes, No)";
}

function formatSignedPoints(value: number): string {
  const points = `${(Math.abs(value) * 100).toFixed(1)} pts`;
  if (value > 0) return `+${points}`;
  if (value < 0) return `-${points}`;
  return "0.0 pts";
}

function playerLabeler(players: PlayerOption[]) {
  const labels = new Map(players.map((player) => [player.id, player.label]));
  return (value: string) => labels.get(value) ?? value;
}
