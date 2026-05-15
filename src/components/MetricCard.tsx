import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  detail?: string;
  icon?: LucideIcon;
  tone?: "default" | "primary" | "success" | "warning";
  delta?: { value: string; positive: boolean };
};

const toneStyles: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-secondary text-primary",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
};

export function MetricCard({ label, value, detail, icon: Icon, tone = "default", delta }: MetricCardProps) {
  return (
    <Card className="p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
        {Icon ? (
          <span className={cn("flex size-8 items-center justify-center rounded-md", toneStyles[tone])}>
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tracking-tight tabular-nums">{value}</span>
        {delta ? (
          <span className={cn(
            "text-xs font-medium tabular-nums",
            delta.positive ? "text-emerald-600" : "text-rose-600",
          )}>
            {delta.positive ? "▲" : "▼"} {delta.value}
          </span>
        ) : null}
      </div>
      {detail ? <p className="text-xs text-muted-foreground">{detail}</p> : null}
    </Card>
  );
}
