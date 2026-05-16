import { Activity, LineChart, Target, TrendingUp, Users } from "lucide-react";
import { MetricCard } from "@/components/MetricCard";
import { formatPercent, formatPointsPerShot } from "@/lib/shotModel";
import type { MetricSummary } from "@/types/shots";

type MetricGridProps = {
  summary: MetricSummary;
  teamSummary: MetricSummary;
  showDelta: boolean;
};

export function MetricGrid({ summary, teamSummary, showDelta }: MetricGridProps) {
  const fgDelta = summary.fgPct - teamSummary.fgPct;
  const ppsDelta = summary.pointsPerShot - teamSummary.pointsPerShot;

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <MetricCard
        label="Attempts"
        value={summary.attempts.toLocaleString()}
        detail={`${summary.makes.toLocaleString()} makes`}
        icon={Target}
        tone="default"
      />
      <MetricCard
        label="Field Goal %"
        value={formatPercent(summary.fgPct)}
        detail={`Team baseline: ${formatPercent(teamSummary.fgPct)}`}
        icon={TrendingUp}
        tone={summary.attempts > 0 && fgDelta >= 0 ? "success" : "warning"}
        delta={
          showDelta
            ? { value: `${(Math.abs(fgDelta) * 100).toFixed(1)} pts`, positive: fgDelta >= 0 }
            : undefined
        }
      />
      <MetricCard
        label="Points / Shot"
        value={formatPointsPerShot(summary.pointsPerShot)}
        detail={`Team baseline: ${formatPointsPerShot(teamSummary.pointsPerShot)}`}
        icon={LineChart}
        tone={ppsDelta >= 0 ? "success" : "warning"}
        delta={
          showDelta
            ? { value: `${Math.abs(ppsDelta).toFixed(2)} PPS`, positive: ppsDelta >= 0 }
            : undefined
        }
      />
      <MetricCard
        label="Assisted Rate"
        value={formatPercent(summary.assistedPct)}
        detail={`Catch & shoot: ${formatPercent(summary.catchShootPct)}`}
        icon={Users}
        tone="primary"
      />
      <MetricCard
        label="Avg Dribbles"
        value={summary.avgDribbles.toFixed(1)}
        detail={`Clock: ${summary.avgShotClock.toFixed(1)}s · Release: ${summary.avgShotDuration.toFixed(1)}s`}
        icon={Activity}
        tone="default"
      />
    </section>
  );
}
