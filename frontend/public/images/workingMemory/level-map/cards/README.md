# Working Memory level-map cards

Generated with the built-in imagegen tool from the supplied four-card reference.
`generation-prompts.json` records the exact prompts and original output names.

| PNG | Scene and control colour |
| --- | --- |
| `level-1.png` | Golden morning, orange |
| `level-2.png` | Blue daytime sky and stream, green |
| `level-3.png` | Pink sunset, magenta |
| `level-4.png` | Starry night and crescent moon, purple |

Each PNG is 640 × 960 with alpha outside the card silhouette. The frame, bunny,
scenery, blank title pill, progress capsule and blank Play button form one asset.
The other three cards were derived from Level 1 to retain its bunny and layout.
PNG resizing preserves transparency; the generated originals remain unchanged.

`LevelMapCard.jsx` overlays the translated level name, saved completion count,
gold star and Play/Locked label. These values are never baked into the PNGs.
`config/levelMapCards.js` lists the active artwork and `styles/levelMapCards.css`
owns its placement. The page controller retains all access and progression rules.

These four images replace the old separate `level-scene-*.webp` artwork and
`level-card-frame.webp`. The main map background and game-selection popup remain
in `shared/backgrounds/level-map/` and `shared/boards/level-map/`.
