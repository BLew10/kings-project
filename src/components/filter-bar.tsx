import { CalendarDays, Check, ChevronDown, RotateCcw, SlidersHorizontal, Users, X } from "lucide-react";
import { useMemo } from "react";
import { booleanFilterLabel, filterLabel, labelFor } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Filters as FilterState } from "@/types/shots";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const update = <K extends keyof FilterState>(key: K, value: FilterState[K]) => onChange({ ...filters, [key]: value });

  const activeChips = useMemo(() => {
    const chips: Array<{ key: keyof FilterState; label: string; value: string; resetTo: FilterState[keyof FilterState] }> = [];
    if (!hidePlayerFilter && filters.player.length > 0) chips.push({ key: "player", label: filterLabel("player"), value: formatSelection(filters.player, (value) => value), resetTo: [] });
    if (filters.shotType.length > 0) chips.push({ key: "shotType", label: filterLabel("shotType"), value: formatSelection(filters.shotType, labelFor), resetTo: [] });
    if (filters.complexShotType.length > 0) chips.push({ key: "complexShotType", label: filterLabel("complexShotType"), value: formatSelection(filters.complexShotType, labelFor), resetTo: [] });
    if (filters.contestLevel.length > 0) chips.push({ key: "contestLevel", label: filterLabel("contestLevel"), value: formatSelection(filters.contestLevel, labelFor), resetTo: [] });
    if (filters.shotClockBucket.length > 0) chips.push({ key: "shotClockBucket", label: filterLabel("shotClockBucket"), value: formatSelection(filters.shotClockBucket, labelFor), resetTo: [] });
    if (filters.assisted !== "all") chips.push({ key: "assisted", label: filterLabel("assisted"), value: booleanFilterLabel("assisted", filters.assisted), resetTo: "all" });
    if (filters.catchAndShoot !== "all") chips.push({ key: "catchAndShoot", label: filterLabel("catchAndShoot"), value: booleanFilterLabel("catchAndShoot", filters.catchAndShoot), resetTo: "all" });
    if (filters.dateFrom && filters.dateFrom !== minDate) chips.push({ key: "dateFrom", label: "From", value: filters.dateFrom, resetTo: minDate });
    if (filters.dateTo && filters.dateTo !== maxDate) chips.push({ key: "dateTo", label: "To", value: filters.dateTo, resetTo: maxDate });
    return chips;
  }, [filters, hidePlayerFilter, minDate, maxDate]);

  const reset = () =>
    onChange({
      player: [],
      shotType: [],
      complexShotType: [],
      contestLevel: [],
      assisted: "all",
      catchAndShoot: "all",
      shotClockBucket: [],
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
            <MultiSelect
              value={filters.player}
              options={players.map((player) => ({ value: player, label: player }))}
              allLabel="All players"
              onChange={(value) => update("player", value)}
            />
          </FilterField>
        ) : null}

        <FilterField label="Shot type">
          <MultiSelect
            value={filters.shotType}
            options={shotTypes.map((type) => ({ value: type, label: labelFor(type) }))}
            allLabel="All shot types"
            onChange={(value) => update("shotType", value)}
          />
        </FilterField>

        <FilterField label="Shot detail">
          <MultiSelect
            value={filters.complexShotType}
            options={complexShotTypes.map((type) => ({ value: type, label: labelFor(type) }))}
            allLabel="All shot details"
            onChange={(value) => update("complexShotType", value)}
          />
        </FilterField>

        <FilterField label="Contest">
          <MultiSelect
            value={filters.contestLevel}
            options={contestLevels.map((level) => ({ value: level, label: labelFor(level) }))}
            allLabel="Any contest level"
            onChange={(value) => update("contestLevel", value)}
          />
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
          <MultiSelect
            value={filters.shotClockBucket}
            options={SHOT_CLOCK_BUCKETS}
            allLabel="Any shot clock"
            onChange={(value) => update("shotClockBucket", value)}
          />
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
                  onClick={() => onChange({ ...filters, [chip.key]: chip.resetTo })}
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

/** Renders a compact popover-based multi-select filter. */
function MultiSelect({
  value,
  options,
  allLabel,
  onChange,
}: {
  value: string[];
  options: Array<{ value: string; label: string }>;
  allLabel: string;
  onChange: (value: string[]) => void;
}) {
  const selected = new Set(value);
  const label =
    value.length === 0
      ? allLabel
      : value.length === 1
        ? options.find((option) => option.value === value[0])?.label ?? value[0]
        : `${value.length} selected`;

  const toggle = (optionValue: string) => {
    if (selected.has(optionValue)) {
      onChange(value.filter((item) => item !== optionValue));
      return;
    }
    onChange([...value, optionValue]);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-normal text-foreground">
          <span className="truncate">{label}</span>
          <ChevronDown className="size-4 opacity-60 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-1">
        <button
          type="button"
          onClick={() => onChange([])}
          className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
        >
          <span>{allLabel}</span>
          {value.length === 0 ? <Check className="size-4 text-primary" /> : null}
        </button>
        <div className="my-1 h-px bg-border" />
        <div className="max-h-72 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              className="flex w-full items-center justify-between gap-2 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
            >
              <span className="truncate">{option.label}</span>
              {selected.has(option.value) ? <Check className="size-4 shrink-0 text-primary" /> : null}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

/** Formats active chip text for multi-select values without letting long lists dominate the toolbar. */
function formatSelection(values: string[], formatValue: (value: string) => string): string {
  const formatted = values.map(formatValue);
  if (formatted.length <= 2) return formatted.join(", ");
  return `${formatted.slice(0, 2).join(", ")} +${formatted.length - 2}`;
}

/** Provides consistent label and spacing for one filter control. */
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

/** Renders mutually exclusive scalar filter options as a segmented control. */
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
