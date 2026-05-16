import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  onRetry: () => void;
  retrying?: boolean;
};

export function ErrorState({ onRetry, retrying = false }: ErrorStateProps) {
  return (
    <section
      role="alert"
      className="mx-auto flex w-full max-w-lg flex-col items-center py-16 text-center"
    >
      <span className="flex size-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
        <AlertTriangle className="size-8" />
      </span>

      <h2 className="mt-6 text-2xl font-semibold tracking-tight">
        We couldn&apos;t load the dashboard
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Something went wrong while fetching the shot data. This is usually temporary.
      </p>

      <ul className="mt-6 space-y-2 text-left text-sm text-muted-foreground">
        <li className="flex gap-2">
          <span aria-hidden="true" className="text-rose-500">•</span>
          <span>Check your internet connection.</span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden="true" className="text-rose-500">•</span>
          <span>Wait a moment, then try again.</span>
        </li>
        <li className="flex gap-2">
          <span aria-hidden="true" className="text-rose-500">•</span>
          <span>If this keeps happening, the data file may be missing or unavailable.</span>
        </li>
      </ul>

      <Button onClick={onRetry} disabled={retrying} className="mt-8">
        <RefreshCw className={`size-4 ${retrying ? "animate-spin" : ""}`} />
        {retrying ? "Retrying…" : "Retry"}
      </Button>
    </section>
  );
}
