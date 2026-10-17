# Working Memory structure

Current workspace: 2026-10-17. The feature now lives in `frontend/src/features/workingMemory/`. Historical inventories are in `docs/workingMemory/history/`.

- Screening: `identification/ScreeningPage.jsx`, intro/question components and grade banks.
- Improvement: `improvement/ImprovementPage.jsx`, `LevelSelection.jsx`, four games and four question folders.
- Shared presentation: `shared/` for layout, tutorial, feedback, activity/level results and screening results.
- Configuration: `config/`; answer checking, scoring, saved-progress helpers and audio: `logic/`.
- APIs: feature `services/`, using the existing common HTTP client.
- Backend: `backend/src/modules/workingMemory/{routes,controllers,models}`; unchanged.
- Images: `frontend/public/images/workingMemory/{identification,pattern,pictures,instructions,numbers,shared}`. Artwork that is identical for every grade is stored once; only Grade 3 Picture Memory cards have grade folders. Common visuals live under shared.

Routes, API contracts and the stored `words` game key remain unchanged. Screening and improvement retain separate answer-checking functions and controllers. All question values and answers are preserved.

See the [feature README](../frontend/src/features/workingMemory/README.md), [complete tree](WORKING_MEMORY_FINAL_TREE.md), [source moves](WORKING_MEMORY_SOURCE_MOVES.json), [asset moves](WORKING_MEMORY_ASSET_MOVES.csv), [current asset inventory](WORKING_MEMORY_ASSETS_CURRENT.csv), [usage evidence](WORKING_MEMORY_ASSET_USAGE.csv), [retained assets](workingMemory/ASSETS_FOR_REVIEW.md), [original artwork](workingMemory/ORIGINAL_ARTWORK.md), and [migration report](WORKING_MEMORY_FEATURE_MIGRATION.md).
