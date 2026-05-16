import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import type { FilterChip } from "@/hooks/useFilterChips";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type FilterChipsProps = {
  chips: FilterChip[];
  onRemoveChip: (chip: FilterChip) => void;
  onReset: () => void;
};

export function FilterChips({ chips, onRemoveChip, onReset }: FilterChipsProps) {
  if (chips.length === 0) {
    return (
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs text-muted-foreground">
          No filters applied · showing every shot in the dataset.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1">
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <SlidersHorizontal className="size-3.5" />
        Active filters
      </span>
      {chips.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondary"
          className="cursor-pointer pl-2 pr-1 py-1 gap-1 hover:bg-secondary/70"
          onClick={() => onRemoveChip(chip)}
        >
          <span className="font-normal text-secondary-foreground/70">{chip.label}:</span>
          <span className="font-medium">{chip.value}</span>
          <X className="size-3.5 opacity-60" />
        </Badge>
      ))}
      <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground hover:text-foreground">
        <RotateCcw className="size-3.5" />
        Reset all
      </Button>
    </div>
  );
}
