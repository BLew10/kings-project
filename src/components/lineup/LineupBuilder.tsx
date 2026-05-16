import { Info, UsersRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { PlayerOption } from "@/types/analytics";

type LineupBuilderProps = {
  players: PlayerOption[];
  selected: string[];
  onChange: (players: string[]) => void;
};

export function LineupBuilder({ players, selected, onChange }: LineupBuilderProps) {
  const lineupFull = selected.length >= 5;

  /** Toggles one player while enforcing the five-player lineup cap. */
  const togglePlayer = (playerId: string) => {
    if (selected.includes(playerId)) {
      onChange(selected.filter((item) => item !== playerId));
      return;
    }
    if (!lineupFull) onChange([...selected, playerId]);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3 pb-3">
        <div className="flex items-center gap-2">
          <UsersRound className="size-4 text-primary" />
          <CardTitle className="text-sm">Lineup</CardTitle>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="size-3.5" />
            Combined shot diet, not shared-court performance
          </span>
        </div>
        <Badge variant={lineupFull ? "default" : "muted"} className="text-xs">
          {selected.length}/5
        </Badge>
      </CardHeader>
      <CardContent className="pt-0">
        <TooltipProvider delayDuration={200}>
          <div className="flex flex-wrap gap-1.5">
            {players.map((player) => {
              const isSelected = selected.includes(player.id);
              const isDisabled = !isSelected && lineupFull;
              const pill = (
                <button
                  type="button"
                  key={player.id}
                  onClick={() => togglePlayer(player.id)}
                  disabled={isDisabled}
                  className={cn(
                    "rounded-md border px-2.5 py-1 text-xs font-medium transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isSelected
                      ? "border-primary bg-primary text-primary-foreground shadow-xs"
                      : "border-border bg-card text-foreground hover:border-primary/40 hover:bg-accent",
                    isDisabled && "opacity-40 cursor-not-allowed hover:border-border hover:bg-card",
                  )}
                >
                  {player.label}
                </button>
              );
              if (isDisabled) {
                return (
                  <Tooltip key={player.id}>
                    <TooltipTrigger asChild>{pill}</TooltipTrigger>
                    <TooltipContent>Lineup is full — remove a player first.</TooltipContent>
                  </Tooltip>
                );
              }
              return pill;
            })}
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
