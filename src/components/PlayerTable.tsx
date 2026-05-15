import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { formatPercent } from "@/lib/shotModel";
import { cn } from "@/lib/utils";
import type { BreakdownRow, MetricSummary } from "@/types/shots";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ZoneLegend, ZoneSparkline } from "@/components/ZoneSparkline";

type PlayerRow = MetricSummary & { player: string };

type PlayerTableProps = {
  rows: PlayerRow[];
  selectedPlayer?: string;
  onSelectPlayer?: (player: string) => void;
  /** Optional per-player zone breakdown. When provided, renders a Shot Mix sparkline column. */
  playerZones?: Record<string, BreakdownRow[]>;
  title?: string;
  description?: string;
};

type SortKey = "player" | "attempts" | "fgPct" | "assistedPct" | "catchShootPct" | "avgDribbles";
type SortDir = "asc" | "desc";

const COLUMNS: Array<{ key: SortKey; label: string; align: "left" | "right" }> = [
  { key: "player", label: "Player", align: "left" },
  { key: "attempts", label: "Attempts", align: "right" },
  { key: "fgPct", label: "FG%", align: "right" },
  { key: "assistedPct", label: "Assisted%", align: "right" },
  { key: "catchShootPct", label: "C&S%", align: "right" },
  { key: "avgDribbles", label: "Avg Dribbles", align: "right" },
];

export function PlayerTable({
  rows,
  selectedPlayer,
  onSelectPlayer,
  playerZones,
  title = "Player Comparison",
  description,
}: PlayerTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("attempts");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const interactive = typeof onSelectPlayer === "function";
  const showSparkline = !!playerZones;

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const va = a[sortKey] as number | string;
      const vb = b[sortKey] as number | string;
      if (typeof va === "string" && typeof vb === "string") {
        return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      const na = va as number;
      const nb = vb as number;
      return sortDir === "asc" ? na - nb : nb - na;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "player" ? "asc" : "desc");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
        {showSparkline ? (
          <div className="pt-2">
            <ZoneLegend />
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="pt-0">
        <TooltipProvider delayDuration={150}>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 text-xs uppercase tracking-wide text-muted-foreground">
                  {COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        "px-4 py-1.5 font-medium select-none cursor-pointer hover:text-foreground",
                        col.align === "right" ? "text-right" : "text-left",
                      )}
                    >
                      <span className={cn("inline-flex items-center gap-1", col.align === "right" && "flex-row-reverse")}>
                        {col.label}
                        <SortIcon active={sortKey === col.key} dir={sortDir} />
                      </span>
                    </th>
                  ))}
                  {showSparkline ? (
                    <th className="px-4 py-1.5 font-medium text-left min-w-[180px]">Shot Mix</th>
                  ) : null}
                  {interactive ? <th className="w-8" /> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((row) => {
                  const selected = selectedPlayer === row.player;
                  return (
                    <tr
                      key={row.player}
                      onClick={interactive ? () => onSelectPlayer!(row.player) : undefined}
                      className={cn(
                        "transition-colors",
                        interactive && "cursor-pointer hover:bg-accent/40",
                        selected && "bg-accent/60 hover:bg-accent/60",
                      )}
                    >
                      <td className="px-4 py-1.5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                            {initials(row.player)}
                          </span>
                          <span className={cn("font-medium", selected && "text-primary")}>{row.player}</span>
                        </div>
                      </td>
                      <td className="px-4 py-1.5 text-right tabular-nums">{row.attempts.toLocaleString()}</td>
                      <td className="px-4 py-1.5 text-right tabular-nums">{formatPercent(row.fgPct)}</td>
                      <td className="px-4 py-1.5 text-right tabular-nums">{formatPercent(row.assistedPct)}</td>
                      <td className="px-4 py-1.5 text-right tabular-nums">{formatPercent(row.catchShootPct)}</td>
                      <td className="px-4 py-1.5 text-right tabular-nums">{row.avgDribbles.toFixed(1)}</td>
                      {showSparkline ? (
                        <td className="px-4 py-1.5">
                          <ZoneSparkline rows={playerZones![row.player] ?? []} />
                        </td>
                      ) : null}
                      {interactive ? (
                        <td className="px-2 py-1.5 text-right">
                          <ChevronRight className="size-4 text-muted-foreground/60" />
                        </td>
                      ) : null}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ArrowUpDown className="size-3 opacity-40" />;
  return dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .slice(0, 2)
    .join("");
}
