import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type DatePreset = "all" | "7d" | "30d" | "60d";

type DateRangePickerProps = {
  dateFrom: string;
  dateTo: string;
  minDate: string;
  maxDate: string;
  onDateFromChange: (value: string) => void;
  onDateToChange: (value: string) => void;
  onPreset: (preset: DatePreset) => void;
};

export function DateRangePicker({
  dateFrom,
  dateTo,
  minDate,
  maxDate,
  onDateFromChange,
  onDateToChange,
  onPreset,
}: DateRangePickerProps) {
  const label = getDateLabel(dateFrom, dateTo, minDate, maxDate);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-between font-normal text-foreground">
          <span className="truncate">{label}</span>
          <CalendarDays className="size-4 opacity-60 shrink-0" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Presets</p>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" onClick={() => onPreset("7d")}>Last 7 days</Button>
            <Button size="sm" variant="outline" onClick={() => onPreset("30d")}>Last 30 days</Button>
            <Button size="sm" variant="outline" onClick={() => onPreset("60d")}>Last 60 days</Button>
            <Button size="sm" variant="outline" onClick={() => onPreset("all")}>Full season</Button>
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
                value={dateFrom || ""}
                onChange={(event) => onDateFromChange(event.target.value)}
                className="block w-full rounded-md border border-input bg-card px-2 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="space-y-1">
              <span className="text-xs text-muted-foreground">To</span>
              <input
                type="date"
                min={minDate}
                max={maxDate}
                value={dateTo || ""}
                onChange={(event) => onDateToChange(event.target.value)}
                className="block w-full rounded-md border border-input bg-card px-2 py-1.5 text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function getDateLabel(dateFrom: string, dateTo: string, minDate: string, maxDate: string): string {
  if (!dateFrom && !dateTo) return "All dates";
  if (dateFrom === minDate && dateTo === maxDate) return "Full season";
  return `${dateFrom} → ${dateTo}`;
}
