import { useCallback, useEffect, useState } from "react";
import { loadShots } from "@/lib/csv";
import { DEFAULT_FILTERS } from "@/lib/filterSchema";
import { getPlayerRows } from "@/lib/stats";
import { filtersFromSearch } from "@/lib/urlState";
import type { Filters, Shot } from "@/types/shots";

export type HydratedState = {
  filters: Filters;
  lineup: string[];
  promptPlayer: string | undefined;
};

export type ShotsDataState = {
  shots: Shot[];
  loading: boolean;
  error: string | null;
  hydrated: boolean;
  initial: HydratedState | null;
  reload: () => void;
};

/** Loads shots.csv once, derives initial filter/lineup state from the URL, and exposes a retry hook. */
export function useShotsData(): ShotsDataState {
  const [shots, setShots] = useState<Shot[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [initial, setInitial] = useState<HydratedState | null>(null);

  const load = useCallback(() => {
    setError(null);
    setLoading(true);
    loadShots()
      .then((data) => {
        setShots(data);
        setInitial(deriveInitialState(data));
        setHydrated(true);
      })
      .catch((caught: unknown) => {
        setError(caught instanceof Error ? caught.message : "Unable to load data");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { shots, loading, error, hydrated, initial, reload: load };
}

function deriveInitialState(data: Shot[]): HydratedState {
  const dates = data.map((shot) => shot.date).sort();
  const defaults: Filters = {
    ...DEFAULT_FILTERS,
    dateFrom: dates[0] ?? "",
    dateTo: dates[dates.length - 1] ?? "",
  };
  const filters = filtersFromSearch(window.location.search, defaults);
  const playerRows = getPlayerRows(data);
  const playerIds = new Set(playerRows.map((row) => row.playerId));
  const params = new URLSearchParams(window.location.search);

  const requestedLineup = (params.get("lineup") ?? "")
    .split(",")
    .filter((id) => playerIds.has(id))
    .slice(0, 5);
  const topFive = playerRows.slice(0, 5).map((row) => row.playerId);
  const lineup = requestedLineup.length ? requestedLineup : topFive;

  const requestedPromptPlayer = params.get("promptPlayer") ?? undefined;
  const promptPlayer =
    requestedPromptPlayer && playerIds.has(requestedPromptPlayer) ? requestedPromptPlayer : undefined;

  return { filters, lineup, promptPlayer };
}
