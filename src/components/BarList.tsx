import { formatPercent, formatZone } from "@/lib/shotModel";
import type { BreakdownRow } from "@/types/shots";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type BarListProps = {
  title: string;
  rows: BreakdownRow[];
  formatKey?: (key: string) => string;
  maxRows?: number;
  description?: string;
};

export function BarList({ title, rows, formatKey = formatZone, maxRows, description }: BarListProps) {
  const visible = typeof maxRows === "number" ? rows.slice(0, maxRows) : rows;
  const hiddenCount = rows.length - visible.length;
  const hiddenShare = hiddenCount > 0 ? rows.slice(visible.length).reduce((sum, r) => sum + r.share, 0) : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
        {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {visible.length === 0 ? (
          <p className="text-xs text-muted-foreground">No data for the current filter.</p>
        ) : (
          <>
            {visible.map((row) => {
              // Bar represents this slice's share of the filtered total (not normalized to the largest row).
              // Sub-1% slices get a 1.5% minimum so they remain visible as a tick mark.
              const sharePct = row.share * 100;
              const fillPct = row.share > 0 ? Math.max(1.5, sharePct) : 0;
              return (
                <div key={row.key} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2 text-sm">
                    <span className="font-medium truncate">{formatKey(row.key)}</span>
                    <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                      {sharePct.toFixed(1)}% · {row.attempts.toLocaleString()} att · {formatPercent(row.fgPct)} FG
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-300"
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {hiddenCount > 0 ? (
              <p className="text-xs text-muted-foreground pt-1">
                + {hiddenCount} more · {(hiddenShare * 100).toFixed(1)}% of attempts
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
