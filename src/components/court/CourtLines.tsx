import { COURT, LANE, THREE_POINT_LINE } from "@/lib/courtGeometry";

export function CourtLines() {
  return (
    <>
      <g fill="none" stroke="#5a2d81" strokeWidth="1.5" opacity="0.8">
        <line x1="0" x2={COURT.width} y1="250" y2="250" />
        <line x1={LANE.hoop.x} x2={LANE.hoop.x} y1={LANE.topSideline.y} y2={LANE.bottomSideline.y} />
        <rect x={LANE.baseline.x} y={LANE.top.y} width={LANE.width} height={LANE.height} />
        <circle cx="50" cy="250" r="17" />
        <path d={LANE.freeThrowArcPath} />
        <circle cx="50" cy="250" r="3" fill="#5a2d81" />
      </g>
      <g fill="none" stroke="#111827" strokeWidth="2.25" opacity="0.75" strokeLinecap="round">
        <line
          x1={THREE_POINT_LINE.baseline.x}
          y1={THREE_POINT_LINE.topCorner.y}
          x2={THREE_POINT_LINE.cornerEnd.x}
          y2={THREE_POINT_LINE.topCorner.y}
        />
        <path d={THREE_POINT_LINE.arcPath} />
        <line
          x1={THREE_POINT_LINE.baseline.x}
          y1={THREE_POINT_LINE.bottomCorner.y}
          x2={THREE_POINT_LINE.cornerEnd.x}
          y2={THREE_POINT_LINE.bottomCorner.y}
        />
      </g>
    </>
  );
}
