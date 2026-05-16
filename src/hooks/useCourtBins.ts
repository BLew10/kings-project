import { useEffect, useMemo, useState } from "react";
import { getBins } from "@/lib/courtGeometry";
import type { Shot } from "@/types/shots";
import type { HoveredCell } from "@/components/court/CourtHeatmap";

/** Manages heatmap bins, low-volume filtering, and hover state for the shot court. */
export function useCourtBins(shots: Shot[]) {
  const [hideLowSampleCells, setHideLowSampleCells] = useState(true);
  const [minAttempts, setMinAttempts] = useState(5);
  const [hovered, setHovered] = useState<HoveredCell | null>(null);

  const allBins = useMemo(() => getBins(shots), [shots]);
  const bins = useMemo(
    () => allBins.filter((bin) => !hideLowSampleCells || bin.attempts >= minAttempts),
    [allBins, hideLowSampleCells, minAttempts],
  );
  const maxAttempts = useMemo(() => bins.reduce((max, bin) => Math.max(max, bin.attempts), 1), [bins]);

  useEffect(() => {
    setHovered(null);
  }, [bins]);

  return {
    bins,
    maxAttempts,
    hideLowSampleCells,
    minAttempts,
    hovered,
    toggleHideLowSample: () => setHideLowSampleCells((value) => !value),
    setMinAttempts,
    setHovered,
  };
}
