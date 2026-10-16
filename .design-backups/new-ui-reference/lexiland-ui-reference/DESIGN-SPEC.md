# LexiLand · Working Memory — UI design spec

This folder is a **visual and behaviour reference**. Recreate these screens in the real
app's own framework and components. Do not copy the prototype code as-is.

- `screenshots/`: the target look of every screen (1600×900 design).
- `playable-build/`: a working prototype. Run `python3 -m http.server 8000` inside it, then
  open http://localhost:8000. Each game's settings (questions, timers, colours) are in the
  `<script type="text/x-dc">` block at the bottom of each `games/*.dc.html` file.
- `assets/`: final images with readable names. Use these exact files and don't redraw them.

---

## 1. Layout system

- Design canvas: **1600 × 900 (16:9)**. Every screen scales to fit the window
  (`scale = min(vw/1600, vh/900)`), centred. The background image always covers the whole
  window (`object-fit: cover`), so there are no empty bars.
- Font: **Lexend** (600/700) for UI text. **Fredoka** (700) for big titles on the level map
  and menu. The Sinhala label uses Noto Sans Sinhala.
- Children's UI: big tap targets (≥ 60px), rounded shapes, soft shadows, short sentences.

### Game screen layout (all four games)
| Element | Position on the 1600×900 stage |
|---|---|
| Top nav | top 20px, left/right 28px |
| Question tracker | centred horizontally (left 550, width 500), top 124px |
| Vine board | **centred**: left 300, top 175, 1000 × 580 |
| Bunny | bottom-left: left 28, bottom 36, height 400, rotated 5° |
| Thought bubble | left 20, top 184, width 262, with two small dots towards the bunny |
| Carrot bucket | overlapping the board's bottom-right corner |

The vine board image is drawn as **one stretched background** (`background-size: 100% 100%`),
not border-image (border-image showed seams). Content sits inside with even padding
(about 30px top, 44px sides, 34px bottom) and evenly spaced rows.

## 2. Level themes

| Level | Accent | Dark | Light | Background | Bucket | Number button |
|---|---|---|---|---|---|---|
| 1 | #E07B1F | #B5560B | #FDE3C6 | bg-level1 (golden sunrise) | bucket-level1 | btn-orange |
| 2 | #5BA35A | #3A7A39 | #DDEFD3 | bg-level2 (blue sky) | bucket-level2 | btn-green |
| 3 | #E77FA6 | #B23C6C | #FBE1EB | bg-level3 (pink sunset) | bucket-level3 | btn-pink |
| 4 | #8A6BC9 | #5E3FA3 | #EAE2F8 | bg-level4 (night, moon) | bucket-level4 | btn-purple |

All games in a level share that level's background, bucket and accent colour.

## 3. Shared components

- **Top nav** (`assets/nav/`): on the left, the back button (`nav-back.png`) and the title
  plank (`nav-title-plank.png`, stretched horizontally, text "LEVEL 1 • NUMBER RECALL"). On
  the right, the star counter (`nav-star-pill.png` with the number drawn on top), the music
  toggle (`nav-music.png`; when muted, draw a red slash) and the language switch
  (`nav-lang-en.png` / `nav-lang-si.png`, with the EN and සිං labels drawn on top).
- **Question tracker** (`nav-tracker.png`, 5 wooden circles on a vine): finished steps get a
  small green tick, the current step a pulsing cream glow, and upcoming steps are dimmed.
- **Bunny** (`characters/bunny.webp`) with a white rounded thought bubble whose message
  changes per screen.
- **Buttons**: pill shape with a 5px darker bottom shadow. The primary button uses the level's
  dark colour, and Play is green #14A877.

## 4. Screens and flows

### 4.1 Level map ("Choose your level"): `01-level-map.png`
- LexiLand logo plank top-left. Home, Music and Language (globe EN/සිං) wooden buttons
  top-right.
- Four cards in the level colours, each showing that level's background with the bunny and
  bucket. Level 1 has an orange **Play** button. The others show a coloured lock and
  **Locked**.
- A level unlocks when every game of the previous level has been passed (3 or more correct).
  Tapping a locked card shakes it and shows "Finish Level N to unlock Level N+1!".
- Tapping an unlocked card opens that level's menu.

### 4.2 Level menu ("Which game would you like to play?"): `02-level-menu.png`
- Vine board with a "Level N" plank and a question strip. Shown on that level's background.
- 2×2 game cards with these fixed colours on every level:
  - Pattern: orange, star badge.
  - Picture Game: green, leaf badge.
  - Instructions: pink, ear badge.
  - Numbers: purple, "123" badge.
- Each card has a preview row, a name pill and a round play button. Tapping it starts that game
  for that level. The back button in any game returns to this menu.

### 4.3 Pattern Recognition: `03-pattern.png`
- 5 questions (one screen each). A sequence row ends in a dashed "?" slot, followed by 4
  tinted answer cards and a Check button.
- Right: the slot fills green with "Great job! You found the pattern!" and a Next button.
  Wrong: "Good try! Let's try again!" with a Try again button.
- Bubble: "Look at the pattern carefully and guess it!"

### 4.4 Following Instructions: `04-…`, `05-…`
- **Listen screen**: the board is centred, with a small bunny and animated sound waves inside
  it, plus "Listen again" and "Show question" buttons. The steps are read aloud (speech
  synthesis, en-GB, rate 0.8).
- **Question screen**: a question such as "What is the first / fourth / last instruction?",
  then **three text answers numbered 1, 2, 3**. Each number sits on the level's glossy button.
  The child taps one, then taps Check.
- Steps per level: L1 2, L2 3, L3 4, L4 5.
- Bubble on the question screen: "Choose the correct instruction!"

### 4.5 Number Recall: three screens, `06`–`08`
1. **Ready**: blank glossy buttons with no numbers, and a reminder bar reading "Tap Play. You
   will have 8 seconds to memorise the numbers." with a green PLAY button. Bubble: "Tap the
   Play button when you're ready!"
2. **Memorise**: the random digits pop onto the buttons, and a "TIME LEFT: 8s" countdown bar
   runs down. Bubble: "Remember these numbers carefully!"
3. **Keypad**: answer slots, a 0–9 keypad in two rows (glossy level-colour buttons), and Undo
   and Check buttons. Bubble: "Now, enter the numbers in the same order!"
- Digits and time: L1 3 digits / 8s, L2 4 / 7s, L3 5 / 6s, L4 6 / 5s. Digits are random each
  round, with no digit repeated next to itself.

### 4.6 Picture Memory: three screens, `09`–`11`
1. **Ready**: face-down cards (the card-back image for that level) with a reminder bar
   "Tap Play. You will have 5 seconds to memorise the pictures." and a PLAY button.
   Bubble: "Tap the Play button when you're ready!"
2. **Memorise**: the cards flip to show pictures in order, and a countdown bar runs.
   Bubble: "Memorise the order of the pictures!"
3. **Drag and drop**: numbered empty slots, with the same pictures shuffled underneath. The
   child drags them into order (tap-to-place also works), then uses Start over and Check.
   Bubble: "Drag the pictures into the correct order!"
- Cards and time: L1 3 / 5s, L2 4 / 6s, L3 5 / 7s, L4 6 / 8s. Card images are in
  `assets/cards/pic-l{N}-*.png`.

### 4.7 Results dashboard (after the 5th question of any game): `12-results.png`
- A trophy with "CONGRATULATIONS!" (or "NICE TRY!" below 3 correct) and "You finished
  {Game} · Level N".
- A score banner in the level colour reading "YOUR SCORE 3 / 5", with 5 stars that pop in.
- Four tiles: Correct (green), Incorrect (pink), Game Stars and Total Stars (yellow).
- An unlock pill ("Unlocked: Following Instructions!"), then Play again and **Next game**
  buttons. Next game is disabled below 3 correct.
- Scoring: only the **first** answer per question counts. Each correct answer earns 5 stars,
  and the total accumulates across games.
- Confetti plays when the score is 3 or more. The bunny's message depends on the score.

## 5. Behaviour rules
- Feedback is always gentle and encouraging. There is no red "wrong" or failure sound.
- Respect `prefers-reduced-motion`.
- Every icon-only button needs an aria-label.
