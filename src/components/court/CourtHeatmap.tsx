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
        const key = `${bin.x}-${bin.y}-${bin.marker ?? "cell"}`;
        const hover = (element: SVGElement) => {
          const wrapperRect = wrapperRef.current?.getBoundingClientRect();
          if (!wrapperRect) return;
          const cellRect = element.getBoundingClientRect();
          onHover({
            attempts: bin.attempts,
            makes: bin.makes,
            points: bin.points,
            anchorX: cellRect.left - wrapperRect.left + cellRect.width / 2,
            anchorY: cellRect.top - wrapperRect.top,
          });
        };
        if (bin.marker === "backcourt") {
          return (
            <g
              key={key}
              role="img"
              aria-label="Backcourt heave attempts"
              onMouseEnter={(event) => hover(event.currentTarget)}
              onMouseLeave={() => onHover(null)}
            >
              <rect
                x={point.x - 15}
                y={point.y - 15}
                width="30"
                height="30"
                rx="3"
                transform={`rotate(45 ${point.x} ${point.y})`}
                fill={fillFor(makeRate, intensity)}
                stroke={isLowSample ? "#111827" : "rgba(15,15,23,0.22)"}
                strokeWidth={isLowSample ? "1.5" : "1"}
                strokeDasharray={isLowSample ? "3 2" : undefined}
              />
              <text
                x={point.x}
                y={point.y + 4}
                textAnchor="middle"
                className="pointer-events-none fill-white text-[10px] font-semibold"
              >
                BC
              </text>
            </g>
          );
        }
        return (
          <rect
            key={key}
            x={point.x - 13}
            y={point.y - 13}
            width="26"
            height="26"
            rx="3"
            fill={fillFor(makeRate, intensity)}
            stroke={isLowSample ? "#111827" : "rgba(15,15,23,0.06)"}
            strokeWidth={isLowSample ? "1.5" : "0.5"}
            strokeDasharray={isLowSample ? "3 2" : undefined}
            onMouseEnter={(event) => hover(event.currentTarget)}
            onMouseLeave={() => onHover(null)}
          />
        );
      })}
    </>
  );
}
