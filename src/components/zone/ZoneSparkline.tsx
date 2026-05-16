import { ZONE_ORDER } from "@/components/zone/zoneConstants";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatPointsPerShot, formatZone } from "@/lib/shotModel";
import type { BreakdownRow } from "@/types/analytics";

type ZoneSparklineProps = {
  rows: BreakdownRow[];
  className?: string;
};

export function ZoneSparkline({ rows, className }: ZoneSparklineProps) {
  const segments = buildSegments(rows);

  if (segments.length === 0) {
    return <div className={className ?? "h-2 w-full rounded-full bg-muted"} />;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={className ?? "h-2 w-full rounded-full bg-muted overflow-hidden flex cursor-help"}>
          {segments.map((segment) => (
            <div
              key={segment.key}
              className="h-full first:rounded-l-full last:rounded-r-full"
              style={{ width: `${segment.normalizedShare * 100}%`, backgroundColor: segment.color }}
            />
          ))}
        </div>
      </TooltipTrigger>
      <TooltipContent side="left" className="max-w-xs bg-card text-foreground border border-border shadow-md">
        <div className="space-y-1 py-0.5">
          {segments.map((segment) => (
            <div key={segment.key} className="flex items-center gap-2 text-xs">
              <span className="size-2 rounded-sm shrink-0" style={{ backgroundColor: segment.color }} />
              <span className="flex-1 text-foreground">{formatZone(segment.key)}</span>
              <span className="tabular-nums text-muted-foreground">
                {(segment.share * 100).toFixed(1)}% · {formatPointsPerShot(segment.pointsPerShot)} PPS ·{" "}
                {(segment.fgPct * 100).toFixed(1)}% FG
              </span>
            </div>
          ))}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

function buildSegments(rows: BreakdownRow[]) {
  const byKey = new Map(rows.map((row) => [row.key, row]));
  const raw = ZONE_ORDER.map((zone) => {
    const match = byKey.get(zone.key);
    return {
      ...zone,
      share: match?.share ?? 0,
      fgPct: match?.fgPct ?? 0,
      pointsPerShot: match?.pointsPerShot ?? 0,
      attempts: match?.attempts ?? 0,
    };
  }).filter((segment) => segment.share > 0);

  const total = raw.reduce((sum, segment) => sum + segment.share, 0);
  return raw.map((segment) => ({
    ...segment,
    normalizedShare: total > 0 ? segment.share / total : 0,
  }));
}
