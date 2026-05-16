type CourtLegendProps = {
  hideLowSampleCells: boolean;
  minAttempts: number;
};

export function CourtLegend({ hideLowSampleCells, minAttempts }: CourtLegendProps) {
  const hasLowVolumeCutoff = minAttempts > 0;

  return (
    <div className="flex flex-wrap items-center gap-3 pt-4 text-xs text-muted-foreground">
      <LegendSwatch color="rgb(244, 63, 94)" label="Below 40% FG" />
      <LegendSwatch color="rgb(245, 158, 11)" label="40–49.9%" />
      <LegendSwatch color="rgb(16, 185, 129)" label="50%+ FG" />
      {hasLowVolumeCutoff ? (
        <span className="inline-flex items-center gap-1.5">
          <span className="size-3 rounded-sm border border-dashed border-foreground/70 bg-background" />
          Fewer than {minAttempts} attempts
        </span>
      ) : null}
      <span className="ml-auto">
        {!hasLowVolumeCutoff
          ? "All half-court cells shown."
          : hideLowSampleCells
          ? `Cells under ${minAttempts} attempts hidden.`
          : "All cells shown; low-sample cells are dashed."}
      </span>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-3 rounded-sm" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
