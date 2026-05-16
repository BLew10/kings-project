import { CalendarDays, Users } from "lucide-react";
import { DateRangePicker } from "@/components/filter/DateRangePicker";
import { FilterChips } from "@/components/filter/FilterChips";
import { FilterField } from "@/components/filter/FilterField";
import { MultiSelect } from "@/components/filter/MultiSelect";
import { SegmentedField } from "@/components/filter/SegmentedField";
import {
  BOOLEAN_FILTER_OPTIONS,
  CREATION_OPTIONS,
  FILTER_TOOLTIPS,
  OUTCOME_OPTIONS,
  TOUCH_OPTIONS,
} from "@/components/filter/filterConstants";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useFilterChips, type FilterChip } from "@/hooks/useFilterChips";
import { DEFAULT_FILTERS, DRIBBLE_BUCKETS, PERIODS, SHOT_CLOCK_BUCKETS, SHOT_VALUES, SHOT_ZONES } from "@/lib/filterSchema";
import { formatPeriod, labelFor } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { ContestLevel, Filters, PlayerOption, ShotType } from "@/types/shots";

type FilterBarProps = {
  filters: Filters;
  players: PlayerOption[];
  shotTypes: ShotType[];
  complexShotTypes: string[];
  contestLevels: ContestLevel[];
  minDate: string;
  maxDate: string;
  onChange: (filters: Filters) => void;
  hidePlayerFilter?: boolean;
};

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
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => onChange({ ...filters, [key]: value });
  const chips = useFilterChips({ filters, players, minDate, maxDate, hidePlayerFilter });

  const removeChip = (chip: FilterChip) => onChange({ ...filters, [chip.key]: chip.resetTo });
  const reset = () => onChange({ ...DEFAULT_FILTERS, dateFrom: minDate, dateTo: maxDate });
  const applyDatePreset = (preset: "all" | "7d" | "30d" | "60d") => {
    if (preset === "all") return onChange({ ...filters, dateFrom: minDate, dateTo: maxDate });
    const days = preset === "7d" ? 7 : preset === "30d" ? 30 : 60;
    const end = new Date(`${maxDate}T00:00:00`);
    const start = new Date(end);
    start.setDate(end.getDate() - (days - 1));
    const startIso = start.toISOString().slice(0, 10);
    onChange({ ...filters, dateFrom: startIso < minDate ? minDate : startIso, dateTo: maxDate });
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-3">
        <div className={cn("grid grid-cols-1 gap-3 md:grid-cols-2", hidePlayerFilter ? "lg:grid-cols-4" : "lg:grid-cols-5")}>
          {!hidePlayerFilter ? (
            <FilterField icon={<Users className="size-3.5" />} label="Player" tooltip={FILTER_TOOLTIPS.player}>
              <MultiSelect
                value={filters.player}
                options={players.map((player) => ({ value: player.id, label: player.label }))}
                allLabel="All players"
                onChange={(value) => update("player", value)}
              />
            </FilterField>
          ) : null}

          <FilterField label="Shot type" tooltip={FILTER_TOOLTIPS.shotType}>
            <MultiSelect
              value={filters.shotType}
              options={shotTypes.map((type) => ({ value: type, label: labelFor(type) }))}
              allLabel="All shot types"
              onChange={(value) => update("shotType", value)}
            />
          </FilterField>

          <FilterField label="Shot detail" tooltip={FILTER_TOOLTIPS.complexShotType}>
            <MultiSelect
              value={filters.complexShotType}
              options={complexShotTypes.map((type) => ({ value: type, label: labelFor(type) }))}
              allLabel="All shot details"
              onChange={(value) => update("complexShotType", value)}
            />
          </FilterField>

          <FilterField label="Contest" tooltip={FILTER_TOOLTIPS.contestLevel}>
            <MultiSelect
              value={filters.contestLevel}
              options={contestLevels.map((level) => ({ value: level, label: labelFor(level) }))}
              allLabel="Any contest level"
              onChange={(value) => update("contestLevel", value)}
            />
          </FilterField>

          <FilterField icon={<CalendarDays className="size-3.5" />} label="Date range" tooltip={FILTER_TOOLTIPS.dateRange}>
            <DateRangePicker
              dateFrom={filters.dateFrom}
              dateTo={filters.dateTo}
              minDate={minDate}
              maxDate={maxDate}
              onDateFromChange={(value) => update("dateFrom", value)}
              onDateToChange={(value) => update("dateTo", value)}
              onPreset={applyDatePreset}
            />
          </FilterField>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <SegmentedField label="Creation" tooltip={FILTER_TOOLTIPS.assisted} value={filters.assisted} options={CREATION_OPTIONS} onChange={(v) => update("assisted", v)} />
          <SegmentedField label="Touch type" tooltip={FILTER_TOOLTIPS.catchAndShoot} value={filters.catchAndShoot} options={TOUCH_OPTIONS} onChange={(v) => update("catchAndShoot", v)} />
          <FilterField label="Shot clock" tooltip={FILTER_TOOLTIPS.shotClockBucket}>
            <MultiSelect
              value={filters.shotClockBucket}
              options={SHOT_CLOCK_BUCKETS.map((bucket) => ({ value: bucket, label: labelFor(bucket) }))}
              allLabel="Any shot clock"
              onChange={(value) => update("shotClockBucket", value)}
            />
          </FilterField>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
          <FilterField label="Zone" tooltip={FILTER_TOOLTIPS.zone}>
            <MultiSelect
              value={filters.zone}
              options={SHOT_ZONES.map((zone) => ({ value: zone, label: labelFor(zone) }))}
              allLabel="Any zone"
              onChange={(value) => update("zone", value)}
            />
          </FilterField>
          <FilterField label="Dribbles" tooltip={FILTER_TOOLTIPS.dribbleBucket}>
            <MultiSelect
              value={filters.dribbleBucket}
              options={DRIBBLE_BUCKETS.map((bucket) => ({ value: bucket, label: labelFor(bucket) }))}
              allLabel="Any dribble count"
              onChange={(value) => update("dribbleBucket", value)}
            />
          </FilterField>
          <FilterField label="Shot value" tooltip={FILTER_TOOLTIPS.shotValue}>
            <MultiSelect
              value={filters.shotValue}
              options={SHOT_VALUES.map((value) => ({ value, label: labelFor(value) }))}
              allLabel="2s and 3s"
              onChange={(value) => update("shotValue", value)}
            />
          </FilterField>
          <FilterField label="Period" tooltip={FILTER_TOOLTIPS.period}>
            <MultiSelect
              value={filters.period}
              options={PERIODS.map((period) => ({ value: period, label: formatPeriod(period) }))}
              allLabel="Any period"
              onChange={(value) => update("period", value)}
            />
          </FilterField>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
          <SegmentedField label="Outcome" tooltip={FILTER_TOOLTIPS.outcome} value={filters.outcome} options={OUTCOME_OPTIONS} onChange={(v) => update("outcome", v)} />
          <SegmentedField label="Assist opp" tooltip={FILTER_TOOLTIPS.assistOpportunity} value={filters.assistOpportunity} options={BOOLEAN_FILTER_OPTIONS} onChange={(v) => update("assistOpportunity", v)} />
          <SegmentedField label="Blocked" tooltip={FILTER_TOOLTIPS.blocked} value={filters.blocked} options={BOOLEAN_FILTER_OPTIONS} onChange={(v) => update("blocked", v)} />
          <SegmentedField label="Fouled" tooltip={FILTER_TOOLTIPS.fouled} value={filters.fouled} options={BOOLEAN_FILTER_OPTIONS} onChange={(v) => update("fouled", v)} />
          <SegmentedField label="Contested" tooltip={FILTER_TOOLTIPS.contested} value={filters.contested} options={BOOLEAN_FILTER_OPTIONS} onChange={(v) => update("contested", v)} />
        </div>

        <FilterChips chips={chips} onRemoveChip={removeChip} onReset={reset} />
      </div>
    </TooltipProvider>
  );
}
