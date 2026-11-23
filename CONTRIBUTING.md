# Contributing to Vantage

## Feature-folder ownership

Code is organized by feature in `src/features/<feature>/`. Each folder can be worked on independently.
Fill in names when the team assigns owners:

| Owner      | Features                                       | Folders                                                          |
| ---------- | ---------------------------------------------- | ---------------------------------------------------------------- |
| Teammate A | F1 Profile, F2 Goal, F3 Constraints, F11 Shell | `profile/`, `goal/`, `constraints/`, `shell/`, `src/components/` |
| Teammate B | F4 Catalog, F5 Scoring, F9 Transparency        | `catalog/`, `scoring/`, `transparency/`                          |
| Teammate C | F6 Compare, F7 Outcomes, F10 Saved             | `compare/`, `outcomes/`, `saved/`                                |
| Teammate D | F8 Planner, F12 Admin, data layer              | `planner/`, `admin/`, `src/data/`                                |

Shared code:

- `src/components/ui`: design system. Discuss changes in the PR.
- `src/data`: repositories and types. Changing `types.ts` affects everyone, so flag it in the PR title.

Features import each other only through their `index.ts`.

## Branches and pull requests

- Branch from `main`: `feat/F6-mobile-columns`, `fix/F8-summer-hours`, `docs/readme-deploy`, `content/cloud-track-update`.
- Commit messages: `feat(F6): side-by-side comparison view`, `fix(F5): clamp fit adjustments`, `content: add GCP project entries`.
- Open a PR into `main` and fill in the template. CI runs lint, typecheck, unit tests, a build and the Playwright smoke test.
- At least one teammate reviews before merging. Squash-merge is preferred.

## Product rules every PR must follow

1. **Trade-offs only.** No "you should", "best", "recommend", "winner", "top pick" and similar, anywhere in `src/`
   or seed data. `src/features/transparency/forbiddenPhrases.test.ts` enforces this, and it runs before every build.
2. **Every rating is explained.** Render ratings only through `ScoreWithExplanation` / `SummaryWithExplanation`.
3. **No ranking.** Don't sort comparisons or the catalog by score, and don't highlight a column.
4. **Honest data.** Every content record needs a `source` and a `dataQuality`. Outcomes below the minimum sample
   size are never shown.
5. **Accessible.** Works at 360px, keyboard only, with visible focus and labelled controls.

## Adding a new goal track (no code changes)

### Option A: admin tools (in the running app)

1. Log in as the demo admin (`admin@vantage.demo` / `vantage-admin`) and open **Admin**.
2. **Goal types & weightings** → "+ New goal type". Set the id, name, examples, weightings, target skills, source and
   data quality. Use status **Coming soon** while content is incomplete.
3. **Opportunities**: add entries, or edit existing ones and give each a signaling rating for the new goal.
   Only opportunities with a rating for the goal appear when that goal is selected.
4. **Outcome data**: download the CSV template, fill it in and import it. Validation errors are listed by line.
5. When ready, set the goal status to **Active**.

Admin edits live in that browser's localStorage. To share them with the team, copy them into the seed files (Option B).

### Option B: seed JSON files (shared via git)

1. Add a goal object to `src/data/seed/goalTypes.json` (same shape as `cloud-internship`).
2. Add `goalRelevance["<new-goal-id>"] = { "signaling": 0-10, "rationale": "…" }` to relevant entries in
   `src/data/seed/opportunities.json`, or add new entries.
3. Add outcome records to `src/data/seed/outcomes.json`.
4. Run `npm test`. The forbidden-phrase test also scans seed data.

Browsers that already have saved admin edits keep them. Use **Admin → Settings → Reset content to seed** to pick up
the new seed files.

## Local commands

```bash
npm install
npm run dev          # http://localhost:5173
npm test             # unit + component tests
npm run test:e2e     # Playwright (first run: npx playwright install chromium)
npm run lint         # ESLint + Prettier check
npm run format       # apply Prettier
```
