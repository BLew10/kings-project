import type { ReactNode } from "react";
import { PlayerTableRow } from "@/components/player/PlayerTableRow";
import { SortIcon } from "@/components/player/SortIcon";
import {
  getPlayerSortValue,
  PLAYER_COLUMNS,
  type PlayerRow,
  type SortKey,
} from "@/components/player/playerTableColumns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ZoneLegend } from "@/components/zone/ZoneLegend";
import { useSortedRows } from "@/hooks/useSortedRows";
import { cn } from "@/lib/utils";
import type { BreakdownRow, Shot } from "@/types/shots";

type PlayerTableProps = {
  rows: PlayerRow[];
  selectedPlayer?: string;
  onSelectPlayer?: (playerId: string | undefined) => void;
  playerZones?: Record<string, BreakdownRow[]>;
  playerShots?: Record<string, Shot[]>;
  expandedContent?: ReactNode;
  title?: string;
  description?: string;
};

export function PlayerTable({
  rows,
  selectedPlayer,
  onSelectPlayer,
  playerZones,
  playerShots,
  expandedContent,
  title = "Player Comparison",
  description,
}: PlayerTableProps) {
  const interactive = typeof onSelectPlayer === "function";
  const showSparkline = !!playerZones;
  const totalColumns = PLAYER_COLUMNS.length + (showSparkline ? 1 : 0) + (interactive ? 1 : 0);

  const { sorted, sortKey, sortDir, toggleSort } = useSortedRows<PlayerRow, SortKey>(rows, getPlayerSortValue, {
    defaultKey: "attempts",
    defaultDir: "desc",
    ascByDefault: (key) => key === "player",
  });

  const handleSelect = (playerId: string) => {
    if (!interactive) return;
    onSelectPlayer(selectedPlayer === playerId ? undefined : playerId);
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
                  {PLAYER_COLUMNS.map((col) => (
                    <th
                      key={col.key}
                      aria-sort={sortKey === col.key ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                      className={cn(
                        "px-4 py-1.5 font-medium select-none",
                        col.align === "right" ? "text-right" : "text-left",
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => toggleSort(col.key)}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-sm hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          col.align === "right" && "flex-row-reverse",
                        )}
                      >
                        {col.label}
                        <SortIcon active={sortKey === col.key} dir={sortDir} />
                      </button>
                    </th>
                  ))}
                  {showSparkline ? (
                    <th className="px-4 py-1.5 font-medium text-left min-w-[180px]">Shot Mix</th>
                  ) : null}
                  {interactive ? <th className="w-8" /> : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sorted.map((row) => (
                  <PlayerTableRow
                    key={row.playerId}
                    row={row}
                    selected={selectedPlayer === row.playerId}
                    interactive={interactive}
                    showSparkline={showSparkline}
                    zones={playerZones?.[row.playerId] ?? []}
                    shots={playerShots?.[row.playerId] ?? []}
                    totalColumns={totalColumns}
                    expandedContent={expandedContent}
                    onSelect={handleSelect}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
