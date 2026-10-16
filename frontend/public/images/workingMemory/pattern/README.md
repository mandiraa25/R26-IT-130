# Pattern Recognition reference redesign

This revision applies only to Pattern Recognition in Levels 1–4. It preserves the shared top navigation, the already-approved How to Play layout, existing level backgrounds, question pools and values, answer selection/validation, sound handlers, first-answer scoring, five-star rewards, APIs and progression rules.

## Presentation

- `components/PatternPresentation.jsx` and `styles/patternReference.css` implement the question, inline feedback, passing-results and retry-results layouts.
- The new brown wooden vine board is used only on final score/retry screens across all four levels. Question dashboards retain their original board, size, position, bunny, tracker, bucket and option styling. No separate feedback board or page is rendered. The question and options stay mounted; the chosen option remains highlighted and locked after answering.
- Compact correct/incorrect notifications do not show the correct answer. Next is available after either response. Existing winning/sad sounds still come from the original controller.
- Passing results follow the happy reference: trophy, Great Job heading, green score banner, five performance stars, Correct/Incorrect/Stars Earned tiles and Play again/Next game actions.
- Retry results use the same board with the sad version of the same bunny identity, pink score banner, the requested “No Worries! Let's Try Again!” wording and a clear three-out-of-five explanation. Next game remains disabled below three correct, even though the visual reference depicts an enabled green button.
- Save failure still provides Retry saving. Both replay and navigation call the existing handlers. No backend or educational data file was edited in this revision.
- Existing question randomisation and shuffled value-based answer matching remain. All existing pools contain exactly five questions, so retries shuffle their order/options rather than inventing additional questions.
- The repository has four games per level; the pasted request's mention of five games was not used to invent an additional game or change level completion rules.

## Generated assets and prompts

The built-in image-generation tool produced five independent assets. Original transparent PNGs are retained here; the website uses WebP delivery copies with original dimensions and transparency. Total asset size was reduced from 6,906,862 to 1,254,368 bytes. Result art preloads while questions are played.

- `vine-board.png` / `.webp`: Reference-guided extraction/recreation of only the empty cream parchment board with its slightly organic honey-brown rounded wood frame, visible wood grain/bevel and pointed green leaf clusters at the same corners. Approximate 3:2 landscape. Transparent exterior. Remove all headings, banners, numbers, icons, controls, characters, bucket and scenery. No flowers or elaborate wrapping vines. Keep the board inside opaque and completely blank.
- `bunny-happy.png` / `.webp`: Faithful variant of the existing LexiLand mascot, preserving white fur, large blue eyes, orange round glasses, orange neckerchief with carrot emblem and pink foot pads. Joyful open-mouth smile, both arms raised outward, upright ears. Full body seated on a low round honey-brown tree stump with visible rings/bark. Isolated portrait 3:4; genuine transparent exterior; no text, bubble, foliage or scenery.
- `bunny-sad.png` / `.webp`: Same bunny identity and stump composition. Gentle disappointed expression, brows lifted inward, small downturned mouth, paws holding cheeks, slightly drooped ears and no tears. Full ears/paws preserved, transparent exterior, no other objects or text.
- `trophy.png` / `.webp`: One polished golden-yellow trophy with two handles, white star on cup, warm orange bevels, short stem and dark brown pedestal; small golden celebratory rays, child-friendly illustrated reward icon, transparent exterior, no text or scene.
- `star.png` / `.webp`: One rounded five-point golden-yellow reward star, lemon-yellow face, orange bevel/outline, small upper-left shine and soft warm shadow; no face or decorations, square composition with consistent transparent padding.

Existing pattern symbols, level-colour variables, tracker, question bunny, bucket variants, speaker and navigation assets are reused. Check/X/arrows/retry controls use the project's existing Lucide icon system and native interactive buttons. No complete screen is flattened into artwork.

## Executed verification

- Production build and targeted ESLint passed.
- All 1,246 existing frontend unit tests passed, including all existing question-answer validation cases.
- `scripts/wm-redesign/pattern-reference.mjs`: three full real-question attempts per level at 1/5, 3/5 and 4/5. Checked persistent board identity through feedback, selected/disabled options, no answer-revealing notification, duplicate-click guards, five unique question results, actual score/star rendering, failure gating, replay resets, next-game navigation, one common board across themes, transparent frame, laptop layout and Sinhala. Also tested failed-save recovery. APIs mocked; no student database writes.
- `scripts/wm-redesign/edges.mjs`: 2/5 failure gating, save retry, fresh attempt, manual instruction audio, actual one-second speech gaps, persistent music and mute regression passed.
- `scripts/wm-redesign/backend-policy.cjs`: real backend controller with model doubles passed score boundaries 0–5, three-correct threshold, actual star calculation, retained historical completion, sequential game/level unlocking and matching-grade screening checks. No database writes.
- Visual captures under `.design-backups/pattern-reference-before/qa-final/` were inspected against the references, including passing/retry results and incorrect inline feedback.

Shared navigation is unchanged. Live authenticated saves and audible sound output were not newly exercised on a student account. Newly generated art follows the reference closely; pixel identity is not claimed.

## Undo

The previous `GamePresentation.jsx` is saved under `.design-backups/pattern-reference-before/`. Restoring that file and removing this revision's new Pattern presentation/style/assets reverts this redesign without resetting other user changes.
