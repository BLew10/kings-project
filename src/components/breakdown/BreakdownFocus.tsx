import { BarList } from "@/components/barList/BarList";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { labelFor } from "@/lib/labels";
import type { BreakdownRow } from "@/types/shots";

type BreakdownKey = "zone" | "detail" | "clock" | "dribbles" | "contest" | "value" | "period";

type BreakdownFocusProps = {
  breakdowns: {
    zone: BreakdownRow[];
    detail: BreakdownRow[];
    context: BreakdownRow[];
    clock: BreakdownRow[];
    dribble: BreakdownRow[];
    value: BreakdownRow[];
    period: BreakdownRow[];
  };
};

const TABS: Array<{
  key: BreakdownKey;
  label: string;
  title: string;
  source: keyof BreakdownFocusProps["breakdowns"];
  description: string;
  maxRows?: number;
  formatKey?: (key: string) => string;
}> = [
  { key: "zone", label: "Zone", title: "Zone Profile", source: "zone", description: "Where shots come from.", maxRows: 7 },
  { key: "detail", label: "Detail", title: "Shot Detail Mix", source: "detail", description: "Top shot types within the current filter.", maxRows: 6, formatKey: labelFor },
  { key: "clock", label: "Clock", title: "Shot Clock", source: "clock", description: "Possession phase for attempts.", maxRows: 5, formatKey: labelFor },
  { key: "dribbles", label: "Dribbles", title: "Dribble Context", source: "dribble", description: "How much self-creation preceded the shot.", maxRows: 5, formatKey: labelFor },
  { key: "contest", label: "Contest", title: "Contest Context", source: "context", description: "Defensive pressure distribution across selected shots.", formatKey: labelFor },
  { key: "value", label: "Value", title: "Shot Value", source: "value", description: "Two-point versus three-point attempt mix.", formatKey: labelFor },
  { key: "period", label: "Period", title: "Period", source: "period", description: "Quarter and overtime distribution for selected attempts.", formatKey: (key) => key },
];

export function BreakdownFocus({ breakdowns }: BreakdownFocusProps) {
  return (
    <Card>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Breakdown Focus</p>
          <h3 className="mt-1 text-base font-semibold tracking-tight">Shot Diet Context</h3>
        </div>
        <Tabs defaultValue="zone" className="space-y-4">
          <TabsList className="grid h-auto w-full grid-cols-3 gap-1 sm:grid-cols-4 xl:grid-cols-3">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key} className="px-2 text-xs">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {TABS.map((tab) => (
            <TabsContent key={tab.key} value={tab.key}>
              <BarList
                title={tab.title}
                rows={breakdowns[tab.source]}
                maxRows={tab.maxRows}
                formatKey={tab.formatKey}
                description={tab.description}
                embedded
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
