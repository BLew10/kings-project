import type { Filters } from "@/types/filters";
import { ARRAY_FILTER_KEYS, SCALAR_FILTER_KEYS } from "@/lib/filterSchema";

/** Parses dashboard filters from a URL query string. */
export function filtersFromSearch(search: string, defaults: Filters): Filters {
  const params = new URLSearchParams(search);
  const next: Filters = { ...defaults };

  for (const key of ARRAY_FILTER_KEYS) {
    const value = params.get(key);
    (next as Record<string, unknown>)[key] = value ? value.split(",").filter(Boolean) : defaults[key];
  }

  for (const key of SCALAR_FILTER_KEYS) {
    const value = params.get(key);
    (next as Record<string, unknown>)[key] = value || defaults[key];
  }

  return next;
}

/** Serializes only non-default filter values into a stable URL query string. */
export function filtersToSearch(filters: Filters, defaults: Filters): string {
  const params = new URLSearchParams();

  for (const key of ARRAY_FILTER_KEYS) {
    if (!sameArray(filters[key], defaults[key])) params.set(key, filters[key].join(","));
  }

  for (const key of SCALAR_FILTER_KEYS) {
    if (filters[key] !== defaults[key]) params.set(key, filters[key]);
  }

  return params.toString();
}

/** Compares two string arrays by value and position. */
function sameArray(left: string[], right: string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
