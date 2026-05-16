import type { ReactNode } from "react";
import { FilterTooltip } from "@/components/filter/FilterTooltip";
import { Label } from "@/components/ui/label";

type FilterFieldProps = {
  label: string;
  icon?: ReactNode;
  tooltip?: string;
  children: ReactNode;
};

export function FilterField({ label, icon, tooltip, children }: FilterFieldProps) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5">
        {icon}
        {label}
        {tooltip ? <FilterTooltip text={tooltip} /> : null}
      </Label>
      {children}
    </div>
  );
}
