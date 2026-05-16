import type { BreakdownRow } from "@/types/shots";
import { formatPointsPerShot, formatZone } from "@/lib/shotModel";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const ZONE_ORDER: Array<{ key: string; color: string; label: string }> = [
  { key: "rim", color: "#5a2d81", label: "Rim" },
  { key: "paint", color: "#8b5cf6", label: "Paint" },
  { key: "short_midrange", color: "#f59e0b", label: "Short Mid" },
  { key: "long_midrange", color: "#f43f5e", label: "Long Mid" },
  { key: "corner_three", color: "#10b981", label: "Corner 3" },
  { key: "above_break_three", color: "#34d399", label: "Above-Break 3" },
  { key: "backcourt", color: "#94a3b8", label: "Backcourt" },
];

type ZoneSparklineProps = {
  rows: BreakdownRow[];
  className?: string;
};

export function ZoneSparkline({ rows, className }: ZoneSparklineProps) {
  const byKey = new Map(rows.map((r) => [r.key, r]));
  const segments = ZONE_ORDER.map((z) => ({
    ...z,
    share: byKey.get(z.key)?.share ?? 0,
    fgPct: byKey.get(z.key)?.fgPct ?? 0,
    pointsPerShot: byKey.get(z.key)?.pointsPerShot ?? 0,
    attempts: byKey.get(z.key)?.attempts ?? 0,
  })).filter((s) => s.share > 0);

  if (segments.length === 0) {
    return <div className={className ?? "h-2 w-full rounded-full bg-muted"} />;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={
            className ??
            "h-2 w-full rounded-full bg-muted overflow-hidden flex cursor-help"
          }
        >
          {segments.map((s) => (
            <div
              key={s.key}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ width: `${s.share * 100}%`, backgroundColor: s.color }}
            />
          ))}
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-xs bg-card text-foreground border border-border shadow-md">
        <div className="space-y-1 py-0.5">
          {segments.map((s) => (
            <div key={s.key} className="flex items-center gap-2 text-xs">
              <span className="size-2 rounded-sm shrink-0" style={{ backgroundColor: s.color }} />
              <span className="flex-1 text-foreground">{formatZone(s.key)}</span>
              <span className="tabular-nums text-muted-foreground">
                {(s.share * 100).toFixed(1)}% · {formatPointsPerShot(s.pointsPerShot)} PPS · {(s.fgPct * 100).toFixed(1)}% FG
              </span>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function ZoneLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {ZONE_ORDER.map((z) => (
        <span key={z.key} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ backgroundColor: z.color }} />
          {z.label}
        </span>
      ))}
    </div>
  );
}
