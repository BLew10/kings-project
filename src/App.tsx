import { useEffect, useMemo, useState } from "react";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ErrorState } from "@/components/dashboard/ErrorState";
import { FilterBar } from "@/components/filter/FilterBar";
import { SubjectHeader } from "@/components/dashboard/SubjectHeader";
import { AnalysisView } from "@/components/views/AnalysisView";
import { PlayersView } from "@/components/views/PlayersView";
import { Card, CardContent } from "@/components/ui/card";
import { useDashboardComputations, type DashboardView } from "@/hooks/useDashboardComputations";
import { useShotsData } from "@/hooks/useShotsData";
import { useUrlSync } from "@/hooks/useUrlSync";
import { DEFAULT_FILTERS } from "@/lib/filterSchema";
import { getSubjectCopy } from "@/lib/subjectCopy";
import type { Filters } from "@/types/filters";

function App() {
  const { shots, loading, error, hydrated, initial, reload } = useShotsData();
  const [view, setView] = useState<DashboardView>(getInitialView);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [lineup, setLineup] = useState<string[]>([]);
  const [selectedPromptPlayer, setSelectedPromptPlayer] = useState<string | undefined>();

  useEffect(() => {
    if (!initial) return;
    setFilters(initial.filters);
    setLineup(initial.lineup);
    setSelectedPromptPlayer(initial.promptPlayer);
  }, [initial]);

  const computations = useDashboardComputations({ shots, filters, view, lineup });
  const {
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
  } = computations;

  const defaultFilters = useMemo<Filters>(
    () => ({ ...DEFAULT_FILTERS, dateFrom: minDate, dateTo: maxDate }),
    [maxDate, minDate],
  );

  useUrlSync({
    enabled: hydrated && shots.length > 0,
    filters,
    defaultFilters,
    view,
    lineup,
    promptPlayer: selectedPromptPlayer,
  });

  const { subject, description, playerFocused } = useMemo(
    () => getSubjectCopy({ view, filters, lineup, players }),
    [filters, lineup, players, view],
  );

  const badge =
    view === "players"
      ? `${playerRows.length} players · ${teamShots.length.toLocaleString()} attempts`
      : `${summary.attempts.toLocaleString()} attempts in view`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader view={view} onViewChange={setView} showTabs={!error} />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 space-y-6">
        {error ? (
          <ErrorState onRetry={reload} retrying={loading} />
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

            <SubjectHeader subject={subject} description={description} badge={badge} />

            {view === "players" ? (
              <PlayersView
                playerRows={playerRows}
                playerZones={playerZones}
                playerShots={playerShots}
                selectedPlayer={selectedPromptPlayer}
                onSelectPlayer={setSelectedPromptPlayer}
                shots={shots}
                teamShots={teamShots}
                teamFilters={teamFilters}
                teamSummary={teamSummary}
                filterOptions={promptFilterOptions}
              />
            ) : (
              <AnalysisView
                view={view}
                players={players}
                lineup={lineup}
                onLineupChange={setLineup}
                activeShots={activeShots}
                summary={summary}
                teamSummary={teamSummary}
                breakdowns={breakdowns}
                insights={insights}
                playerFocused={playerFocused}
                subject={subject}
                filters={filters}
                teamFilters={teamFilters}
                filterOptions={promptFilterOptions}
              />
            )}

            {loading ? (
              <p className="text-center text-xs text-muted-foreground">Loading shot data…</p>
            ) : null}
          </>
        )}
      </main>

      <DashboardFooter />
    </div>
  );
}

/** Reads the initial dashboard tab from the URL query string. */
function getInitialView(): DashboardView {
  const value = new URLSearchParams(window.location.search).get("view");
  return value === "players" || value === "lineup" ? value : "team";
}

export default App;
