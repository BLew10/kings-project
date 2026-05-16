import { ZONE_ORDER } from "@/components/zoneOrder";

export function ZoneLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
      {ZONE_ORDER.map((zone) => (
        <span key={zone.key} className="inline-flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ backgroundColor: zone.color }} />
          {zone.label}
        </span>
      ))}
    </div>
  );
}
