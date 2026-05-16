import { ActionPlanPrompt } from "@/components/ai/ActionPlanPrompt";
import { BreakdownFocus } from "@/components/breakdown/BreakdownFocus";
import { LineupBuilder } from "@/components/lineup/LineupBuilder";
import { MetricGrid } from "@/components/metric/MetricGrid";
import { ShotCourt } from "@/components/court/ShotCourt";
import { formatInsight } from "@/hooks/usePromptPlayerProfile";
import type { FilterOptions } from "@/lib/promptBuilder";
import type { Shot } from "@/types/shots";
import type { Filters } from "@/types/filters";
import type { BreakdownRow, MetricSummary, PlayerOption } from "@/types/analytics";
import type { DashboardView } from "@/hooks/useDashboardComputations";

type AnalysisViewProps = {
  view: Exclude<DashboardView, "players">;
  players: PlayerOption[];
  lineup: string[];
  onLineupChange: (next: string[]) => void;
  activeShots: Shot[];
  summary: MetricSummary;
  teamSummary: MetricSummary;
  breakdowns: {
    zone: BreakdownRow[];
    detail: BreakdownRow[];
    context: BreakdownRow[];
    clock: BreakdownRow[];
    dribble: BreakdownRow[];
    value: BreakdownRow[];
    period: BreakdownRow[];
  };
  insights: string[];
  playerFocused: boolean;
  subject: string;
  filters: Filters;
  teamFilters: Filters;
  filterOptions: FilterOptions;
};

export function AnalysisView({
  view,
  players,
  lineup,
  onLineupChange,
  activeShots,
  summary,
  teamSummary,
  breakdowns,
  insights,
  playerFocused,
  subject,
  filters,
  teamFilters,
  filterOptions,
}: AnalysisViewProps) {
  const showDelta = summary.attempts > 0 && (playerFocused || view === "lineup");
  const lineupLabels = lineup.map((id) => players.find((player) => player.id === id)?.label ?? id);
  const mode = view === "lineup" ? "lineup" : playerFocused ? "player" : "team";

  return (
    <>
      {view === "lineup" ? (
        <LineupBuilder players={players} selected={lineup} onChange={onLineupChange} />
      ) : null}

      <MetricGrid summary={summary} teamSummary={teamSummary} showDelta={showDelta} />

      <section className="grid grid-cols-1 items-start gap-4 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.75fr)] xl:grid-cols-[minmax(0,0.85fr)_minmax(360px,0.65fr)]">
        <ShotCourt shots={activeShots} />
        <BreakdownFocus breakdowns={breakdowns} />
      </section>

      <ActionPlanPrompt
        subject={subject}
        mode={mode}
        filters={view === "lineup" ? teamFilters : filters}
        filterOptions={filterOptions}
        summary={summary}
        baselineSummary={teamSummary}
        zoneRows={breakdowns.zone}
        shotDetailRows={breakdowns.detail}
        contextRows={breakdowns.context}
        insights={insights.map(formatInsight)}
        lineup={view === "lineup" ? lineupLabels : undefined}
      />
    </>
  );
}
