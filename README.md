# Sacramento Kings Shot Profile Dashboard

A frontend-only dashboard for exploring anonymized 2024-25 NBA shot attempt data for 12 players, treated as one assumed team per the project instructions.

## Tech Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 with a custom design-system layer (light theme, Kings purple as accent)
- A small shadcn-style component library hand-rolled on top of Radix UI primitives (`src/components/ui/`)
- Custom SVG court visualization with a hue-and-opacity heatmap (no charting library)
- Static CSV loaded in the browser from `public/data/shots.csv`; manual parser in `src/lib/csv.ts`
- No backend or database

## Why This Stack

The dataset is small, clean, and static, so the core problem is data transformation, interaction design, and clear presentation. A frontend-only React app keeps the project easy to run and review while still showcasing maintainable component structure, typed data modeling, filter state, and reusable aggregation logic. Radix + Tailwind give accessible primitives without paying the weight of a full UI framework.

## Dashboard Features

The dashboard has **three tabs**, each answering a distinct question from the brief:

- **Team** — *"What does the team (or a single player) look like, spatially?"* The assumed team's full shot profile: KPIs, half-court heatmap, zone breakdown, shot-detail mix, and recommendation notes. Filter to a player to see their profile against the team baseline (the FG% card surfaces the delta).
- **Players** — *"Which players are taking which types of shots?"* A side-by-side comparison table for all twelve players with a per-row zone-mix sparkline. The sparkline is the differentiator: at a glance you can see who's a rim attacker (purple-heavy) vs. a 3pt specialist (green-heavy) vs. a midrange shooter (red-heavy) without reading every column. Filters apply.
- **Lineup** — *"What does this combination of five players look like?"* Compact lineup picker (defaults to top-5-by-attempts) plus the same shot profile components as Team. All Team filters carry over.

A single sticky filter bar drives both views: player, shot type, shot detail, contest level, date range (with presets), creation (assisted / self-created), touch type (catch-and-shoot / off-dribble), and shot-clock bucket. Active filters render as removable chips and a one-click "Reset all".

## Important Assumptions

- All 12 anonymized players are treated as one team, as instructed.
- The data is shot-level only. It does not include opponents, score, possessions, minutes, positions, or actual on-court lineup combinations.
- The Lineup view is therefore a combined shot profile for five selected players, not true shared-court lineup performance. This caveat is shown directly in the UI.
- Position breakdowns are intentionally omitted because the dataset does not include player positions.
- Shot zones are derived from the provided court coordinates using pragmatic basketball distance thresholds (`src/lib/shotModel.ts`).

## Tradeoffs

- **Three tabs, each a distinct perspective.** An earlier iteration had a "Player" tab that rendered the same UI as Team with a player filter pre-applied — that was a duplicate mode, not a distinct insight, and was cut. The current **Players** tab is different: it's a comparison view (twelve players side-by-side, sparklines) that shows patterns invisible in Team. Each tab is a different *shape* of the data, not a different *filter*.
- **No AI / prompt features.** An AI prompt builder was prototyped but cut: it didn't answer any of the questions in the brief and risked looking like scope creep. The recommendation card surfaces zone-level deltas that *are* derived from the data, which is what a coach would actually use.
- **Frontend-only vs backend.** A backend would be unnecessary for 8,816 clean rows. Client-side filtering with `useMemo` is fast and keeps the surface area small. For a larger dataset, parsing and aggregation would move behind an API or precomputed data layer.
- **Single-select filters.** Multi-select for fields like Shot Detail (which has natural groupings like "all drives" or "all catch-and-shoot variants") would add real analytical value but also requires a custom MultiSelect primitive, an `string[]` filter state, and more edge cases. Given the 8-10 hour brief and the goal of "polished, thoughtful" over feature-heavy, every filter is single-select with an "All" sentinel. The segmented controls handle the few binary dimensions.
- **Custom SVG court vs charting library.** A custom component lets the heatmap encode two channels at once (hue = FG%, opacity = volume) without fighting a generic chart abstraction. Recharts or Visx would speed up the bar lists but would bring weight we don't need for three simple charts.
- **Manual CSV parsing vs Papa Parse.** The CSV is well-structured and known. A small parser is sufficient. For user-uploaded or messy CSVs, Papa Parse would be safer.
- **Local state vs global store.** Plain React state with memoized selectors is enough; a store would be premature without URL state, collaboration, or many cross-cutting views.
- **FG% as the headline metric.** The data dictionary does not explicitly distinguish 2PT vs 3PT, so we use raw FG% with zone context. A production version would add expected points and eFG% once shot value is modeled more formally.

## Running Locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Build

```bash
npm run build
```

## How I Would Extend This for Larger Data

- Move raw events into a database or columnar file format (Parquet / DuckDB).
- Add backend APIs for filtered aggregations; cache common rollups.
- Precompute common player, zone, and shot-context summaries server-side.
- Add URL-shareable filters so coaches can hand a view to a colleague.
- Add opponent, lineup, possession, score, and play-type context if the source data grows to include them.
- Move heavy aggregation to a web worker, or fully server-side, if client-side filtering becomes noticeable.
- Add a true Lineup analytics surface once shared-court possession data is available.
