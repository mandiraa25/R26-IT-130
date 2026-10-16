# Working Memory level map and popup assets

Generated with the built-in image-generation tool for the user's latest map and transparent game-menu references. Original high-resolution PNGs are retained here. The website uses matching WebP copies, encoded at quality 94 with original dimensions and alpha preserved: total image transfer size reduced from 22,337,195 to 3,747,906 bytes (83%).

## Final asset set and generation prompts

Each numbered item was generated separately. These are the production prompt specifications; illustrations contain no interface labels except the decorative 1, 2, 3 number preview. Real labels/buttons remain in React.

1. `map-background.png`: Reference-guided background extraction. Keep the supplied level-map reference's polished jungle illustration, cyan sky, framing rainforest trunks/canopy, turquoise river, rocks, distant mountains, waterfall, bottom golden path and red hibiscus corners. Remove every heading, board, button, star, panel, card and bunny. Reconstruct continuous scenery. Wide 16:9. No text or interface.
2. `level-scene-1.png`: Only the sunrise level-card illustration, portrait 4:5. Match the reference's white bunny with huge blue eyes, orange spectacles and bandana, seated holding one carrot. Entire bunny visible. Golden sunrise, yellow sun over mountains, green jungle, path and fence. No frame, labels or controls.
3. `level-scene-2.png`: Same bunny and portrait composition. Bright blue sky, white clouds, lush green jungle, waterfall and turquoise stream. No frame, labels or controls.
4. `level-scene-3.png`: Same bunny and portrait composition. Pink-orange evening sky, setting yellow sun, purple mountains, golden river and palms. No frame, labels or controls.
5. `level-scene-4.png`: Same bunny and portrait composition. Purple starry twilight, luminous full moon, deep blue-green jungle, turquoise stream and golden fireflies. No frame, labels or controls.
6. `level-card-frame.png`: Isolated portrait 3:5 golden-orange rounded wood frame with layered highlights, clean dark outlines, glossy green leaf clusters at upper corners. Upper 75% is a genuinely transparent illustration window. Bottom 25% is blank opaque pale cream panel for live progress and Play. Transparent exterior. No text, buttons or characters.
7. `map-heading.png`: Isolated wide 9:1 rounded wooden heading banner. Golden-orange beveled edge, dark chestnut wood face, green vines/leaves confined to ends and corners. Blank center for live white text. Transparent exterior; no labels.
8. `popup-vine-board.png`: Isolated landscape 3:2 thick rounded orange-gold wooden frame, cream parchment interior, glossy green vines/leaves around edges, broad blank light-wood nameplate at upper center. Remove all four cards, their buttons/icons, text and inner heading. Interior entirely blank. No flowers, checkerboard or extra objects. Transparent outside irregular silhouette. A background-extraction pass preserved the cream interior/frame while clearing exterior pixels. Transparency was checked against actual alpha in the browser.
9. `thumb-pattern.png`: One isolated landscape 2:1 rounded glossy orange/yellow thumbnail frame with dark lower lip and lighter cream interior. Upper 65% contains four ivory tiles: carrot, pink flower, carrot, pink flower. Bottom 30% blank for live title/play controls. Small clover-like corner accents. No text, buttons, background or checkerboard.
10. `thumb-words.png`: Same thumbnail family, bright lime/green. Upper preview: orange carrot card, green leaf card, pink flower card, purple bunny-face card. Lower area blank. Transparent exterior; no labels or controls.
11. `thumb-instructions.png`: Same thumbnail family, hot pink. Upper preview: orange speaker with waves, pointing-up hand, pink flower, with small orange right arrows between ivory tiles. Lower area blank. Transparent exterior; no labels or controls.
12. `thumb-numbers.png`: Same thumbnail family, violet/lavender. Upper preview: blue medallion with white 1, orange with white 2, green with white 3. Lower area blank. Transparent exterior; no labels or controls.

Map generation used `Jungle Adventure Level Select (1).png` as the character/environment reference. Menu generation used the existing closely related `Level 1 Kids’ Game Selection Board.png` alongside the user's attached menu composition as the visual direction. No flattened full-screen interface is used in the website.

## Integration and QA

- `ImprovementLevelsWM.jsx`: real grade, stars, completion counts, eligibility, locked levels, language, music, routing and progress loading; revised map composition.
- `components/LevelMenu.jsx`: bounded modal over the still-mounted map, four native game-selection buttons with illustrated thumbnails, real labels, lock states, close, backdrop dismissal, Escape and keyboard focus containment.
- `styles/popupMap.css`: styles scoped to the map/popup, including laptop scaling and Sinhala sizing.
- Shared existing navigation, star artwork, local fonts and music are reused. Game questions, scores, save APIs and unlocking rules were not changed in this revision.
- Previous source versions: `.design-backups/popup-map-before/`.
- Visual captures: `.design-backups/popup-map-before/qa-final/`.
- Executed: production build, targeted ESLint, popup/map browser tests at 1600×900 and 1366×768, English/Sinhala, all four popup titles and game routes, lock handling, close/Escape/keyboard focus, return navigation, native transparency checks, navigation-cache regression, and save/retry/audio-sequencing regression. Browser account APIs were mocked; no live student attempt was submitted.

The rendered website was visually inspected and refined against the reference composition. Generated artwork closely follows the reference style; exact pixel identity is not claimed.
