import { FilterTooltip } from "@/components/filter/FilterTooltip";
import type { FilterSegmentOption } from "@/components/filter/filterConstants";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { ScalarBooleanFilter } from "@/types/filters";

type SegmentedFieldProps = {
  label: string;
  tooltip?: string;
  value: ScalarBooleanFilter;
  options: FilterSegmentOption[];
  onChange: (value: ScalarBooleanFilter) => void;
};

export function SegmentedField({ label, tooltip, value, options, onChange }: SegmentedFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5">
        {label}
        {tooltip ? <FilterTooltip text={tooltip} /> : null}
      </Label>
      <div className="inline-flex h-9 w-full items-center rounded-md bg-muted p-1 text-sm">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "flex-1 rounded-sm px-2.5 py-1 text-xs font-medium transition-colors",
              value === option.value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
