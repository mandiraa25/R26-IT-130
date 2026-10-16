# Shared embedded How to Play design

All sixteen tutorial screens use `components/HowToPlayScreen.jsx` and `styles/howToPlay.css`. The exact existing Level 01 board asset is reused unchanged. Board, inner video frame, poster, mascot, action-button positions and orange/cream colours are invariant between levels. Only the level background, navigation context, game-specific wording and configured video differ. The previous icon row, thought bubble and separate video dialog were removed.

The two action buttons are Watch Video and Skip & Play. The central video play control also starts the same embedded player and supports keyboard activation. Videos stay inside the frame; skipping unmounts playback and calls the existing game-start handler. Existing game mechanics, educational data, timers, scoring, rewards and progression were not edited.

## Adding videos

Edit `frontend/src/pages/workingMemory/data/howToPlayVideos.js`:

```js
HOW_TO_PLAY_VIDEOS.pattern.en = "https://www.youtube.com/watch?v=YOUR_VIDEO_ID";
HOW_TO_PLAY_VIDEOS.pattern.si = "/videos/pattern-sinhala.mp4";
```

Set the actual entries in the exported object. Game keys: `pattern`, `words`, `instructions`, `numbers`. `HOW_TO_PLAY_LEVEL_VIDEOS` supports optional language-specific overrides for levels 1–4. Empty entries reuse the existing game's video link. Direct video URLs use native video controls; YouTube URLs use an embedded player. No UI edits are needed. Native media failure keeps Skip & Play available. External YouTube availability and actual content/audio still require verification with the final supplied videos.

## Generated poster

`video-poster.png` was generated using the built-in image-generation tool from `LexiLand Garden How-To Play Screen.png`. The website uses the same image encoded as `video-poster.webp` (445,038 bytes), with the original PNG retained.

Generation prompt:

> Create ONLY the wide video POSTER illustration inside the orange inner frame of this How To Play reference. Crop/extract and faithfully reconstruct that video-poster scene: a bright sunny children's illustrated garden path, white picket fences on both sides, cheerful colorful flowers in foreground, green foliage and two framing tree trunks with hanging warm lanterns, distant small red-roof cottage, cyan sky. Upper center the exact colorful word 'LexiLand' on a white curved badge with a smiling yellow sun above. Leave central lower area clear garden path: REMOVE the large orange play button entirely, because a real accessible play control will be rendered separately. Output just the rectangular wide garden illustration, approximately 2.25:1 aspect ratio, no orange border, no outer board, no How To Play heading, no buttons, no bunny, no outside scenery, no other UI. Match the actual embedded poster in the reference as closely as possible, polished child-friendly illustration.

## Verification and undo

- Production build and targeted ESLint passed.
- `scripts/wm-redesign/how-to-play.mjs` passed all sixteen routes: identical measured board/frame/button bounds and colours, correct level backgrounds, two action buttons, embedded YouTube source/autoplay wiring, and Skip & Play starting every game. Also checked laptop layout, actual Sinhala rendering and video configuration overrides. Provider requests were mocked.
- `scripts/wm-redesign/tutorial-video.mjs` passed direct video configuration, Sinhala link selection, keyboard poster play, missing-media feedback and skipping after video failure.
- Save/retry and instructional audio regression script passed after adapting its tutorial entry to the new buttons.
- Captures at `.design-backups/embedded-howto-before/qa-final/` were visually inspected, including Level 01 English and Level 04 laptop/Sinhala. No claim of exact pixel identity is made for the newly generated poster.
- Previous tutorial and presentation source files remain at `.design-backups/embedded-howto-before/` for undo. No backend or educational question file was changed in this revision.
