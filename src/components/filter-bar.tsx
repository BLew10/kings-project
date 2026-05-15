import { CalendarDays, RotateCcw, SlidersHorizontal, Users, X } from "lucide-react";
import { useMemo } from "react";
import { booleanFilterLabel, filterLabel, labelFor } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Filters as FilterState } from "@/types/shots";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type FilterBarProps = {
  filters: FilterState;
  players: string[];
  shotTypes: string[];
  complexShotTypes: string[];
  contestLevels: string[];
  minDate: string;
  maxDate: string;
  onChange: (filters: FilterState) => void;
  /** Hide the Player dropdown and chip. Useful on views where player isn't a meaningful filter dimension. */
  hidePlayerFilter?: boolean;
};

const SHOT_CLOCK_BUCKETS: Array<{ value: string; label: string }> = [
  { value: "all", label: "Any shot clock" },
  { value: "early", label: "Early (18-24s)" },
  { value: "middle", label: "Middle (8-17s)" },
  { value: "late", label: "Late (4-7s)" },
  { value: "end", label: "End (0-3s)" },
];

const CREATION_OPTIONS = [
  { value: "all", label: "Any" },
  { value: "true", label: "Assisted" },
  { value: "false", label: "Self-created" },
];

const TOUCH_OPTIONS = [
  { value: "all", label: "Any" },
  { value: "true", label: "Catch & shoot" },
  { value: "false", label: "Off dribble" },
];

export function FilterBar({
  filters,
  players,
  shotTypes,
  complexShotTypes,
  contestLevels,
  minDate,
  maxDate,
  onChange,
  hidePlayerFilter = false,
}: FilterBarProps) {
  const update = (key: keyof FilterState, value: string) => onChange({ ...filters, [key]: value });

  const activeChips = useMemo(() => {
    const chips: Array<{ key: keyof FilterState; label: string; value: string; resetTo: string }> = [];
    if (!hidePlayerFilter && filters.player !== "all") chips.push({ key: "player", label: filterLabel("player"), value: filters.player, resetTo: "all" });
    if (filters.shotType !== "all") chips.push({ key: "shotType", label: filterLabel("shotType"), value: labelFor(filters.shotType), resetTo: "all" });
    if (filters.complexShotType !== "all") chips.push({ key: "complexShotType", label: filterLabel("complexShotType"), value: labelFor(filters.complexShotType), resetTo: "all" });
    if (filters.contestLevel !== "all") chips.push({ key: "contestLevel", label: filterLabel("contestLevel"), value: labelFor(filters.contestLevel), resetTo: "all" });
    if (filters.shotClockBucket !== "all") chips.push({ key: "shotClockBucket", label: filterLabel("shotClockBucket"), value: labelFor(filters.shotClockBucket), resetTo: "all" });
    if (filters.assisted !== "all") chips.push({ key: "assisted", label: filterLabel("assisted"), value: booleanFilterLabel("assisted", filters.assisted), resetTo: "all" });
    if (filters.catchAndShoot !== "all") chips.push({ key: "catchAndShoot", label: filterLabel("catchAndShoot"), value: booleanFilterLabel("catchAndShoot", filters.catchAndShoot), resetTo: "all" });
    if (filters.dateFrom && filters.dateFrom !== minDate) chips.push({ key: "dateFrom", label: "From", value: filters.dateFrom, resetTo: minDate });
    if (filters.dateTo && filters.dateTo !== maxDate) chips.push({ key: "dateTo", label: "To", value: filters.dateTo, resetTo: maxDate });
    return chips;
  }, [filters, hidePlayerFilter, minDate, maxDate]);

  const reset = () =>
    onChange({
      player: "all",
      shotType: "all",
      complexShotType: "all",
      contestLevel: "all",
      assisted: "all",
      catchAndShoot: "all",
      shotClockBucket: "all",
      dateFrom: minDate,
      dateTo: maxDate,
    });

  const applyDatePreset = (preset: "all" | "7d" | "30d" | "60d") => {
    if (preset === "all") {
      onChange({ ...filters, dateFrom: minDate, dateTo: maxDate });
      return;
    }
    const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 60;
    const end = new Date(maxDate);
    const start = new Date(end);
    start.setDate(end.getDate() - days);
    const startIso = start.toISOString().slice(0, 10);
    onChange({
      ...filters,
      dateFrom: startIso < minDate ? minDate : startIso,
      dateTo: maxDate,
    });
  };

  const dateLabel = (() => {
    if (!filters.dateFrom && !filters.dateTo) return "All dates";
    if (filters.dateFrom === minDate && filters.dateTo === maxDate) return "Full season";
    return `${filters.dateFrom} → ${filters.dateTo}`;
  })();

  return (
    <div className="space-y-3">
      {/* Primary filter row */}
      <div className={cn("grid grid-cols-1 gap-3 md:grid-cols-2", hidePlayerFilter ? "lg:grid-cols-4" : "lg:grid-cols-5")}>
        {!hidePlayerFilter ? (
          <FilterField icon={<Users className="size-3.5" />} label="Player">
            <Select value={filters.player} onValueChange={(v) => update("player", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All players</SelectItem>
                {players.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </FilterField>
        ) : null}

        <FilterField label="Shot type">
          <Select value={filters.shotType} onValueChange={(v) => update("shotType", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All shot types</SelectItem>
              {shotTypes.map((t) => <SelectItem key={t} value={t}>{labelFor(t)}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Shot detail">
          <Select value={filters.complexShotType} onValueChange={(v) => update("complexShotType", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All shot details</SelectItem>
              {complexShotTypes.map((t) => <SelectItem key={t} value={t}>{labelFor(t)}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField label="Contest">
          <Select value={filters.contestLevel} onValueChange={(v) => update("contestLevel", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any contest level</SelectItem>
              {contestLevels.map((l) => <SelectItem key={l} value={l}>{labelFor(l)}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>

        <FilterField icon={<CalendarDays className="size-3.5" />} label="Date range">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between font-normal text-foreground">
                <span className="truncate">{dateLabel}</span>
                <CalendarDays className="size-4 opacity-60 shrink-0" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Presets</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => applyDatePreset("7d")}>Last 7 days</Button>
                  <Button size="sm" variant="outline" onClick={() => applyDatePreset("30d")}>Last 30 days</Button>
                  <Button size="sm" variant="outline" onClick={() => applyDatePreset("60d")}>Last 60 days</Button>
                  <Button size="sm" variant="outline" onClick={() => applyDatePreset("all")}>Full season</Button>
                </div>
              </div>
              <div className="space-y-2 pt-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Custom</p>
                <div className="grid grid-cols-2 gap-2">
                  <label className="space-y-1">
                    <span className="text-xs text-muted-foreground">From</span>
                    <input
                      type="date"
                      min={minDate}
                      max={maxDate}
                      value={filters.dateFrom}
                      onChange={(e) => update("dateFrom", e.target.value)}
                      className="block w-full rounded-md border border-input bg-card px-2 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="text-xs text-muted-foreground">To</span>
                    <input
                      type="date"
                      min={minDate}
                      max={maxDate}
                      value={filters.dateTo}
                      onChange={(e) => update("dateTo", e.target.value)}
                      className="block w-full rounded-md border border-input bg-card px-2 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </label>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </FilterField>
      </div>

      {/* Secondary toggle row */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <SegmentedField label="Creation" value={filters.assisted} options={CREATION_OPTIONS} onChange={(v) => update("assisted", v)} />
        <SegmentedField label="Touch type" value={filters.catchAndShoot} options={TOUCH_OPTIONS} onChange={(v) => update("catchAndShoot", v)} />
        <FilterField label="Shot clock">
          <Select value={filters.shotClockBucket} onValueChange={(v) => update("shotClockBucket", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {SHOT_CLOCK_BUCKETS.map((b) => <SelectItem key={b.value} value={b.value}>{b.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </FilterField>
      </div>

      {/* Active chips + reset */}
      {(activeChips.length > 0 || true) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {activeChips.length > 0 ? (
            <>
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <SlidersHorizontal className="size-3.5" />
                Active filters
              </span>
              {activeChips.map((chip) => (
                <Badge
                  key={chip.key}
                  variant="secondary"
                  className="cursor-pointer pl-2 pr-1 py-1 gap-1 hover:bg-secondary/70"
                  onClick={() => update(chip.key, chip.resetTo)}
                >
                  <span className="font-normal text-secondary-foreground/70">{chip.label}:</span>
                  <span className="font-medium">{chip.value}</span>
                  <X className="size-3.5 opacity-60" />
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground hover:text-foreground">
                <RotateCcw className="size-3.5" />
                Reset all
              </Button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">No filters applied · showing every shot in the dataset.</span>
          )}
        </div>
      )}
    </div>
  );
}

function FilterField({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5">
        {icon}
        {label}
      </Label>
      {children}
    </div>
  );
}

function SegmentedField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="inline-flex h-9 w-full items-center rounded-md bg-muted p-1 text-sm">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              "flex-1 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
              value === o.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
