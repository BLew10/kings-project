import { AlertTriangle, CheckCircle2, Lightbulb, ShieldQuestion } from "lucide-react";
import type { RankedInsight } from "@/types/shots";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type InsightSummaryProps = {
  insights: RankedInsight[];
};

const priorityMeta: Record<RankedInsight["priority"], { label: string; className: string; icon: typeof CheckCircle2 }> = {
  preserve: { label: "Preserve", className: "text-emerald-700 bg-emerald-50", icon: CheckCircle2 },
  trim: { label: "Trim", className: "text-rose-700 bg-rose-50", icon: AlertTriangle },
  role: { label: "Role", className: "text-primary bg-secondary", icon: Lightbulb },
  caveat: { label: "Caveat", className: "text-amber-700 bg-amber-50", icon: ShieldQuestion },
};

export function InsightSummary({ insights }: InsightSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Lightbulb className="size-4 text-primary" />
          Shortlist Insights
        </CardTitle>
        <CardDescription>Ranked coaching notes from volume, shot value, creation mix, and sample risk.</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {insights.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {insights.map((insight) => {
              const meta = priorityMeta[insight.priority];
              const Icon = meta.icon;
              return (
                <article key={insight.id} className="rounded-lg border border-border bg-card p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-md", meta.className)}>
                        <Icon className="size-3.5" />
                      </span>
                      <h3 className="truncate text-sm font-semibold">{insight.title}</h3>
                    </div>
                    <Badge variant="outline" className="shrink-0 text-[10px] uppercase tracking-wide">
                      {meta.label}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{insight.detail}</p>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No ranked insight cleared the volume and value thresholds. Adjust filters or use the profile as exploratory context.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
