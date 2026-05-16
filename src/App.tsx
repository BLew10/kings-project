import {
  Activity,
  BarChart3,
  Crown,
  Lightbulb,
  LineChart,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActionPlanPrompt } from "@/components/ActionPlanPrompt";
import type { FilterOptions } from "@/components/ActionPlanPrompt";
import { BarList } from "@/components/BarList";
import { ErrorState } from "@/components/ErrorState";
import { FilterBar } from "@/components/filter-bar";
import { InsightSummary } from "@/components/InsightSummary";
import { LineupBuilder } from "@/components/LineupBuilder";
import { MetricCard } from "@/components/MetricCard";
import { PlayerTable } from "@/components/PlayerTable";
import { ShotCourt } from "@/components/ShotCourt";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadShots } from "@/lib/csv";
import { labelFor } from "@/lib/labels";
import { formatPercent, formatPointsPerShot, formatZone } from "@/lib/shotModel";
import {
  applyFilters,
  breakdownBy,
  getInsightFlags,
  getLineupShots,
  getOptions,
  getPlayerRows,
  getPlayerZoneShares,
  getPlayers,
  getRankedInsights,
  summarize,
} from "@/lib/stats";
import { filtersFromSearch, filtersToSearch } from "@/lib/urlState";
import type { Filters as FilterState, Shot } from "@/types/shots";

type View = "team" | "players" | "lineup";

const SHOT_CLOCK_BUCKETS = ["early", "middle", "late", "end"];

const DEFAULT_FILTERS: FilterState = {
  player: [],
  shotType: [],
  complexShotType: [],
  contestLevel: [],
  assisted: "all",
  catchAndShoot: "all",
  shotClockBucket: [],
  dateFrom: "",
  dateTo: "",
};

function App() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>(() => getInitialView());
  const [lineup, setLineup] = useState<string[]>([]);
  const [selectedPromptPlayer, setSelectedPromptPlayer] = useState<string | undefined>();
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(() => {
    loadShots()
      .then((data) => {
        const dates = data.map((s) => s.date).sort();
        const defaults = {
          ...DEFAULT_FILTERS,
          dateFrom: dates[0] ?? "",
          dateTo: dates[dates.length - 1] ?? "",
        };
        setShots(data);
        setFilters(filtersFromSearch(window.location.search, defaults));
        // Seed lineup with the five highest-volume shooters so the Lineup view
        // shows something useful the first time it's opened.
        const topFive = getPlayerRows(data).slice(0, 5).map((row) => row.player);
        setLineup(topFive);
      })
      .catch((caught: unknown) =>
        setError(caught instanceof Error ? caught.message : "Unable to load data"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    loadDashboard();
  }, [loadDashboard]);

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
    for (const shot of teamShots) {
      (grouped[shot.shooterName] ??= []).push(shot);
    }
    return grouped;
  }, [teamShots]);
  const zoneRows = useMemo(() => breakdownBy(activeShots, (s) => s.zone), [activeShots]);
  const typeRows = useMemo(() => breakdownBy(activeShots, (s) => s.complexShotType), [activeShots]);
  const contextRows = useMemo(() => breakdownBy(activeShots, (s) => s.contestLevel), [activeShots]);
  const insights = useMemo(() => getInsightFlags(activeShots, teamShots), [activeShots, teamShots]);
  const formattedInsights = useMemo(() => insights.map(formatInsight), [insights]);

  const dates = useMemo(() => shots.map((s) => s.date).sort(), [shots]);
  const minDate = dates[0] ?? "";
  const maxDate = dates[dates.length - 1] ?? "";
  const defaultFilters = useMemo(
    () => ({
      ...DEFAULT_FILTERS,
      dateFrom: minDate,
      dateTo: maxDate,
    }),
    [maxDate, minDate],
  );

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
    }),
    [complexShotTypes, contestLevels, players, shotTypes],
  );
  const rankedInsights = useMemo(() => getRankedInsights(activeShots, teamShots), [activeShots, teamShots]);

  useEffect(() => {
    if (!shots.length) return;
    const params = new URLSearchParams(filtersToSearch(filters, defaultFilters));
    if (view !== "team") params.set("view", view);
    const next = params.toString();
    const nextUrl = `${window.location.pathname}${next ? `?${next}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", nextUrl);
  }, [defaultFilters, filters, shots.length, view]);

  const playerFocused = view === "team" && filters.player.length > 0;
  const promptPlayer =
    selectedPromptPlayer && playerRows.some((row) => row.player === selectedPromptPlayer)
      ? selectedPromptPlayer
      : undefined;
  const promptPlayerFilters = useMemo(
    () => ({ ...teamFilters, player: promptPlayer ? [promptPlayer] : [] }),
    [promptPlayer, teamFilters],
  );
  const promptPlayerShots = useMemo(
    () => (promptPlayer ? applyFilters(shots, promptPlayerFilters) : []),
    [promptPlayer, promptPlayerFilters, shots],
  );
  const promptPlayerSummary = useMemo(() => summarize(promptPlayerShots), [promptPlayerShots]);
  const promptPlayerZones = useMemo(() => breakdownBy(promptPlayerShots, (s) => s.zone), [promptPlayerShots]);
  const promptPlayerTypes = useMemo(
    () => breakdownBy(promptPlayerShots, (s) => s.complexShotType),
    [promptPlayerShots],
  );
  const promptPlayerContexts = useMemo(
    () => breakdownBy(promptPlayerShots, (s) => s.contestLevel),
    [promptPlayerShots],
  );
  const promptPlayerInsights = useMemo(
    () => getInsightFlags(promptPlayerShots, teamShots).map(formatInsight),
    [promptPlayerShots, teamShots],
  );

  const subject =
    view === "players"
      ? "Player Comparison"
      : view === "lineup"
        ? lineup.length
          ? `Lineup: ${lineup.join(", ")}`
          : "Empty lineup"
        : playerFocused
          ? filters.player.length === 1
            ? filters.player[0]
            : `Selected Players: ${filters.player.join(", ")}`
          : "Assumed Team Profile";

  const subjectDescription =
    view === "players"
      ? "Side-by-side shot profile for all 12 players. Sort any column to find role players, volume scorers, or efficiency outliers."
      : view === "lineup"
        ? lineup.length
          ? `Combined shot diet across ${lineup.length} selected ${lineup.length === 1 ? "player" : "players"}. All Team filters still apply.`
          : "Pick up to five players below to view their combined shot profile."
        : playerFocused
          ? filters.player.length === 1
            ? "Individual shot profile, compared against the assumed team baseline."
            : "Combined selected-player shot profile, compared against the assumed team baseline."
          : "12-player anonymized sample treated as one team for the 2024-25 season.";

  const fgDelta = summary.fgPct - teamSummary.fgPct;
  const showDelta = summary.attempts > 0 && (playerFocused || view === "lineup");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Crown className="size-5" />
            </span>
            <div className="hidden sm:block">
              <h1 className="text-base font-semibold leading-tight">Kings Shot Profile</h1>
              <p className="text-xs text-muted-foreground leading-tight">2024-25 season · 12-player sample</p>
            </div>
          </div>
          {error ? null : (
            <Tabs value={view} onValueChange={(v) => setView(v as View)}>
              <TabsList>
                <TabsTrigger value="team"><Users className="size-3.5" /> Team</TabsTrigger>
                <TabsTrigger value="players"><BarChart3 className="size-3.5" /> Players</TabsTrigger>
                <TabsTrigger value="lineup"><Zap className="size-3.5" /> Lineup</TabsTrigger>
              </TabsList>
            </Tabs>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6">
        {error ? (
          <ErrorState onRetry={handleRetry} retrying={loading} />
        ) : (
        <>
        <Card>
          <CardContent className="py-5">
            <FilterBar
              filters={filters}
              players={players}
              shotTypes={shotTypes}
              complexShotTypes={complexShotTypes}
              contestLevels={contestLevels}
              minDate={minDate}
              maxDate={maxDate}
              onChange={setFilters}
              hidePlayerFilter={view !== "team"}
            />
          </CardContent>
        </Card>

        <section className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Now viewing</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight">{subject}</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-2xl">{subjectDescription}</p>
          </div>
          <Badge variant="outline" className="px-3 py-1 text-sm">
            {view === "players"
              ? `${playerRows.length} players · ${teamShots.length.toLocaleString()} attempts`
              : `${summary.attempts.toLocaleString()} attempts in view`}
          </Badge>
        </section>

        {view === "players" ? (
          <>
            <PlayerTable
              rows={playerRows}
              playerZones={playerZones}
              playerShots={playerShots}
              selectedPlayer={selectedPromptPlayer}
              onSelectPlayer={setSelectedPromptPlayer}
              description="Click a column header to sort. Click a row to open that player's location efficiency heatmap and action-plan prompt."
              expandedContent={
                promptPlayer ? (
                  <ActionPlanPrompt
                    subject={promptPlayer}
                    mode="player"
                    filters={promptPlayerFilters}
                    filterOptions={promptFilterOptions}
                    summary={promptPlayerSummary}
                    baselineSummary={teamSummary}
                    zoneRows={promptPlayerZones}
                    shotDetailRows={promptPlayerTypes}
                    contextRows={promptPlayerContexts}
                    insights={promptPlayerInsights}
                  />
                ) : null
              }
            />
          </>
        ) : (
          <>
            {view === "lineup" ? (
              <LineupBuilder players={players} selected={lineup} onChange={setLineup} />
            ) : null}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              <MetricCard
                label="Attempts"
                value={summary.attempts.toLocaleString()}
                detail={`${summary.makes.toLocaleString()} makes`}
                icon={Target}
                tone="default"
              />
              <MetricCard
                label="Field Goal %"
                value={formatPercent(summary.fgPct)}
                detail={`Team baseline: ${formatPercent(teamSummary.fgPct)}`}
                icon={TrendingUp}
                tone={summary.attempts > 0 && fgDelta >= 0 ? "success" : "warning"}
                delta={
                  showDelta
                    ? {
                        value: `${(Math.abs(fgDelta) * 100).toFixed(1)} pts`,
                        positive: fgDelta >= 0,
                      }
                    : undefined
                }
              />
              <MetricCard
                label="Points / Shot"
                value={formatPointsPerShot(summary.pointsPerShot)}
                detail={`Team baseline: ${formatPointsPerShot(teamSummary.pointsPerShot)}`}
                icon={LineChart}
                tone={summary.pointsPerShot >= teamSummary.pointsPerShot ? "success" : "warning"}
                delta={
                  showDelta
                    ? {
                        value: `${Math.abs(summary.pointsPerShot - teamSummary.pointsPerShot).toFixed(2)} PPS`,
                        positive: summary.pointsPerShot >= teamSummary.pointsPerShot,
                      }
                    : undefined
                }
              />
              <MetricCard
                label="Assisted Rate"
                value={formatPercent(summary.assistedPct)}
                detail={`Catch & shoot: ${formatPercent(summary.catchShootPct)}`}
                icon={Users}
                tone="primary"
              />
              <MetricCard
                label="Avg Dribbles"
                value={summary.avgDribbles.toFixed(1)}
                detail={`Shot clock avg: ${summary.avgShotClock.toFixed(1)}s`}
                icon={Activity}
                tone="default"
              />
            </section>

            {summary.attempts > 0 ? (
              <Alert variant={insights.length ? "info" : "default"}>
                <Lightbulb />
                <AlertDescription>
                  {insights.length
                    ? formatInsight(insights[0])
                    : "No major zone-level deviations above the sample-size threshold for the current filter. Adjust filters to surface stronger signals."}
                </AlertDescription>
              </Alert>
            ) : null}

            <InsightSummary insights={rankedInsights} />

            <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <ShotCourt shots={activeShots} />
              <div className="grid grid-cols-1 gap-4">
                <BarList title="Zone Profile" rows={zoneRows} maxRows={7} description="Where shots come from." />
                <BarList
                  title="Shot Detail Mix"
                  rows={typeRows}
                  maxRows={6}
                  formatKey={labelFor}
                  description="Top shot types within the current filter."
                />
                <RecommendationCard insights={insights} attempts={summary.attempts} />
              </div>
            </section>

            {view === "lineup" ? (
              <BarList
                title="Contest Context"
                rows={contextRows}
                formatKey={labelFor}
                description="Defensive pressure distribution across the selected lineup's shots."
              />
            ) : null}

            <ActionPlanPrompt
              subject={subject}
              mode={view === "lineup" ? "lineup" : playerFocused ? "player" : "team"}
              filters={view === "lineup" ? teamFilters : filters}
              filterOptions={promptFilterOptions}
              summary={summary}
              baselineSummary={teamSummary}
              zoneRows={zoneRows}
              shotDetailRows={typeRows}
              contextRows={contextRows}
              insights={formattedInsights}
              lineup={view === "lineup" ? lineup : undefined}
            />
          </>
        )}

        {loading ? (
          <p className="text-center text-xs text-muted-foreground">Loading shot data…</p>
        ) : null}
        </>
        )}
      </main>

      <footer className="border-t border-border bg-card/40 py-5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground">
            Lineup view is a combined player shot profile, not true shared-court performance.
            Position and opponent context are not modeled.
          </p>
        </div>
      </footer>
    </div>
  );
}

/** Converts raw insight flag strings into display labels with formatted zones. */
function formatInsight(insight: string): string {
  const [zone, ...rest] = insight.split(":");
  return `${formatZone(zone)}: ${rest.join(":").trim()}`;
}

/** Renders legacy zone-deviation notes as a compact supporting recommendation list. */
function RecommendationCard({ insights, attempts }: { insights: string[]; attempts: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Lightbulb className="size-4 text-amber-500" />
          Recommendation Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <ul className="space-y-2 text-sm text-foreground">
          {attempts < 40 ? (
            <li className="flex gap-2 text-muted-foreground">
              <span className="text-amber-500">•</span>
              <span>Sample is small ({attempts} attempts). Treat any recommendation as exploratory.</span>
            </li>
          ) : null}
          {insights.length ? (
            insights.map((insight) => (
              <li key={insight} className="flex gap-2">
                <span className="text-primary">•</span>
                <span>{formatInsight(insight)}</span>
              </li>
            ))
          ) : (
            <li className="flex gap-2 text-muted-foreground">
              <span className="text-muted-foreground">•</span>
              <span>Use shot type, contest, and player filters to isolate stronger tactical signals.</span>
            </li>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

export default App;

/** Reads the initial dashboard tab from the URL query string. */
function getInitialView(): View {
  const value = new URLSearchParams(window.location.search).get("view");
  return value === "players" || value === "lineup" ? value : "team";
}
