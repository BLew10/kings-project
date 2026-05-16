import { type RefObject } from "react";
import { type CourtBin, fillFor, toCourtPoint } from "@/lib/courtGeometry";

export type HoveredCell = {
  attempts: number;
  makes: number;
  points: number;
  anchorX: number;
  anchorY: number;
};

type CourtHeatmapProps = {
  bins: CourtBin[];
  maxAttempts: number;
  minAttempts: number;
  wrapperRef: RefObject<HTMLDivElement | null>;
  onHover: (cell: HoveredCell | null) => void;
};

export function CourtHeatmap({ bins, maxAttempts, minAttempts, wrapperRef, onHover }: CourtHeatmapProps) {
  return (
    <>
      {bins.map((bin) => {
        const point = toCourtPoint(bin.x, bin.y);
        const makeRate = bin.makes / bin.attempts;
        const intensity = bin.attempts / maxAttempts;
        const isLowSample = bin.attempts < minAttempts;
        return (
          <rect
            key={`${bin.x}-${bin.y}`}
            x={point.x - 13}
            y={point.y - 13}
            width="26"
            height="26"
            rx="3"
            fill={fillFor(makeRate, intensity)}
            stroke={isLowSample ? "#111827" : "rgba(15,15,23,0.06)"}
            strokeWidth={isLowSample ? "1.5" : "0.5"}
            strokeDasharray={isLowSample ? "3 2" : undefined}
            onMouseEnter={(event) => {
              const wrapperRect = wrapperRef.current?.getBoundingClientRect();
              if (!wrapperRect) return;
              const cellRect = event.currentTarget.getBoundingClientRect();
              onHover({
                attempts: bin.attempts,
                makes: bin.makes,
                points: bin.points,
                anchorX: cellRect.left - wrapperRect.left + cellRect.width / 2,
                anchorY: cellRect.top - wrapperRect.top,
              });
            }}
            onMouseLeave={() => onHover(null)}
          />
        );
      })}
    </>
  );
}
