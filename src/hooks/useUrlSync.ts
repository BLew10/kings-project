import { useEffect } from "react";
import { filtersToSearch } from "@/lib/urlState";
import type { Filters } from "@/types/filters";
import type { DashboardView } from "@/hooks/useDashboardComputations";

type Options = {
  enabled: boolean;
  filters: Filters;
  defaultFilters: Filters;
  view: DashboardView;
  lineup: string[];
  promptPlayer: string | undefined;
};

/** Mirrors dashboard state to the URL query string so views are deep-linkable and refresh-stable. */
export function useUrlSync({ enabled, filters, defaultFilters, view, lineup, promptPlayer }: Options) {
  useEffect(() => {
    if (!enabled) return;
    const params = new URLSearchParams(filtersToSearch(filters, defaultFilters));
    if (view !== "team") params.set("view", view);
    if (view === "lineup" && lineup.length) params.set("lineup", lineup.join(","));
    if (view === "players" && promptPlayer) params.set("promptPlayer", promptPlayer);
    const next = params.toString();
    const url = `${window.location.pathname}${next ? `?${next}` : ""}${window.location.hash}`;
    window.history.replaceState(null, "", url);
  }, [defaultFilters, enabled, filters, lineup, promptPlayer, view]);
}
