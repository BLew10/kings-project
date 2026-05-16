import { BarChart3, Crown, Users, Zap } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { DashboardView } from "@/hooks/useDashboardComputations";

type DashboardHeaderProps = {
  view: DashboardView;
  onViewChange: (view: DashboardView) => void;
  showTabs: boolean;
};

export function DashboardHeader({ view, onViewChange, showTabs }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Crown className="size-5" />
          </span>
          <div className="hidden sm:block">
            <h1 className="text-base font-semibold leading-tight">Kings Shot Profile</h1>
            <p className="text-xs text-muted-foreground leading-tight">2024-25 season · 12-player sample</p>
          </div>
        </div>
        {showTabs ? (
          <Tabs value={view} onValueChange={(value) => onViewChange(value as DashboardView)}>
            <TabsList>
              <TabsTrigger value="team">
                <Users className="size-3.5" /> Team
              </TabsTrigger>
              <TabsTrigger value="players">
                <BarChart3 className="size-3.5" /> Players
              </TabsTrigger>
              <TabsTrigger value="lineup">
                <Zap className="size-3.5" /> Lineup
              </TabsTrigger>
            </TabsList>
          </Tabs>
        ) : null}
      </div>
    </header>
  );
}
