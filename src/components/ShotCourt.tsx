import { useMemo } from "react";
import type { Shot } from "@/types/shots";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type ShotCourtProps = {
  shots: Shot[];
};

const COURT = {
  minX: -52,
  maxX: 0,
  minY: -25,
  maxY: 25,
  width: 520,
  height: 500,
};

// Color stops: rose → amber → emerald (cool to warm by FG%)
function fillFor(makeRate: number, intensity: number) {
  let base: string;
  if (makeRate >= 0.5) base = "16, 185, 129"; // emerald-500
  else if (makeRate >= 0.4) base = "245, 158, 11"; // amber-500
  else base = "244, 63, 94"; // rose-500
  const opacity = 0.35 + intensity * 0.6;
  return `rgba(${base}, ${opacity.toFixed(2)})`;
}

export function ShotCourt({ shots }: ShotCourtProps) {
  const bins = useMemo(() => getBins(shots), [shots]);
  const maxBinAttempts = useMemo(() => Math.max(...bins.map((b) => b.attempts), 1), [bins]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Location Efficiency</CardTitle>
          <CardDescription>
            {shots.length.toLocaleString()} filtered attempts · cell color = FG%, opacity = volume
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-0 flex-1">
        <div className="rounded-lg bg-muted/40 p-3">
          <svg
            viewBox={`0 0 ${COURT.width} ${COURT.height}`}
            role="img"
            aria-label="Half-court shot chart"
            className="w-full h-auto"
            preserveAspectRatio="xMidYMid meet"
          >
            <rect x="0" y="0" width={COURT.width} height={COURT.height} rx="6" fill="#ffffff" />
            {/* Court lines */}
            <g fill="none" stroke="#5a2d81" strokeWidth="1.5" opacity="0.8">
              <line x1="0" x2={COURT.width} y1="250" y2="250" />
              <line x1="50" x2="50" y1="30" y2="470" />
              <rect x="50" y="160" width="190" height="180" />
              <circle cx="50" cy="250" r="17" />
              <path d="M 240 160 A 90 90 0 0 1 240 340" />
              <path d="M 50 30 A 235 235 0 0 1 50 470" />
              <line x1="0" x2="120" y1="30" y2="30" />
              <line x1="0" x2="120" y1="470" y2="470" />
              <circle cx="50" cy="250" r="3" fill="#5a2d81" />
            </g>
            {/* Heatmap cells */}
            {bins.map((bin) => {
              const point = toCourtPoint(bin.x, bin.y);
              const makeRate = bin.makes / bin.attempts;
              const intensity = bin.attempts / maxBinAttempts;
              return (
                <rect
                  key={`${bin.x}-${bin.y}`}
                  x={point.x - 13}
                  y={point.y - 13}
                  width="26"
                  height="26"
                  rx="3"
                  fill={fillFor(makeRate, intensity)}
                  stroke="rgba(15,15,23,0.06)"
                  strokeWidth="0.5"
                >
                  <title>{`${bin.attempts} attempts · ${(makeRate * 100).toFixed(1)}% FG`}</title>
                </rect>
              );
            })}
          </svg>
        </div>
        <div className="flex flex-wrap items-center gap-3 pt-4 text-xs text-muted-foreground">
          <LegendSwatch color="rgb(244, 63, 94)" label="Below 40% FG" />
          <LegendSwatch color="rgb(245, 158, 11)" label="40–49.9%" />
          <LegendSwatch color="rgb(16, 185, 129)" label="50%+ FG" />
          <span className="ml-auto">Cells with fewer than 5 attempts hidden.</span>
        </div>
      </CardContent>
    </Card>
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

function toCourtPoint(x: number, y: number) {
  const courtX = ((x - COURT.minX) / (COURT.maxX - COURT.minX)) * COURT.width;
  const courtY = 250 - (y / (COURT.maxY - COURT.minY)) * COURT.height;
  return { x: courtX, y: courtY };
}

function getBins(shots: Shot[]) {
  const groups = new Map<string, { x: number; y: number; attempts: number; makes: number }>();
  for (const shot of shots) {
    const x = Math.round(shot.x / 3) * 3;
    const y = Math.round(shot.y / 3) * 3;
    const key = `${x}:${y}`;
    const existing = groups.get(key) ?? { x, y, attempts: 0, makes: 0 };
    existing.attempts += 1;
    existing.makes += shot.outcome ? 1 : 0;
    groups.set(key, existing);
  }
  return [...groups.values()].filter((bin) => bin.attempts >= 5);
}
