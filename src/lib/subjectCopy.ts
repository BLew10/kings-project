import type { DashboardView } from "@/hooks/useDashboardComputations";
import type { Filters } from "@/types/filters";
import type { PlayerOption } from "@/types/analytics";

type Options = {
  view: DashboardView;
  filters: Filters;
  lineup: string[];
  players: PlayerOption[];
};

/** Generates the "Now viewing" subject heading + description for the current view + filter state. */
export function getSubjectCopy({ view, filters, lineup, players }: Options): { subject: string; description: string; playerFocused: boolean } {
  const playerLabel = (id: string) => players.find((player) => player.id === id)?.label ?? id;
  const playerFocused = view === "team" && filters.player.length > 0;

  if (view === "players") {
    return {
      subject: "Player Comparison",
      description:
        "Side-by-side shot profile for all 12 players. Sort any column to find role players, volume scorers, or efficiency outliers.",
      playerFocused: false,
    };
  }

  if (view === "lineup") {
    if (!lineup.length) {
      return {
        subject: "Empty lineup",
        description: "Pick up to five players below to view their combined shot profile.",
        playerFocused: false,
      };
    }
    return {
      subject: `Lineup: ${lineup.map(playerLabel).join(", ")}`,
      description: `Combined shot diet across ${lineup.length} selected ${lineup.length === 1 ? "player" : "players"}. All Team filters still apply.`,
      playerFocused: false,
    };
  }

  if (playerFocused) {
    const subject =
      filters.player.length === 1
        ? playerLabel(filters.player[0])
        : `Selected Players: ${filters.player.map(playerLabel).join(", ")}`;
    return {
      subject,
      description:
        filters.player.length === 1
          ? "Individual shot profile, compared against the assumed team baseline."
          : "Combined selected-player shot profile, compared against the assumed team baseline.",
      playerFocused: true,
    };
  }

  return {
    subject: "Assumed Team Profile",
    description: "12-player anonymized sample treated as one team for the 2024-25 season.",
    playerFocused: false,
  };
}
