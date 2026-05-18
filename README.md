# Sacramento Kings Shot Profile Dashboard

A frontend-only dashboard for exploring anonymized 2024-25 NBA shot attempt data for 12 players, treated as one assumed team per the project instructions. The focus is a polished analytical experience: clear component boundaries, fast filtering, and basketball workflows that a coach or analyst could actually use.

The first thing I did with this project was the same thing I do with any ticket: read the requirements, look at what data I had, and decide what was answerable directly versus what needed to be derived or scoped around. The CSV has location and outcome but no opponent, score, defender, or 2PT/3PT flag, so a chunk of the engineering work below is about squeezing more signal out of the fields that _are_ there (zone, shot value, shot-clock and dribble buckets) and being explicit about what isn't.

**Live demo:** [kings-project-three.vercel.app](https://kings-project-three.vercel.app/)

**Walkthrough video:** [loom.com/share/7369b4912a8d4469836378e60e9f0ee2](https://www.loom.com/share/7369b4912a8d4469836378e60e9f0ee2)

## How The Dashboard Answers The Project Questions

The brief lists five possible questions the dashboard can help answer. This submission addresses all five through three focused views rather than a broad, half-finished suite.

- **Which players are taking which types of shots?**
  The **Players** tab compares all 12 players in one sortable table: attempts, FG%, assisted rate, catch-and-shoot rate, average dribbles, and a per-player zone-mix sparkline. Click a row to expand it into that player's location heatmap, so you can move from table-level comparison to spatial profile without leaving the view.

- **Which shots are efficient or inefficient?**
  The **Team** and **Lineup** tabs show efficiency spatially and categorically. The court colors binned cells by FG% and uses opacity for volume, while the zone and shot-detail lists show attempts, share, FG%, and points per shot. Because PPS is derived from a coordinate-based shot-value model, high-value threes and rim attempts are evaluated correctly instead of being flattened by raw FG%.

- **How shot-making changes by context?**
  The sticky filter bar isolates shot type, shot detail, contest level, date range, assisted vs self-created, catch-and-shoot vs off-dribble, and shot-clock bucket. Every KPI, court cell, bar list, and player row recomputes from those filters, so context changes are visible immediately.

- **How individual player tendencies compare to the assumed team profile?**
  The Team tab can focus on one player and keeps the team baseline visible in the FG% card. The Players tab adds side-by-side comparison so individual shot diets line up against the full 12-player assumed team.

- **What tactical or roster-level insights can be derived from the data?**
  The app derives ranked coaching notes from zone-efficiency deltas (best bets to preserve, slices to trim, role signals, sample-size caveats) and bakes them into a copy-ready AI action-plan prompt for the current profile. The Lineup view combines any five selected players to show whether the group leans toward paint pressure, above-break threes, corner threes, midrange attempts, catch-and-shoot, or self-created shots.

## Tech Stack

- Vite + React 19 + TypeScript (strict mode)
- Tailwind CSS v4 with a custom design-system layer (light theme, Kings purple as accent)
- A small shadcn-style component library hand-rolled on top of Radix UI primitives (`src/components/ui/`)
- Custom SVG court visualization with a hue-and-opacity heatmap (no charting library)
- Static CSV loaded in the browser from `public/data/shots.csv`; manual parser in `src/lib/csv.ts`
- Vitest for the pure data layer
- No backend, no database

## Dashboard Features

The dashboard has three tabs, each answering a distinct question from the brief.

- **Team**: _What does the team (or one player) look like, spatially?_ Full shot profile for the assumed team: KPIs, half-court heatmap, zone breakdown, shot-detail mix, and a copy-ready AI action-plan prompt. Filter to a player to see their profile against the team baseline (the FG% card surfaces the delta).
- **Players**: _Which players are taking which types of shots?_ Side-by-side comparison table for all twelve players with a per-row zone-mix sparkline. Click a row to expand the player's location heatmap and generate an action-plan prompt for that player.
- **Lineup**: _What does this combination of five players look like?_ Compact lineup picker (defaults to top-5-by-attempts) plus the same shot profile components as Team. All Team filters carry over.

A single sticky filter bar drives everything: player, shot type, shot detail, contest level, date range with presets, creation (assisted / self-created), touch type (catch-and-shoot / off-dribble), and shot-clock bucket. The dropdown filters support multi-select, active filters render as removable chips, and "Reset all" restores the full dataset. Tab and filter state serialize to the URL, so any analytical slice is a shareable link.

## Assumptions

- All 12 anonymized players are treated as one team, per the brief.
- The data is shot-level only. It does not include opponents, score, possessions, minutes, positions, or actual on-court lineup combinations.
- The Lineup view is therefore a combined shot profile for five selected players, not true shared-court lineup performance. The UI says this directly.
- Position breakdowns are omitted because the dataset doesn't include player positions.
- Shot zones and shot value are derived from the provided court coordinates because the source CSV includes `x`, `y`, and `outcome` but no `shot_value`, 2PT/3PT flag, or play-by-play scoring field.

### Derived Shot Value And Three-Point Logic

The app keeps a custom shot-value function because points per shot is materially more useful than raw FG% for shot-profile decisions. Without deriving 2PT vs 3PT value, a 35% three and a 45% long two look the same by FG% even though the made three is worth more expected points.

The CSV gave me location and outcome but no points, shot value, PPS, or 2PT/3PT marker. Combining the available fields with NBA court geometry lets the dashboard add made-shot points, points per shot, zone efficiency, PPS deltas against the team baseline, and more useful preserve/trim signals.

The derivation lives in `src/lib/shotModel.ts` and uses NBA court geometry against this dataset's coordinate system:

- The offensive hoop is `(-47, 0)`, matching the supplied coordinates where the offensive half is on the negative-x side.
- Shot distance is `sqrt((x - hoopX)^2 + (y - hoopY)^2)`.
- Above-break threes check `sqrt((x - hoopX)^2 + (y - hoopY)^2) >= 23.75`, so each shot is compared to the actual 23'9" arc from the basket instead of a fixed top-of-arc bucket.
- Corner threes use the official sideline-parallel lines 3 feet from each sideline. The court is 50 feet wide, so those lines sit at `|y| = 22` feet and run from the baseline until they intersect the arc.
- The corner-line endpoint comes from the circle equation: `cornerEndX = hoopX + sqrt(23.75^2 - 22^2)`, which evaluates to about `-38.05` in this coordinate system.
- Made shots beyond the derived line count as 3 points; other made field goals count as 2.

This is deterministic and grounded in official NBA dimensions, but it is still derived data. A production pipeline should prefer official play-by-play, a 2PT/3PT flag, or reviewed shot metadata, because real scoring depends on foot placement, line width, and scorekeeper/replay decisions that aren't in the CSV.

Sources I used for the math:

- [NBA Official Rulebook, Rule No. 1: Court Dimensions](https://official.nba.com/rulebook/). The three-point area is defined by sideline-parallel lines 3 feet from the sidelines and a 23'9" arc from the middle of the basket.
- [Official 2025-26 NBA Playing Rules PDF](https://cdn.nba.com/manage/2026/01/Official-2025-26-NBA-Playing-Rules.pdf). The court diagram shows the 22-foot corner distance and 23'9" above-break arc; Rule No. 5 defines successful field goals outside the line as 3 points, on/inside as 2.

## Tradeoffs

Three tabs, each a different shape of the data, instead of one screen with different filters. Team is spatial, Players is comparative, Lineup is combined. That keeps each view sharp.

The AI action-plan prompt is copy-ready but the app doesn't call an AI API. That keeps the submission deterministic, credential-free, and easy to run while still bridging the dashboard to a coaching workflow.

Frontend-only over a backend. A server adds nothing for 8,816 clean rows that all live in memory. Client-side filtering with `useMemo` is instant and keeps the surface area small. For larger data, parsing and aggregation move behind an API or a precomputed layer; the analytics layer is plain functions of `(shots, filters)`, so that swap is a substitution, not a rewrite.

Multi-select dropdowns on player, shot type, shot detail, contest, and shot-clock. The state is a bit busier than single-select, but it lets the action-plan prompt describe realistic combined contexts ("multiple shot details under heavy contest") instead of one narrow slice.

Custom SVG court over a charting library. The maintained D3 court packages don't expose the binning + hue/opacity encoding I needed, and the unmaintained ones are abandonware risk. Writing the geometry directly was faster than fighting a generic chart to do two channels at once.

Manual CSV parsing over Papa Parse. The input is known and well-structured, so ~40 lines of code with fail-fast validation is enough. For user-uploaded or messy CSVs, Papa Parse would be safer.

Defensive bucketing for derived fields. Shot-clock and dribble buckets both include an explicit `unknown` value, and any non-finite or out-of-range input falls into it (covered by tests in `src/lib/shotModel.test.ts`). The CSV here is clean, but in a real pipeline this data comes from a third party and integrity isn't guaranteed. Allocating bad or missing values to a labeled bucket is better than silently dropping them or letting them poison an aggregate.

Local React state over a global store. There's one consumer of the data, a shallow component tree, and props that travel one or two levels at most. A store would have added vocabulary without solving a problem.

Derived shot value instead of official scoring metadata. The dictionary has no 2PT/3PT flag, so PPS comes from the coordinate-based zone model and official three-point geometry. Better than FG% alone, but a production version would validate against play-by-play.

Transparent insight thresholds instead of a model. Coaching notes use zone deltas and sample-size cutoffs you can read and audit, not a black box. Less sophisticated than an expected-shot model, easier to explain.

URL state but no account-level saved reports. The query string is fine for a shareable analytical slice. If I had more time, I'd add saved reports so a coach could preserve filters, derived insights, and the action-plan prompt as a reusable package.

## Running Locally

Prerequisites: Node 18+.

```bash
npm install
npm run dev
```

Open the local URL printed by Vite.

## Build

```bash
npm run build
```

Produces a static bundle in `dist/`. There's no server component.

## Tests

```bash
npm test
```

Vitest covers the pure data layer: CSV parsing, zone classification and shot-value derivation, filter application, and summary aggregation. Use `npm run test:watch` while iterating.

For typechecking, run `npm run typecheck` (which runs `tsc -b`). The root `tsc --noEmit` shortcut is a no-op because the root tsconfig uses `files: []`, so the project-references invocation is the one to use before pushing or in CI.

## How I'd Extend This With More Time

With more time on this codebase, the work splits into engineering and the underlying analytics. The analytics layer is already plain functions of `(shots, filters)`, so most of the engineering changes below are substitutions, not rewrites.

**Backend + API.** Move raw events into Postgres, expose `/summary`, `/breakdown`, `/players`, `/lineup`, and `/insights` endpoints, and cache the common rollups. The frontend keeps its memoized hooks as a thin client cache. The CSV ingest path (`src/lib/csv.ts` + the helpers in `shotModel.ts`) is the single seam that swaps for an API client.

**Auth + multi-user.** Add authentication with role-based scoping, so coaching staff, front office, and analytics each get different default views and different export rights.

**Saved reports.** Persist filters, the active tab, derived insights, and the action-plan prompt as a named, shareable report. Right now the URL is the only persistence, which is fine for a take-home but not for a team that revisits the same questions every week.

**Derive more from fields already in the data.** A handful of columns aren't surfaced yet but should be:

- `passer_x` / `passer_y` for pass origin. Pass distance, pass angle, and whether the passer is in the dunker spot, the corner, or above the break would let the app distinguish a kickout three from a drive-and-kick three, and an interior touch from a swing pass.
- `period` + `start_game_clock` for time-in-game context. Late-third-quarter shot diet, fourth-quarter shot quality, and end-of-period heaves are different basketball questions and should be filterable.
- Per-game and per-period rollups derived from `year` / `month` / `day` to expose streaks and rest days without a true schedule join.

**AI action-plan as a real API.** The action-plan prompt is copy-ready today. With keys and an auth layer, that becomes a server-side endpoint that calls Claude or GPT, streams a response, and persists the output on the saved report.

**Test + delivery posture.** Expand Vitest coverage to filter-combination property tests and insight-threshold regressions. Add Playwright for the three tabs and the lineup picker. Wire CI to run typecheck + tests on every PR, add a Lighthouse budget, and put error tracking (Sentry) and basic usage metrics in front of the deployed app.

**Performance once data grows.** The current client-side filtering is instant at ~8.8k rows. At 100k+ it should move to server-side aggregation with materialized views per common rollup, and the heatmap should switch to canvas instead of SVG for cell-level rendering.

### Data I Wish We Had

The dataset is shot-level only. With richer inputs, the dashboard moves from descriptive shot profiling toward decision-support:

- Player and ball tracking to replace broad contest buckets with true defender distance, closeout angle, shooter movement, and off-ball action context.
- Defender identity and matchup context, so "heavily contested" is evaluated by who contested, their size and role, and the coverage that produced the attempt.
- An expected shot value model on top of location, shot type, defender distance, shot clock, movement, pass context, and game state. That separates shot-making from shot quality and surfaces actual vs expected efficiency.
- True possession, lineup, and play-type data so the Lineup view becomes shared-court shot selection, spacing, role interaction, and "which four players best support player X."
- Opponent and defensive context: defensive rating, rim frequency allowed, 3PA rate allowed, scheme tendencies. Shot profiles should change by matchup, and right now they can't.
- Multi-season, injury, availability, rest, and fatigue data to stabilize noisy samples and explain whether profile changes are role-driven, health-driven, or opponent-driven.
- League, team, and role benchmarks for eFG%, expected points, shot quality above expectation, and zone/shot-type efficiency.
- Video or possession links so a filtered result becomes a coaching playlist (late-clock contested pull-ups, high-value catch-and-shoot examples, etc.).
