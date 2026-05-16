import { useMemo, useState } from "react";

export type SortDir = "asc" | "desc";

type Options<K extends string> = {
  defaultKey: K;
  defaultDir?: SortDir;
  ascByDefault?: (key: K) => boolean;
};

/** Generic sort-state hook with stable toggle semantics for table headers. */
export function useSortedRows<Row, K extends string>(
  rows: Row[],
  getValue: (row: Row, key: K) => number | string,
  options: Options<K>,
) {
  const { defaultKey, defaultDir = "desc", ascByDefault } = options;
  const [sortKey, setSortKey] = useState<K>(defaultKey);
  const [sortDir, setSortDir] = useState<SortDir>(defaultDir);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = getValue(a, sortKey);
      const vb = getValue(b, sortKey);
      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      const na = Number.isFinite(va) ? (va as number) : Number.NEGATIVE_INFINITY;
      const nb = Number.isFinite(vb) ? (vb as number) : Number.NEGATIVE_INFINITY;
      return sortDir === "asc" ? na - nb : nb - na;
    });
    return copy;
  }, [rows, sortKey, sortDir, getValue]);

  const toggleSort = (key: K) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDir(ascByDefault?.(key) ? "asc" : "desc");
  };

  return { sorted, sortKey, sortDir, toggleSort };
}
