import { Check, Clipboard, WandSparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { booleanFilterLabel, filterLabel, labelFor } from "@/lib/labels";
import { formatPercent, formatPointsPerShot, formatZone } from "@/lib/shotModel";
import type { BreakdownRow, Filters, MetricSummary } from "@/types/shots";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type ActionPlanPromptProps = {
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

export type FilterOptions = {
  players: string[];
  shotTypes: string[];
  shotDetails: string[];
  contestLevels: string[];
  shotClockBuckets: string[];
};

export function ActionPlanPrompt({
  subject,
  mode,
  filters,
  filterOptions,
  summary,
  baselineSummary,
  zoneRows,
  shotDetailRows,
  contextRows,
  insights,
  lineup,
}: ActionPlanPromptProps) {
  const [copied, setCopied] = useState(false);
  const prompt = useMemo(
    () =>
      buildPrompt({
        subject,
        mode,
        filters,
        filterOptions,
        summary,
        baselineSummary,
        zoneRows,
        shotDetailRows,
        contextRows,
        insights,
        lineup,
      }),
    [
      baselineSummary,
      contextRows,
      filters,
      filterOptions,
      insights,
      lineup,
      mode,
      shotDetailRows,
      subject,
      summary,
      zoneRows,
    ],
  );

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch {
      fallbackCopy(prompt);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm">
            <WandSparkles className="size-4 text-primary" />
            AI Action Plan Prompt
          </CardTitle>
          <CardDescription>
            Copy this into an AI tool to turn the current data, filters, and shot profile into a coaching or roster action plan.
          </CardDescription>
        </div>
        <Button type="button" size="sm" onClick={copyPrompt} disabled={summary.attempts === 0}>
          {copied ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <Textarea
          readOnly
          value={prompt}
          className="min-h-[260px] resize-y whitespace-pre-wrap text-xs leading-relaxed"
          aria-label="AI action plan prompt"
        />
      </CardContent>
    </Card>
  );
}

/** Builds a self-contained coaching prompt from the currently visible dashboard profile. */
function buildPrompt({
  subject,
  mode,
  filters,
  filterOptions,
  summary,
  baselineSummary,
  zoneRows,
  shotDetailRows,
  contextRows,
  insights,
  lineup,
}: ActionPlanPromptProps): string {
  const subjectType =
    mode === "lineup"
      ? "five-player lineup"
      : mode === "player"
        ? "individual player"
        : "assumed team";
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
    `- Average dribbles before shot: ${summary.avgDribbles.toFixed(1)}`,
    `- Average shot clock: ${summary.avgShotClock.toFixed(1)} seconds`,
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
    insights.length ? insights.map((insight) => `- ${insight}`).join("\n") : "- No major zone-level deviation cleared the sample-size threshold.",
    "",
    mode === "lineup"
      ? "Important caveat: this is a combined shot diet for selected players, not true shared-court lineup performance. Do not infer net rating, chemistry, or plus-minus from this data alone."
      : "Important caveat: this is shot-level data only. Do not infer full player value without possession, opponent, score, role, and lineup context.",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Formats breakdown rows for the copy-ready AI prompt. */
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

/** Formats the active filter state for the copy-ready AI prompt. */
function formatFilters(filters: Filters, filterOptions: FilterOptions): string {
  const formatted = [
    `- ${filterLabel("player")}: ${formatMultiFilter(filters.player, filterOptions.players, (value) => value)}`,
    `- ${filterLabel("shotType")}: ${formatMultiFilter(filters.shotType, filterOptions.shotTypes, labelFor)}`,
    `- ${filterLabel("complexShotType")}: ${formatMultiFilter(filters.complexShotType, filterOptions.shotDetails, labelFor)}`,
    `- ${filterLabel("contestLevel")}: ${formatMultiFilter(filters.contestLevel, filterOptions.contestLevels, labelFor)}`,
    `- ${filterLabel("assisted")}: ${formatBooleanFilter("assisted", filters.assisted)}`,
    `- ${filterLabel("catchAndShoot")}: ${formatBooleanFilter("catchAndShoot", filters.catchAndShoot)}`,
    `- ${filterLabel("shotClockBucket")}: ${formatMultiFilter(filters.shotClockBucket, filterOptions.shotClockBuckets, labelFor)}`,
  ];

  formatted.push(`- Date range: ${filters.dateFrom || "start"} to ${filters.dateTo || "end"}`);
  return formatted.join("\n");
}

/** Formats multi-select filter values, expanding empty selections to the available option set. */
function formatMultiFilter(
  selected: string[],
  allOptions: string[],
  formatOption: (value: string) => string,
): string {
  if (selected.length > 0) return selected.map(formatOption).join(", ");
  if (!allOptions.length) return "All";
  return `All (${allOptions.map(formatOption).join(", ")})`;
}

/** Formats one scalar filter value for prompt context. */
function formatBooleanFilter(key: "assisted" | "catchAndShoot", value: string): string {
  if (value !== "all") return booleanFilterLabel(key, value);
  if (key === "assisted") return "All (Assisted, Self-Created)";
  return "All (Catch and Shoot, Off the Dribble)";
}

/** Formats a decimal-rate delta as percentage points with an explicit sign. */
function formatSignedPoints(value: number): string {
  const points = `${(Math.abs(value) * 100).toFixed(1)} pts`;
  if (value > 0) return `+${points}`;
  if (value < 0) return `-${points}`;
  return "0.0 pts";
}

/** Copies text through a temporary textarea when the Clipboard API is unavailable. */
function fallbackCopy(value: string) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
