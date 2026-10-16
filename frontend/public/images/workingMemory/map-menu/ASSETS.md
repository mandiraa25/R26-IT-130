# Working Memory map and popup artwork

## Latest clean reference revision

The newest map/menu reference pair supersedes the earlier ornate design. Eight assets were regenerated with the built-in image-generation tool and copied into this directory. Four existing thumbnail illustrations, navigation icons, star icon, leaf icon and local fonts were reused.

- `map-background.png`: standalone calmer blue-sky jungle lake, mountains, foliage at corners and sandy foreground; no UI or characters. Its WebP delivery copy is exactly 1600 x 900 (16:9), exported with centered cover sizing.
- `level-scene-1.png` through `level-scene-4.png`: matching white bunny with blue eyes, orange glasses and neckerchief holding a carrot. Morning gold, daytime green, pink sunset and purple twilight with a crescent moon. Smaller character, calmer lakeside surroundings, no labels or frames.
- `level-card-frame.png`: simple slender honey wood rounded portrait frame without leaf clusters. Transparent illustration window, cream lower panel, transparent exterior.
- `map-heading.png`: blank chestnut wood plank, honey rim and modest end foliage. Heading remains live text.
- `popup-vine-board.png`: wide cream board, honey wood rim, sparse winding green vines, corner leaf watermarks and blank wooden title plaque. Transparent exterior; no checkerboard, thumbnails, labels or controls baked into the board.
- Reused `thumb-pattern.png`, `thumb-words.png`, `thumb-instructions.png`, `thumb-numbers.png`: illustrated orange/green/pink/purple preview cards. Labels, play/lock controls and click targets remain real React elements.

Original PNGs are retained. Quality-94 WebP delivery copies preserve transparency and total 3,420,622 bytes, versus 21,815,573 bytes for PNG sources (84% reduction). The PNG background source is preserved at generated dimensions; only its web delivery copy is sized to exact 16:9.

## Integration and verification

`ImprovementLevelsWM.jsx`, `components/LevelMenu.jsx` and scoped `styles/popupMap.css` implement the composition. Existing grade, stars, completion counts, eligibility, language, music, routes and progression APIs remain connected. Menu behavior matches the home modal pattern: backdrop dismissal, Escape, focus containment/restoration and body-scroll lock. The map stays mounted behind the bounded popup.

Rollback snapshot (source and every previous asset): `.design-backups/map-menu-clean-before/`. Latest rendered screenshots: `.design-backups/map-menu-clean-before/qa-final/`.

Executed: production build, targeted component ESLint, map/popup Playwright tests at 1600 x 900 and 1366 x 768, all four level titles, all four game routes, locked-game message, live stars, English/Sinhala, keyboard navigation, close/Escape, image alpha checks and navigation-cache regression including saved stars/unlocks. Tests use mocked account APIs; no live student completion or database write was performed. Production build retains existing bundle-size and stale Browserslist warnings.

The rendered map and popup were visually inspected against the supplied references. Artwork is a generated recreation; pixel identity is not claimed. This revision does not alter question dashboards, final score screens, How to Play screens, educational data, scoring or progression rules.
