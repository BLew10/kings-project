# Dev Thought Process

This document explains the product and engineering decisions behind the Kings shot profile dashboard. It is written as a decision log rather than a code tour: what I prioritized, what I intentionally left out, and how I would evolve the project with more time or a larger dataset.

## Product Framing

The prompt is intentionally open-ended, so the first decision was scope. I did not want to build a dashboard with many shallow panels. I wanted the app to answer a smaller set of basketball questions clearly:

- What does the assumed team's shot diet look like?
- Which players drive that shot diet?
- Which shots appear valuable or inefficient?
- How do those answers change by context?
- What can a coach or front office user do with the answer?

The dataset is shot-level only. It does not include possessions, lineup minutes, score, opponent, play calls, defender identity, or player positions. That constraint shaped the whole product. I treated the app as a shot-profile and decision-support surface, not a full player-value or lineup-performance model.

## Scope Choices

I chose three views because each one answers a different workflow:

- **Team:** the baseline spatial profile for the assumed roster.
- **Players:** side-by-side comparison across all 12 players.
- **Lineup:** a five-player combined shot diet, with a clear caveat that it is not true shared-court performance.

That structure keeps the product focused. A larger set of views could have looked impressive at first glance, but it would have diluted the quality of the interaction, filtering, and explanation.

I also added an AI action-plan prompt instead of calling an AI API directly. That was intentional. The submission stays deterministic, runs without credentials, and still gives a coaching or analytics user a practical bridge from dashboard findings to an action plan.

## Metric Reasoning

Raw FG% is easy to compute, but it is incomplete basketball analysis. A 35% three is often more valuable than a 45% long two. To make the dashboard more useful, the app derives shot value from the coordinate-based zone model and surfaces **points per shot** alongside FG%.

That is still a pragmatic approximation because the CSV does not include an official 2PT/3PT flag. I would validate point value against play-by-play or official shot metadata in production. For this project, deriving shot value from zones is a strong enough upgrade because it makes the app reason about efficiency closer to how basketball staff actually evaluate shots.

## Insight Reasoning

Exploratory dashboards can force users to do too much interpretation. To make the product more decision-oriented, I added a **Shortlist Insights** panel. The panel ranks:

- best bets to preserve
- inefficient slices to trim
- role signals from creation and catch-and-shoot rates
- sample-size caveats

The insight engine is intentionally transparent. It uses volume thresholds, points-per-shot deltas, and baseline comparisons rather than a black-box model. That makes the recommendations easier to trust, explain, and revise.

I kept the original zone recommendation notes as supporting detail, but the shortlist panel is the primary "what should I pay attention to?" surface.

## Data Modeling

The raw CSV is converted into typed `Shot` objects in `src/lib/csv.ts`. During parsing, the app derives fields that are used repeatedly across the interface:

- ISO date
- shot distance
- shot zone
- shot value
- shot-clock bucket
- dribble bucket

I prefer deriving these once at ingestion time instead of recalculating them inside components. It keeps rendering code simpler and gives the rest of the app a stable domain model.

The domain-specific rules live in `src/lib/shotModel.ts`. That boundary matters because shot-zone thresholds, point-value assumptions, and formatting are basketball concepts, not UI concerns.

## State Management

I kept state local to `App.tsx` because this is a single-page dashboard with one dataset. The app tracks:

- loaded shots
- active tab
- filters
- lineup selection
- loading and error state

Everything else is derived with memoized selectors. That avoids storing duplicate state, which is where dashboards often become hard to reason about.

I added URL-shareable state for filters and the active tab because it has high product value with low architectural cost. A reviewer or coach can filter to a specific player, shot type, or context and share that exact view. If this became a multi-user product, the natural next step would be saved reports.

## Architecture Reasoning

The app is organized around four boundaries:

- **Ingestion:** `src/lib/csv.ts`
- **Domain modeling:** `src/lib/shotModel.ts`
- **Aggregation and insights:** `src/lib/stats.ts`
- **Presentation:** `src/App.tsx` and `src/components/*`

This keeps non-React logic out of JSX and makes the analytics functions easier to test or move server-side later. The current folder structure is intentionally shallow because the product is focused. I would not introduce feature folders, a global store, or backend services until the app had multiple routes, multiple datasets, or many independent panels coordinating state.

## UI Reasoning

The dashboard is designed as a work tool, not a landing page. I prioritized:

- dense but readable information
- persistent filters
- sortable comparison
- direct lineup selection
- clear caveats where the data cannot support stronger claims

The court visualization is custom SVG because the half-court geometry and heatmap encoding are domain-specific. A generic charting library would help with bar charts, but it would not simplify the most important visualization.

The player table includes a zone sparkline because comparing shot diet should not require opening every player one by one. The expanded row exists for deeper inspection when a specific player becomes interesting.

## Error and Edge-Case Reasoning

The app has basic error handling because the main failure mode is simple: the static CSV cannot be loaded. In that case, the UI renders a retryable error state instead of failing silently.

Empty filters are handled as valid states. Metrics go to zero, charts show no-data messages, and insight text avoids overstating conclusions. Small samples are explicitly labeled because noisy filtered slices can be misleading.

The Lineup view caps selection at five players and repeatedly labels the result as combined shot diet, not actual lineup performance. That caveat is important because the dataset does not include shared-court possessions or minutes.

## Tradeoffs

**Frontend-only app:** This is appropriate for 8,816 clean rows. It is fast to run, easy to review, and avoids unnecessary infrastructure. With much larger data, I would move aggregation behind an API.

**Manual CSV parser:** Acceptable for a known clean input. If users could upload arbitrary CSVs, I would use Papa Parse or a similar hardened parser.

**Derived shot value:** Better than FG% alone, but still an approximation. In production, I would use official shot value from source data.

**Heuristic zones:** Practical for the assignment, but I would validate thresholds against official coordinate semantics before using this for real basketball decisions.

**No global store:** Local React state is enough here. A store would only be useful if the app grew into a larger multi-page product.

**Prompt generation instead of AI integration:** Keeps the app deterministic and credential-free while still supporting a realistic AI-assisted workflow.

**URL state instead of saved reports:** Shareable links are the lightweight version of report persistence. If I had more time, saved reports would let users preserve filters, notes, shortlist insights, and action-plan prompts as reusable analysis packages.

## What I Would Add Next

The most valuable next improvement would be saved reports. A user should be able to preserve a filtered view with the generated insights, notes, and action-plan prompt, then come back to it later or share it with another stakeholder.

After that, I would add tests around the pure logic:

- CSV parsing
- shot-zone classification
- shot-value derivation
- filter combinations
- summary and breakdown aggregation
- insight thresholds

With richer basketball data, I would move from descriptive shot profiling toward expected shot quality:

- official 2PT/3PT value
- defender distance and contest quality
- pass quality and movement context
- score, clock, and opponent context
- true lineup possession data
- player role or position metadata
- league and role benchmarks

At larger scale, I would move raw events into a database or columnar store, expose API-backed filtered aggregations, cache common rollups, and keep the current selector/component boundaries so the frontend does not need to be rewritten.

## Final Intent

The goal of the project is to show good judgment under an open-ended prompt. I wanted the final app to feel like a real basketball operations tool: scoped, fast, explainable, honest about data limits, and useful enough that a coach or analyst could take the next step from it.
