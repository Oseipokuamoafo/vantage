# Vantage architecture

Vantage is a static single-page app (Vite + React + TypeScript). There is no server: all state
lives in `localStorage` behind a thin repository layer in `src/data/`, so a real backend can be
added later without touching feature code.

## Folder structure

```
src/
  main.tsx, App.tsx          app entry, HashRouter, lazy-loaded routes
  index.css                  Tailwind layers + design tokens
  components/
    ui/                      shared design system (Button, Card, fields, Badge, ScoreMeter, …)
    layout/                  AppShell, navigation, PrototypeBanner, onboarding Stepper
  data/
    types.ts                 domain model (single source of truth for types)
    storage.ts               namespaced localStorage KV + change subscription
    useStored.ts             React hook (useSyncExternalStore) over storage
    crypto.ts                salted SHA-256 password hashing (Web Crypto)
    auth.ts profiles.ts workspace.ts content.ts plans.ts history.ts   repositories
    seed/*.json              seed content (every record carries source + dataQuality)
  features/
    profile/      F1  sign-up, login, reset, profile form            (R1)
    goal/         F2  goal type picker                               (R2)
    constraints/  F3  weekly hours / budget / semesters              (R3, R8)
    catalog/      F4  searchable opportunity catalog                 (R4, R12)
    scoring/      F5  pure scoring engine + tests                    (R3, R5)
    compare/      F6  side-by-side comparison                        (R5, R6, R9)
    outcomes/     F7  historical outcomes with min sample size       (R7, R12)
    planner/      F8  semester planner (dnd-kit, keyboard support)   (R8)
    transparency/ F9  rating explanation + data-quality labels       (R9)
    saved/        F10 saved plans, change detection                  (R10)
    shell/        F11 landing page, personas, onboarding stepper     (R11)
    admin/        F12 content manager (role-gated)                   (R12)
e2e/                         Playwright smoke test
```

Each feature folder has an `index.ts` whose header comment names the requirement IDs it covers.

## Data model

| Entity          | Key fields                                                                                                                                                                                                | Storage key                     |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| `User`          | id, email, salt, passwordHash, role (`student`/`admin`)                                                                                                                                                   | `vantage:users`                 |
| `Session`       | userId                                                                                                                                                                                                    | `vantage:session`               |
| `Profile`       | userId, year, major, institution, firstGen?, transfer?, working?, goalTypeId?, constraints?, onboardingComplete                                                                                           | `vantage:profile:<userId>`      |
| `Constraints`   | weeklyHours, budgetUSD, semestersRemaining                                                                                                                                                                | (inside Profile)                |
| `Workspace`     | compareIds[], plan (termId → opportunityIds[])                                                                                                                                                            | `vantage:workspace:<userId>`    |
| `GoalType`      | id, name, description, examples[], status (`active`/`coming_soon`), weights {time, skill, signaling}, targetSkills[], skillSaturation, timeHorizonHours, source, dataQuality                              | `vantage:content:goalTypes`     |
| `Opportunity`   | id, type, title, description, timeCommitmentHoursPerWeek, durationWeeks, costUSD, skillsBuilt[], signalingNotes, timingWindows[], goalRelevance{goalTypeId → {signaling, rationale}}, source, dataQuality | `vantage:content:opportunities` |
| `OutcomeRecord` | id, goalTypeId, opportunityId, metric, outcomeRate, sampleSize, cohort, source, dataQuality                                                                                                               | `vantage:content:outcomes`      |
| `Settings`      | minOutcomeSampleSize (default 10), demoMode                                                                                                                                                               | `vantage:content:settings`      |
| `HistoryEntry`  | id, at, actorEmail, entity, entityId, action, summary                                                                                                                                                     | `vantage:content:history`       |
| `SavedPlan`     | id, ownerId, name, createdAt, updatedAt, goalTypeId, opportunityIds[], constraints snapshot, timeline                                                                                                     | `vantage:plans:<userId>`        |

`dataQuality` is one of `sourced`, `limited`, `team_estimate`. All seed content is
`team_estimate` or `limited` and its `source` says it is prototype sample data.

Content keys fall back to the JSON seed when nothing is stored. Admin edits write the full
collection to storage, and "Reset content to seed" removes the keys.

## Scoring model (F5)

`src/features/scoring/engine.ts` is pure: it takes an opportunity, a goal type and optional
constraints, and returns a structured result. It never reads storage.

For opportunity _o_ and goal type _g_:

- **Time commitment T** (higher = lighter total load):
  `T = 10 × (1 − min(H, Hcap) / Hcap)` where `H = hoursPerWeek × durationWeeks` and `Hcap = g.timeHorizonHours`.
- **Skill development S**:
  `S = 10 × min(1, |o.skillsBuilt ∩ g.targetSkills| / g.skillSaturation)`.
- **Signaling value V**: `V = o.goalRelevance[g].signaling` (0–10 from content data; 0 if missing, with a driver saying so).
- **Weighted summary**: `W = (wT·T + wS·S + wV·V) / (wT + wS + wV)` using the goal type's editable weights.
- **Primary driver**: the attribute with the largest weighted contribution `wX·X`.

**Fit adjustments** come from the student's constraints. They are returned and displayed
_separately_ from W and never folded in silently:

| Constraint   | Status                                                        | Delta                                                                   |
| ------------ | ------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Weekly hours | `exceeds` if o.hours > c.weeklyHours, `tight` if > 75 % of it | `−min(3, 3 × (o.hours − c.weeklyHours) / c.weeklyHours)` when exceeding |
| Budget       | `exceeds` if cost > budget, `tight` if > 75 %                 | `−min(3, 3 × (cost − budget) / max(budget, 50))` when exceeding         |
| Timeline     | `exceeds` if durationWeeks > semestersRemaining × 16          | `−2` when exceeding                                                     |

`fitAdjusted = clamp(W + Σdelta, 0, 10)` is shown next to W, with each adjustment listed.
Values are rounded to one decimal only when output.

### Worked example: Marcus × AWS Solutions Architect Associate

Cloud-internship weights: time 0.25, skill 0.35, signaling 0.40; Hcap 480; saturation 4.
The opportunity is 6 h/week × 10 weeks, $150, building aws, cloud fundamentals, computer networking,
security and system design, with signaling 7.

- T = 10 × (1 − 60/480) = 8.75 → **8.8**
- S = 10 × min(1, 5/4) = **10.0**
- V = **7.0**
- W = 0.25·8.75 + 0.35·10 + 0.40·7 = **8.5** (primary driver: skill development, 3.5)
- Fit for Marcus (8 h/week, $100, 5 semesters): hours fit (6 ≤ 8, 75 %), budget exceeds by $50 → −1.5,
  timeline fits. Fit-adjusted **7.0**.

## Product guardrails in code

- `src/features/transparency/forbiddenPhrases.test.ts` scans every source and seed file for
  prescriptive phrases. It runs in `npm test` and before `npm run build`.
- The comparison table renders columns in the order the student added them. It never sorts by score
  and never highlights a column.
- Every rating is rendered through `ScoreWithExplanation` (F9). That component requires the
  explanation and the data-quality label, so a rating can't be shown without them.
- Outcome records below `settings.minOutcomeSampleSize` render a "No data yet" state.

## Swap path to a real backend

1. Keep the function signatures in `src/data/*.ts` (repositories). Feature code only imports these.
2. Make the repositories async (they already return plain data). Replace `useStored` with a
   query hook (e.g. TanStack Query) that keeps the same return shapes.
3. Replace `auth.ts` with Supabase Auth / Firebase Auth. Remove `crypto.ts` and the local password store.
4. Move `content.ts` collections to tables (`opportunities`, `goal_types`, `outcomes`, `history`)
   with row-level security: read for everyone, write for the `admin` role. Seed with `src/data/seed/*.json`.
5. Move `plans.ts` / `profiles.ts` / `workspace.ts` to per-user tables keyed by auth uid.
6. The scoring engine stays client-side and pure. It can also run in an edge function unchanged.
