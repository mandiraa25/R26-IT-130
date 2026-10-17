# Working Memory feature migration

Date: 2026-10-17. Branch at the start: `feature/mandira`.

## Plan and dependency map recorded before code moves

The current workspace, not Git HEAD, is the baseline. A 599-file snapshot, hashes, branch and Git status are preserved under `.cache/wm-feature-migration/baseline/`. The backend remains unchanged.

1. Record loaded questions and existing checks.
2. Move screening, improvement, shared UI, configuration, logic and services together under `frontend/src/features/workingMemory` and update all consumers.
3. Split mixed improvement banks by game without changing any question value or metadata. Keep the `words` storage key.
4. Move assets into the requested identification/pattern/pictures/instructions/numbers/shared roots. Keep uncertain assets and source PNGs. Keep pattern emoji values as code/data and preserve their existing atlas presentation.
5. Consolidate level-specific result JSX into shared ActivityResults and LevelCompletion, with the exact existing messages and differences represented by configuration. Keep screening scoring separate.
6. Replace the five previously copied external-module illustrations with original WM artwork, as explicitly approved by the user. Preserve their roles; these are the authorized visual changes.
7. Verify imports, question snapshots, asset resolution, unit tests, lint and build. Use only API-mocked/in-memory browser/backend checks.

```text
App routes -> ScreeningPage -> identification data + screening UI/results
           -> LevelSelection -> shared game menu + improvement access API
           -> ImprovementPage -> game data selector -> four game components
                              -> shared layout/tutorial/feedback/results
Shared UI -> config + WM-owned image paths + existing scoped styles
Controllers -> feature logic + feature services -> existing shared API client
Reports/tests/scripts -> relocated feature services, logic and data
Backend routes/controllers/models -> unchanged
```

Existing model fields, URLs, stored category keys, answers, timings, stars, scoring and progression rules must remain unchanged. User-facing text, including existing translation differences, is preserved rather than silently corrected.
