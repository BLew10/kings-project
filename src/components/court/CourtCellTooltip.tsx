import { type HoveredCell } from "@/components/court/CourtHeatmap";

export function CourtCellTooltip({ cell }: { cell: HoveredCell }) {
  return (
    <div
      className="pointer-events-none absolute rounded-md bg-foreground px-2.5 py-1.5 text-xs font-medium text-background shadow-md"
      style={{
        left: cell.anchorX,
        top: cell.anchorY,
        transform: "translate(-50%, calc(-100% - 6px))",
      }}
    >
      {cell.attempts} attempts · {(cell.points / cell.attempts).toFixed(2)} PPS ·{" "}
      {((cell.makes / cell.attempts) * 100).toFixed(1)}% FG
    </div>
  );
}
