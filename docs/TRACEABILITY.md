# Requirements traceability

| Req | Requirement                                          | Feature(s)  | Where in code                                                                | How it is verified                                                                         |
| --- | ---------------------------------------------------- | ----------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| R1  | Create profile                                       | F1          | `src/features/profile/`                                                      | Profile validation; e2e onboarding (Marcus persona)                                        |
| R2  | Define target outcome                                | F2          | `src/features/goal/`, `src/data/seed/goalTypes.json`                         | Goal page reads goal types from data; e2e picks goal                                       |
| R3  | Enter constraints                                    | F3, F5      | `src/features/constraints/`, `src/features/scoring/engine.ts` (`computeFit`) | `engine.test.ts` fit cases; e2e sets constraints                                           |
| R4  | Opportunity catalog                                  | F4          | `src/features/catalog/`, `src/data/seed/opportunities.json`                  | `filter.test.ts`                                                                           |
| R5  | Evaluate on time, skill, signaling                   | F5, F6      | `src/features/scoring/`, `src/features/compare/`                             | `engine.test.ts` (Marcus, Priya, Devon)                                                    |
| R6  | Side-by-side comparison                              | F6          | `src/features/compare/ComparePage.tsx`                                       | e2e: 3 columns, 12 explanations                                                            |
| R7  | Historical outcomes                                  | F7          | `src/features/outcomes/`                                                     | `outcomes.test.ts` (minimum sample size)                                                   |
| R8  | Sequence across semesters                            | F3, F8      | `src/features/planner/`                                                      | `planner.test.ts`; `e2e/keyboard.spec.ts`                                                  |
| R9  | Explain ratings, label data quality, don't prescribe | F6, F9      | `src/features/transparency/`                                                 | `ScoreWithExplanation.test.tsx`; `forbiddenPhrases.test.ts` (also runs before every build) |
| R10 | Save and revisit                                     | F10         | `src/features/saved/`, `src/data/plans.ts`                                   | `saved.test.ts` (survives logout/login and profile edits); e2e reload                      |
| R11 | Free, any device                                     | F11         | `src/components/`, `src/features/shell/`, `src/App.tsx` (code splitting)     | e2e at 360px (no horizontal scroll); keyboard e2e; ~66 KB gzipped initial JS               |
| R12 | Team can update content                              | F4, F7, F12 | `src/features/admin/`, `src/data/content.ts`, `src/data/history.ts`          | `admin.test.ts` (CSV validation, weightings change scoring, history log)                   |

Each `src/features/<feature>/index.ts` starts with a comment naming the requirement IDs it satisfies.
Keep this table in sync when coverage changes (the PR template has a checkbox for it).
