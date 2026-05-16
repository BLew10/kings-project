import { Fragment, type ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { ShotCourt } from "@/components/court/ShotCourt";
import { ZoneSparkline } from "@/components/zone/ZoneSparkline";
import { initials, type PlayerRow } from "@/components/player/playerTableColumns";
import { formatPercent, formatPointsPerShot } from "@/lib/shotModel";
import { cn } from "@/lib/utils";
import type { Shot } from "@/types/shots";
import type { BreakdownRow } from "@/types/analytics";

type PlayerTableRowProps = {
  row: PlayerRow;
  selected: boolean;
  interactive: boolean;
  showSparkline: boolean;
  zones: BreakdownRow[];
  shots: Shot[];
  totalColumns: number;
  expandedContent?: ReactNode;
  onSelect: (playerId: string) => void;
};

export function PlayerTableRow({
  row,
  selected,
  interactive,
  showSparkline,
  zones,
  shots,
  totalColumns,
  expandedContent,
  onSelect,
}: PlayerTableRowProps) {
  return (
    <Fragment>
      <tr className={cn("transition-colors", selected && "bg-accent/60 hover:bg-accent/60")}>
        <td className="px-4 py-1.5">
          <button
            type="button"
            onClick={interactive ? () => onSelect(row.playerId) : undefined}
            aria-expanded={interactive ? selected : undefined}
            disabled={!interactive}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-sm text-left disabled:cursor-default",
              interactive && "hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            )}
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
              {initials(row.player)}
            </span>
            <span className={cn("font-medium", selected && "text-primary")}>{row.playerLabel}</span>
          </button>
        </td>
        <td className="px-4 py-1.5 text-right tabular-nums">{row.attempts.toLocaleString()}</td>
        <td className="px-4 py-1.5 text-right tabular-nums">{formatPercent(row.fgPct)}</td>
        <td className="px-4 py-1.5 text-right tabular-nums">{formatPointsPerShot(row.pointsPerShot)}</td>
        <td className="px-4 py-1.5 text-right tabular-nums">{formatPercent(row.assistedPct)}</td>
        <td className="px-4 py-1.5 text-right tabular-nums">{formatPercent(row.catchShootPct)}</td>
        <td className="px-4 py-1.5 text-right tabular-nums">{row.avgDribbles.toFixed(1)}</td>
        {showSparkline ? (
          <td className="px-4 py-1.5">
            <ZoneSparkline rows={zones} />
          </td>
        ) : null}
        {interactive ? (
          <td className="px-2 py-1.5 text-right">
            <button
              type="button"
              onClick={() => onSelect(row.playerId)}
              aria-label={`${selected ? "Collapse" : "Expand"} ${row.playerLabel}`}
              aria-expanded={selected}
              className="rounded-sm p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight
                className={cn(
                  "size-4 text-muted-foreground/60 transition-transform",
                  selected && "rotate-90 text-primary",
                )}
              />
            </button>
          </td>
        ) : null}
      </tr>
      {selected ? (
        <tr className="bg-accent/20">
          <td colSpan={totalColumns} className="px-4 py-4">
            <ExpandedPlayerDetail row={row} shots={shots} expandedContent={expandedContent} />
          </td>
        </tr>
      ) : null}
    </Fragment>
  );
}

function ExpandedPlayerDetail({
  row,
  shots,
  expandedContent,
}: {
  row: PlayerRow;
  shots: Shot[];
  expandedContent?: ReactNode;
}) {
  if (shots.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card px-4 py-6 text-sm text-muted-foreground">
        No shot locations match the current filters for {row.playerLabel}.
      </div>
    );
  }

  return (
    <div className="animate-slide-down grid gap-4 rounded-lg border border-border bg-card p-4 lg:grid-cols-[minmax(280px,0.85fr)_minmax(360px,1.15fr)]">
      <div className="min-w-0">
        <ShotCourt
          shots={shots}
          title={`${row.playerLabel} Location Efficiency`}
          description={`${shots.length.toLocaleString()} attempts · color = FG%, opacity = volume`}
          embedded
        />
      </div>
      {expandedContent ? <div className="min-w-0">{expandedContent}</div> : null}
    </div>
  );
}
