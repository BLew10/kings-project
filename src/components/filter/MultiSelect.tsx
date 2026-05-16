import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type MultiSelectProps<T extends string> = {
  value: T[];
  options: Array<{ value: T; label: string }>;
  allLabel: string;
  onChange: (value: T[]) => void;
};

export function MultiSelect<T extends string>({ value, options, allLabel, onChange }: MultiSelectProps<T>) {
  const selected = new Set(value);
  const label =
    value.length === 0
      ? allLabel
      : value.length === 1
        ? options.find((option) => option.value === value[0])?.label ?? value[0]
        : `${value.length} selected`;

  const toggle = (optionValue: T) => {
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
