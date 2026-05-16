import { Check, Clipboard, WandSparkles } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { buildPrompt, type FilterOptions, type PromptInput } from "@/lib/promptBuilder";

export type { FilterOptions };

type ActionPlanPromptProps = PromptInput;

export function ActionPlanPrompt(props: ActionPlanPromptProps) {
  const { copied, copy } = useCopyToClipboard();
  const prompt = useMemo(() => buildPrompt(props), [props]);

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm">
            <WandSparkles className="size-4 text-primary" />
            AI Action Plan Prompt
          </CardTitle>
          <CardDescription>
            Copy this into an AI tool to turn the current data, filters, and shot profile into a coaching or roster action plan.
          </CardDescription>
        </div>
        <Button type="button" size="sm" onClick={() => copy(prompt)} disabled={props.summary.attempts === 0}>
          {copied ? <Check className="size-3.5" /> : <Clipboard className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </CardHeader>
      <CardContent className="pt-0">
        <Textarea
          readOnly
          value={prompt}
          className="min-h-[260px] resize-y whitespace-pre-wrap text-xs leading-relaxed"
          aria-label="AI action plan prompt"
        />
      </CardContent>
    </Card>
  );
}
