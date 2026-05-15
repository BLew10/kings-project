import {
  Activity,
  AlertTriangle,
  BarChart3,
  Crown,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { BarList } from "@/components/BarList";
import { FilterBar } from "@/components/filter-bar";
import { LineupBuilder } from "@/components/LineupBuilder";
import { MetricCard } from "@/components/MetricCard";
import { PlayerTable } from "@/components/PlayerTable";
import { ShotCourt } from "@/components/ShotCourt";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadShots } from "@/lib/csv";
import { labelFor } from "@/lib/labels";
import { formatPercent, formatZone } from "@/lib/shotModel";
import {
  applyFilters,
  breakdownBy,
  getInsightFlags,
  getLineupShots,
  getOptions,
  getPlayerRows,
  getPlayerZoneShares,
  getPlayers,
  summarize,
} from "@/lib/stats";
import type { Filters as FilterState, Shot } from "@/types/shots";

type View = "team" | "players" | "lineup";

function App() {
  const [shots, setShots] = useState<Shot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>("team");
  const [lineup, setLineup] = useState<string[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    player: "all",
    shotType: "all",
    complexShotType: "all",
    contestLevel: "all",
    assisted: "all",
    catchAndShoot: "all",
    shotClockBucket: "all",
    dateFrom: "",
    dateTo: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShots()
      .then((data) => {
        const dates = data.map((s) => s.date).sort();
        setShots(data);
        setFilters((current) => ({
          ...current,
          dateFrom: dates[0] ?? "",
          dateTo: dates[dates.length - 1] ?? "",
        }));
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

  const players = useMemo(() => getPlayers(shots), [shots]);
  const teamFilters = useMemo(() => ({ ...filters, player: "all" }), [filters]);
  const teamShots = useMemo(() => applyFilters(shots, teamFilters), [shots, teamFilters]);
  const filteredShots = useMemo(() => applyFilters(shots, filters), [shots, filters]);
  const lineupShots = useMemo(() => getLineupShots(teamShots, lineup), [teamShots, lineup]);
  const activeShots = view === "lineup" ? lineupShots : filteredShots;

  const summary = useMemo(() => summarize(activeShots), [activeShots]);
  const teamSummary = useMemo(() => summarize(teamShots), [teamShots]);
  const playerRows = useMemo(() => getPlayerRows(teamShots), [teamShots]);
  const playerZones = useMemo(() => getPlayerZoneShares(teamShots), [teamShots]);
  const zoneRows = useMemo(() => breakdownBy(activeShots, (s) => s.zone), [activeShots]);
  const typeRows = useMemo(() => breakdownBy(activeShots, (s) => s.complexShotType), [activeShots]);
  const contextRows = useMemo(() => breakdownBy(activeShots, (s) => s.contestLevel), [activeShots]);
  const insights = useMemo(() => getInsightFlags(activeShots, teamShots), [activeShots, teamShots]);

  const dates = useMemo(() => shots.map((s) => s.date).sort(), [shots]);
  const minDate = dates[0] ?? "";
  const maxDate = dates[dates.length - 1] ?? "";

  const shotTypes = useMemo(() => getOptions(shots, (s) => s.shotType), [shots]);
  const complexShotTypes = useMemo(() => getOptions(shots, (s) => s.complexShotType), [shots]);
  const contestLevels = useMemo(() => getOptions(shots, (s) => s.contestLevel), [shots]);

  const playerFocused = view === "team" && filters.player !== "all";

  const subject =
    view === "players"
      ? "Player Comparison"
      : view === "lineup"
        ? lineup.length
          ? `Lineup: ${lineup.join(", ")}`
          : "Empty lineup"
        : playerFocused
          ? filters.player
          : "Assumed Team Profile";

  const subjectDescription =
    view === "players"
      ? "Side-by-side shot profile for all 12 players. Sort any column to find role players, volume scorers, or efficiency outliers."
      : view === "lineup"
        ? lineup.length
          ? `Combined shot diet across ${lineup.length} selected ${lineup.length === 1 ? "player" : "players"}. All Team filters still apply.`
          : "Pick up to five players below to view their combined shot profile."
        : playerFocused
          ? "Individual shot profile, compared against the assumed team baseline."
          : "12-player anonymized sample treated as one team for the 2024-25 season.";

  const fgDelta = summary.fgPct - teamSummary.fgPct;
  const showDelta = summary.attempts > 0 && (playerFocused || view === "lineup");

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="max-w-md">
          <CardHeader className="items-center text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
              <AlertTriangle className="size-6" />
            </span>
            <CardTitle>Unable to load dashboard</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

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
          <Tabs value={view} onValueChange={(v) => setView(v as View)}>
            <TabsList>
              <TabsTrigger value="team"><Users className="size-3.5" /> Team</TabsTrigger>
              <TabsTrigger value="players"><BarChart3 className="size-3.5" /> Players</TabsTrigger>
              <TabsTrigger value="lineup"><Zap className="size-3.5" /> Lineup</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6">
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
          <PlayerTable
            rows={playerRows}
            playerZones={playerZones}
            description="Click a column header to sort. Hover the Shot Mix bar for per-zone share and FG%."
          />
        ) : (
          <>
            {view === "lineup" ? (
              <LineupBuilder players={players} selected={lineup} onChange={setLineup} />
            ) : null}

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          </>
        )}

        {loading ? (
          <p className="text-center text-xs text-muted-foreground">Loading shot data…</p>
        ) : null}
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

function formatInsight(insight: string): string {
  const [zone, ...rest] = insight.split(":");
  return `${formatZone(zone)}: ${rest.join(":").trim()}`;
}

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
