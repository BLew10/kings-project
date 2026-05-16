# Sacramento Kings Shot Profile Dashboard

A frontend-only dashboard for exploring anonymized 2024-25 NBA shot attempt data for 12 players, treated as one assumed team per the project instructions.

This project is intentionally scoped as a frontend product and interaction exercise. Given the small static dataset and 8-10 hour guidance, the emphasis is on a polished analytical experience, clear component boundaries, responsive filtering, and useful basketball workflows rather than backend infrastructure or data-platform optimization.

**Live demo:** [kings-project-three.vercel.app](https://kings-project-three.vercel.app/)

## How The Dashboard Answers The Project Questions

This submission is intentionally scoped to a polished, maintainable three-view dashboard rather than a broad unfinished analytics suite. The prompt lists five possible questions the dashboard can help answer; this app addresses each one directly:

- **Which players are taking which types of shots?**
  The **Players** tab compares all 12 players in one sortable table. It shows attempts, FG%, assisted rate, catch-and-shoot rate, average dribbles, and a per-player zone-mix sparkline. Clicking a player expands that row into a player-specific location efficiency heatmap, making it easy to move from table-level comparison to spatial shot profile without leaving the view.

- **Which shots are efficient or inefficient?**
  The **Team** and **Lineup** tabs show efficiency spatially and categorically. `ShotCourt` colors binned court cells by FG% and uses opacity for volume, while the zone and shot-detail breakdowns list attempts, share, FG%, and points per shot. Because points per shot is derived from a coordinate-based shot-value model, high-value threes and rim attempts are evaluated more appropriately than raw FG% alone.

- **How shot-making changes by context?**
  The sticky filter bar lets the user isolate shot type, shot detail, contest level, date range, assisted vs self-created attempts, catch-and-shoot vs off-dribble attempts, and shot-clock bucket. Every KPI, court cell, bar list, player row, and lineup profile recomputes from those filters, so context changes are visible immediately.

- **How individual player tendencies compare to the assumed team profile?**
  The **Team** tab can focus on one player through the player filter and keeps the team baseline visible in the FG% card. The **Players** tab adds a side-by-side comparison view so individual shot diets can be compared against the full 12-player assumed team.

- **What tactical or roster-level insights can be derived from the data?**
  The app derives ranked coaching notes from zone-efficiency deltas (best bets to preserve, inefficient slices to trim, role signals, sample-size caveats) and embeds them in the copy-ready AI action-plan prompt for the current profile. The lineup view combines any five selected players' shot profiles to show whether the group leans toward paint pressure, above-break threes, corner threes, midrange attempts, catch-and-shoot looks, or self-created shots. Each team, player, or lineup profile also includes that AI action-plan prompt, which packages the current filters, summary metrics, zone mix, shot-detail mix, contest context, and caveats so a coach or analyst can develop a plan of action outside the app. Because the source data does not include shared-court possessions or minutes, the UI explicitly describes this as combined shot diet rather than true lineup performance.

## Tech Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 with a custom design-system layer (light theme, Kings purple as accent)
- A small shadcn-style component library hand-rolled on top of Radix UI primitives (`src/components/ui/`)
- Custom SVG court visualization with a hue-and-opacity heatmap (no charting library)
- Static CSV loaded in the browser from `public/data/shots.csv`; manual parser in `src/lib/csv.ts`
- No backend or database

## Why This Stack

The dataset is small, clean, and static, so the core problem is data transformation, interaction design, and clear presentation. A frontend-only React app keeps the project easy to run and review while still showcasing maintainable component structure, typed data modeling, filter state, and reusable aggregation logic. Backend services, warehouse queries, and caching layers are intentionally left out of scope for this version; those become relevant when the data grows beyond a static shot file.

Vite is a good fit for an evaluation project because it has almost no app-framework ceremony, starts quickly, and produces a simple static build. React + TypeScript gives a familiar component model with useful compile-time contracts around shot rows, filters, summaries, and chart data. Tailwind keeps layout and visual decisions close to the component that owns them, while the small shadcn-style UI layer keeps repeated primitives consistent without introducing a full design system dependency. Radix is used only where accessibility and interaction details are valuable, such as selects, popovers, tabs, and tooltips.

From a UI/UX perspective, the stack supports a dense coaching/front-office tool rather than a marketing page. The layout favors fast scanning, persistent filters, tabbed analytical modes, sortable tables, compact metric cards, and direct manipulation in the lineup picker. The visual system is restrained: Kings purple anchors identity, while efficiency colors use basketball-friendly semantics (red/amber/green) so the heatmap can encode performance and volume without requiring extra explanation.

## Dashboard Features

### High-Level Overview

- Three analytical views: Team, Players, and Lineup.
- Multi-select filters for player, shot type, shot detail, contest level, and shot-clock bucket.
- Date presets and custom date range filtering.
- KPI cards for attempts, FG%, assisted rate, catch-and-shoot rate, average dribbles, and average shot clock.
- Derived shot value and points per shot, including PPS deltas against the current team baseline.
- Custom court heatmaps where color represents FG% and opacity represents shot volume.
- Sortable player comparison table with zone-mix sparklines and click-to-expand player heatmaps.
- Zone, shot-detail, and contest-context breakdowns with volume share, PPS, and FG%.
- Derived coaching notes (best bets, trim candidates, role signals, sample caveats) embedded in the AI action-plan prompt.
- URL-shareable tab and filter state so a reviewer can preserve a specific analytical slice.
- Copy-ready AI action-plan prompts for team, player, and lineup profiles.

The dashboard has **three tabs**, each answering a distinct question from the brief:

- **Team**: *"What does the team (or a single player) look like, spatially?"* The assumed team's full shot profile: KPIs, half-court heatmap, zone breakdown, shot-detail mix, and an AI action-plan prompt that bakes in the derived insights. Filter to a player to see their profile against the team baseline (the FG% card surfaces the delta).
- **Players**: *"Which players are taking which types of shots?"* A side-by-side comparison table for all twelve players with a per-row zone-mix sparkline. Click a row to open that player's location efficiency heatmap and generate a copy-ready AI action-plan prompt for the filtered profile.
- **Lineup**: *"What does this combination of five players look like?"* Compact lineup picker (defaults to top-5-by-attempts) plus the same shot profile components as Team. All Team filters carry over, including the AI action-plan prompt.

A single sticky filter bar drives the dashboard: player, shot type, shot detail, contest level, date range (with presets), creation (assisted / self-created), touch type (catch-and-shoot / off-dribble), and shot-clock bucket. The dropdown filters support multi-select, active filters render as removable chips, and "Reset all" restores the full dataset.

## Important Assumptions

- All 12 anonymized players are treated as one team, as instructed.
- The data is shot-level only. It does not include opponents, score, possessions, minutes, positions, or actual on-court lineup combinations.
- The Lineup view is therefore a combined shot profile for five selected players, not true shared-court lineup performance. This caveat is shown directly in the UI.
- Position breakdowns are intentionally omitted because the dataset does not include player positions.
- Shot zones and shot value are derived from the provided court coordinates because the source CSV includes `x`, `y`, and `outcome`, but no official `shot_value`, 2PT/3PT flag, or play-by-play scoring field.

### Derived Shot Value And Three-Point Logic

The app keeps a custom shot-value function because points per shot is materially more useful than raw FG% for shot-profile decisions. Without deriving 2PT vs 3PT value, a 35% three and a 45% long two would be compared only by FG%, even though the made-three attempt is worth more expected points.

This is an example of value created from the fields the dataset did include. The CSV did not directly provide points, shot value, PPS, or a 2PT/3PT marker; it only provided location and outcome fields. By combining those available fields with NBA court geometry, the dashboard can add derived scoring context: made-shot points, points per shot, zone efficiency, PPS deltas against the team baseline, and more useful preserve/trim signals.

The derivation lives in `src/lib/shotModel.ts` and uses the NBA court geometry against this dataset's coordinate system:

- The offensive hoop is treated as `(-47, 0)`, matching the supplied court coordinates where the offensive half is on the negative-x side.
- Shot distance is `sqrt((x - hoopX)^2 + (y - hoopY)^2)`.
- Above-break threes are checked dynamically with `sqrt((x - hoopX)^2 + (y - hoopY)^2) >= 23.75`, so each shot is compared to the actual 23'9" arc from the basket rather than to a fixed top-of-arc bucket.
- Corner threes use the official NBA sideline-parallel lines 3 feet from each sideline. Because the court is 50 feet wide, those lines sit at `|y| = 22` feet and run from the baseline until they intersect the 23'9" arc.
- The corner-line endpoint is computed from the circle equation: `cornerEndX = hoopX + sqrt(23.75^2 - 22^2)`, which evaluates to about `-38.05` in this coordinate system.
- Made shots beyond the derived three-point line count as 3 points; other made field goals count as 2.

This is deterministic and grounded in official NBA dimensions, but it is still derived data. A production analytics pipeline should prefer official play-by-play, a 2PT/3PT flag, or reviewed shot metadata because real scoring can depend on foot placement relative to the line, line width, and scorekeeper/replay decisions that are not present in the CSV.

Resources used for the math:

- [NBA Official Rulebook, Rule No. 1: Court Dimensions](https://official.nba.com/rulebook/): the three-point area is defined by sideline-parallel lines 3 feet from the sidelines and a 23'9" arc from the middle of the basket.
- [Official 2025-26 NBA Playing Rules PDF](https://cdn.nba.com/manage/2026/01/Official-2025-26-NBA-Playing-Rules.pdf): the court diagram shows the 22-foot corner distance and 23 feet 9 inches above-break arc; Rule No. 5 defines successful field goals outside the three-point line as 3 points and on/inside the line as 2 points.

## Tradeoffs

- **Three tabs, each a distinct perspective.** Team, Players, and Lineup are intentionally different shapes of the data rather than the same screen with different filters. Team focuses on a spatial shot profile, Players focuses on side-by-side comparison, and Lineup focuses on combined five-player shot diet.
- **Copy-ready AI prompt vs integrated AI.** The app includes an AI action-plan prompt, but it does not call an AI API. That keeps the submission deterministic, credential-free, and easy to run while still helping a user turn the dashboard's filtered data into a coaching or roster plan in the AI tool of their choice.
- **Frontend-only vs backend.** A backend would be unnecessary for 8,816 clean rows. Client-side filtering with `useMemo` is fast and keeps the surface area small. For a larger dataset, parsing and aggregation would move behind an API or precomputed data layer.
- **Multi-select dropdowns vs simpler single-select controls.** Player, shot type, shot detail, contest, and shot-clock filters support multi-select so users can combine related contexts like multiple shot details or multiple players. That adds state complexity, but it makes the action-plan prompt more useful because users can describe realistic coaching questions instead of only one narrow slice at a time.
- **Custom SVG court vs charting library.** A custom component lets the heatmap encode two channels at once (hue = FG%, opacity = volume) without fighting a generic chart abstraction. Recharts or Visx would speed up the bar lists but would bring weight we don't need for three simple charts.
- **Manual CSV parsing vs Papa Parse.** The CSV is well-structured and known. A small parser is sufficient. For user-uploaded or messy CSVs, Papa Parse would be safer.
- **Local state vs global store.** Plain React state with memoized selectors is enough; a store would be premature without URL state, collaboration, or many cross-cutting views.
- **Derived shot value instead of official scoring metadata.** The data dictionary does not include a 2PT/3PT flag, so points per shot is derived from the coordinate-based zone model using official NBA three-point geometry. This is a better decision metric than FG% alone, but a production version would validate point value directly from play-by-play, official shot metadata, or replay-reviewed scoring.
- **Lightweight insight engine vs complex modeling.** The derived coaching notes use transparent zone deltas and sample thresholds instead of a black-box model. That makes the insights easy to explain and audit, but it is intentionally less sophisticated than an expected-shot model.
- **URL state without account-level sharing.** Filters and the active tab are encoded in the query string for easy review links. If I had more time, I would add saved reports so coaches or front-office users could preserve a filtered view, the derived insights, and the action-plan prompt as a reusable analysis package.
- **Compact app shell vs narrative report.** The product is designed as an exploratory work surface, not a slide deck. Coaches and analysts can change context quickly, but the app does not prescribe a single final story beyond what the AI action-plan prompt synthesizes.

## Running Locally

Prerequisites: Node 18+.

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Build

```bash
npm run build
```

Produces a static bundle in `dist/`. There is no server component.

## Tests

```bash
npm test
```

Vitest covers the pure data layer: CSV parsing, zone classification and shot-value derivation, filter application, and summary aggregation. Run `npm run test:watch` while iterating.

`npm run typecheck` runs `tsc -b` against the project's TypeScript references; this is the invocation to use before pushing or in CI, since the root `tsc --noEmit` shortcut checks nothing because the root tsconfig uses `files: []`.

## How I Would Extend This for Larger Data

With richer data, I would move this from descriptive shot profiling toward coaching and roster decision-support:

- Add player and ball tracking data (SportVU / Second Spectrum-style) to replace broad contest buckets with true defender distance, closeout angle, shooter movement, pass quality, and off-ball actions leading into the shot.
- Add defender identity and matchup context so "heavily contested" can be evaluated differently based on who contested the shot, the defender's size/role, and the coverage or switch that created the attempt.
- Build an expected shot value model using location, shot type, defender distance, shot clock, movement, pass context, and game state. This would separate shot-making from shot quality and surface actual vs expected efficiency.
- Add true possession, lineup, and play-type data so the Lineup view can move from combined player shot diet to shared-court shot selection, spacing, role interaction, and which four players best support a given player.
- Add opponent and defensive context, including team defensive rating, rim frequency allowed, 3PA rate allowed, and scheme tendencies, to understand how shot profiles change by matchup.
- Add multi-season, injury, availability, rest, and fatigue context to stabilize noisy samples and explain whether shot-profile changes are role-driven, health-driven, or opponent-driven.
- Add league, team, and role benchmarks for eFG%, expected points, shot quality above expectation, and zone/shot-type efficiency.
- Add video or possession links so filtered results can become coaching playlists, such as late-clock contested pull-ups or high-value catch-and-shoot examples.
- From an engineering standpoint, move raw events into a database or columnar format, expose API-backed filtered aggregations, cache common rollups, and keep the current selector/component boundaries so larger data sources can be added without rewriting the dashboard. The current ingestion path (`src/lib/csv.ts` plus the derivation helpers in `shotModel.ts`) is already a single seam that can be replaced with an API client.
