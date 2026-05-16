import { useRef } from "react";
import { CourtCellTooltip } from "@/components/court/CourtCellTooltip";
import { CourtControls } from "@/components/court/CourtControls";
import { CourtHeatmap } from "@/components/court/CourtHeatmap";
import { CourtLegend } from "@/components/court/CourtLegend";
import { CourtLines } from "@/components/court/CourtLines";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCourtBins } from "@/hooks/useCourtBins";
import { COURT } from "@/lib/courtGeometry";
import type { Shot } from "@/types/shots";

type ShotCourtProps = {
  shots: Shot[];
  title?: string;
  description?: string;
  embedded?: boolean;
};

export function ShotCourt({
  shots,
  title = "Location Efficiency",
  description,
  embedded = false,
}: ShotCourtProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const {
    bins,
    maxAttempts,
    hideLowSampleCells,
    minAttempts,
    hovered,
    toggleHideLowSample,
    setMinAttempts,
    setHovered,
  } = useCourtBins(shots);

  const content = (
    <>
      <CardHeader className="flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description ??
              `${shots.length.toLocaleString()} filtered attempts · cell color = FG%, opacity = volume`}
          </CardDescription>
        </div>
        <CourtControls
          hideLowSampleCells={hideLowSampleCells}
          minAttempts={minAttempts}
          onToggleHide={toggleHideLowSample}
          onMinAttemptsChange={setMinAttempts}
        />
      </CardHeader>
      <CardContent className="pt-0 flex-1">
        <div className="rounded-lg bg-muted/40 p-3">
          <div ref={wrapperRef} className="relative">
            <svg
              viewBox={`0 0 ${COURT.width} ${COURT.height}`}
              role="img"
              aria-label="Half-court shot chart"
              className="w-full h-auto"
              preserveAspectRatio="xMidYMid meet"
            >
              <rect x="0" y="0" width={COURT.width} height={COURT.height} rx="6" fill="#ffffff" />
              <CourtLines />
              <CourtHeatmap
                bins={bins}
                maxAttempts={maxAttempts}
                minAttempts={minAttempts}
                wrapperRef={wrapperRef}
                onHover={setHovered}
              />
            </svg>
            {hovered ? <CourtCellTooltip cell={hovered} /> : null}
          </div>
        </div>
        <CourtLegend hideLowSampleCells={hideLowSampleCells} minAttempts={minAttempts} />
      </CardContent>
    </>
  );

  if (embedded) return <div className="flex flex-col">{content}</div>;
  return <Card className="flex flex-col">{content}</Card>;
}
