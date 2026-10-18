# Learning Reports journal

Only the report navigation screens use this design:

- `/reports`: `ReportsDashboard.jsx`, the four-module list.
- `/reports/:componentId`: `ComponentReportSelect.jsx`, assessment/practice selection.

`components/ReportShell.jsx` owns the wooden Home control, student badge, journal
frame, accessible module bookmarks and shared links. `reportJournal.css` scopes
all journal styles to these screens. `reportModules.js` is the single module
order, colour, mascot, alias and destination map. `hooks/useReportProfile.js`
shows the cached profile immediately and refreshes it without hiding the page.

The six detailed Working Memory, Phonological Awareness and Speech reports keep
their original dashboards, API requests and calculations. Reading report links
go to `/reports/rp/identification` and `/reports/rp/improvement`. Open book still
opens `/reading-processing`.

## Artwork

Generated PNGs, exact prompts and provenance are documented in
[`public/images/reports/journal/README.md`](../../../../public/images/reports/journal/README.md).
Existing `/images/reports/jungle_waterfall_bg.jpg` and `mascot_bunny.png`,
`mascot_zebra.png`, `mascot_parrot.png`, `mascot_leo.png` match the references and
are reused. Icons and labels are live React/SVG content over the blank wooden
disc; they are not baked into images.

The layout keeps the reference proportions on landscape screens and uses
readable stacked rows with normal document scrolling on narrow screens.
