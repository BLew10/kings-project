import { useMemo } from "react";
import { booleanFilterLabel, filterLabel, formatPeriod, labelFor } from "@/lib/labels";
import type { Filters } from "@/types/filters";
import type { PlayerOption } from "@/types/analytics";

export type FilterChip = {
  key: keyof Filters;
  label: string;
  value: string;
  resetTo: Filters[keyof Filters];
};

type Options = {
  filters: Filters;
  players: PlayerOption[];
  minDate: string;
  maxDate: string;
  hidePlayerFilter: boolean;
};

/** Derives the active-filter chip list from a filter state. */
export function useFilterChips({ filters, players, minDate, maxDate, hidePlayerFilter }: Options): FilterChip[] {
  return useMemo(() => {
    const chips: FilterChip[] = [];
    const playerLabels = new Map(players.map((player) => [player.id, player.label]));

    const arrayChip = (key: keyof Filters, formatValue: (v: string) => string) => {
      const value = filters[key] as string[];
      if (value.length > 0) {
        chips.push({ key, label: filterLabel(key), value: formatSelection(value, formatValue), resetTo: [] });
      }
    };

    if (!hidePlayerFilter) arrayChip("player", (value) => playerLabels.get(value) ?? value);
    arrayChip("shotType", labelFor);
    arrayChip("complexShotType", labelFor);
    arrayChip("contestLevel", labelFor);
    arrayChip("zone", labelFor);
    arrayChip("shotClockBucket", labelFor);
    arrayChip("dribbleBucket", labelFor);
    arrayChip("shotValue", labelFor);
    arrayChip("period", formatPeriod);

    const booleanKeys: Array<keyof Filters> = [
      "assisted", "catchAndShoot", "assistOpportunity", "blocked", "fouled", "contested", "outcome",
    ];
    for (const key of booleanKeys) {
      const value = filters[key] as string;
      if (value !== "all") {
        chips.push({ key, label: filterLabel(key), value: booleanFilterLabel(key, value), resetTo: "all" });
      }
    }

    if (filters.dateFrom && filters.dateFrom !== minDate) {
      chips.push({ key: "dateFrom", label: "From", value: filters.dateFrom, resetTo: minDate });
    }
    if (filters.dateTo && filters.dateTo !== maxDate) {
      chips.push({ key: "dateTo", label: "To", value: filters.dateTo, resetTo: maxDate });
    }

    return chips;
  }, [filters, hidePlayerFilter, maxDate, minDate, players]);
}

function formatSelection(values: string[], formatValue: (value: string) => string): string {
  const formatted = values.map(formatValue);
  if (formatted.length <= 2) return formatted.join(", ");
  return `${formatted.slice(0, 2).join(", ")} +${formatted.length - 2}`;
}
