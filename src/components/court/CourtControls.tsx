import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type CourtControlsProps = {
  hideLowSampleCells: boolean;
  minAttempts: number;
  onToggleHide: () => void;
  onMinAttemptsChange: (value: number) => void;
  stacked?: boolean;
};

export function CourtControls({
  hideLowSampleCells,
  minAttempts,
  onToggleHide,
  onMinAttemptsChange,
  stacked = false,
}: CourtControlsProps) {
  const handleMinAttempts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number(event.target.value);
    if (Number.isFinite(next)) onMinAttemptsChange(Math.max(0, Math.round(next)));
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div
        className={cn(
          "flex shrink-0 gap-2 text-xs text-muted-foreground",
          stacked
            ? "flex-col items-start"
            : "flex-wrap items-center justify-end",
        )}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={onToggleHide}
              className="inline-flex h-8 items-center gap-2 rounded-md border border-input bg-card px-2.5 font-medium text-foreground shadow-xs hover:bg-accent"
              role="switch"
              aria-checked={hideLowSampleCells}
            >
              <span
                className={`relative inline-flex h-4 w-7 shrink-0 rounded-full transition-colors ${
                  hideLowSampleCells ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`absolute top-0.5 size-3 rounded-full bg-card shadow-sm transition-transform ${
                    hideLowSampleCells ? "translate-x-3.5" : "translate-x-0.5"
                  }`}
                />
              </span>
              Hide low-volume cells
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-72 bg-card text-foreground border border-border text-xs leading-relaxed shadow-md">
            Turn on to hide cells with fewer attempts than the cutoff. Turn off to show every cell and mark low-volume cells with a dashed border.
          </TooltipContent>
        </Tooltip>
        <label className="inline-flex h-8 items-center gap-1.5 rounded-md border border-input bg-card px-2 shadow-xs">
          <span>Low-volume cutoff</span>
          <input
            type="number"
            min="0"
            value={minAttempts}
            onChange={handleMinAttempts}
            className="w-10 bg-transparent text-right font-medium text-foreground outline-none"
            aria-label="Low-volume attempt cutoff"
          />
          <span>att</span>
        </label>
      </div>
    </TooltipProvider>
  );
}
