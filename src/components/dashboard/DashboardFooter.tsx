export function DashboardFooter() {
  return (
    <footer className="border-t border-border bg-card/40 py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-muted-foreground">
          Lineup view is a combined player shot profile, not true shared-court performance. Position and opponent context are not modeled.
        </p>
      </div>
    </footer>
  );
}
