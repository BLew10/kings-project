import { ActionPlanPrompt } from "@/components/ai/ActionPlanPrompt";
import { PlayerTable } from "@/components/player/PlayerTable";
import type { PlayerRow } from "@/components/player/playerTableColumns";
import type { FilterOptions } from "@/lib/promptBuilder";
import type { BreakdownRow, MetricSummary, Shot } from "@/types/shots";
import type { Filters } from "@/types/shots";
import { usePromptPlayerProfile } from "@/hooks/usePromptPlayerProfile";

type PlayersViewProps = {
  playerRows: PlayerRow[];
  playerZones: Record<string, BreakdownRow[]>;
  playerShots: Record<string, Shot[]>;
  selectedPlayer: string | undefined;
  onSelectPlayer: (id: string | undefined) => void;
  shots: Shot[];
  teamShots: Shot[];
  teamFilters: Filters;
  teamSummary: MetricSummary;
  filterOptions: FilterOptions;
};

export function PlayersView({
  playerRows,
  playerZones,
  playerShots,
  selectedPlayer,
  onSelectPlayer,
  shots,
  teamShots,
  teamFilters,
  teamSummary,
  filterOptions,
}: PlayersViewProps) {
  const profile = usePromptPlayerProfile({
    shots,
    teamShots,
    teamFilters,
    selected: selectedPlayer,
    playerRows,
  });

  return (
    <PlayerTable
      rows={playerRows}
      playerZones={playerZones}
      playerShots={playerShots}
      selectedPlayer={selectedPlayer}
      onSelectPlayer={onSelectPlayer}
      description="Click a column header to sort. Click a row to open that player's location efficiency heatmap and action-plan prompt."
      expandedContent={
        profile.playerId ? (
          <ActionPlanPrompt
            subject={profile.label ?? profile.playerId}
            mode="player"
            filters={profile.filters}
            filterOptions={filterOptions}
            summary={profile.summary}
            baselineSummary={teamSummary}
            zoneRows={profile.zoneRows}
            shotDetailRows={profile.detailRows}
            contextRows={profile.contextRows}
            insights={profile.insights}
          />
        ) : null
      }
    />
  );
}
