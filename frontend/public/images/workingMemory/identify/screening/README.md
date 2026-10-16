# Working Memory screening assets

These are unmodified copies of the artwork supplied by the user:

- `bunny.png`: Cheerful Bunny Presenter Sticker.png.
- `vine-board.png`: Golden-framed cream vine board.png.
- `forest.png`: Sunny Tropical Forest Clearing.png.

No image generation was needed. Normal interface text, question/progress counts,
answer cards, buttons and results are HTML/CSS in `ScreeningUI.jsx` and
`screening.css`. Existing question picture files remain in the parent directory;
their transparent margins are fitted with CSS without changing their pixels.

All eight supplied screening references were reviewed. The duplicated picture
and instruction-answer designs map to the same respective components. The
distinct layouts are instruction observation, instruction answers, number
observation, number answers, picture answers, and assessment completion.
Pattern questions use the same board and pastel answer-card style.

The LexiLand logo is omitted. Real assessments show 15 progress dots, the existing
star-progress behavior, and Question X of 15. Demos show their actual question
count instead. Colors and labels provide progress cues; keyboard focus is visible.

Grade-dependent timings, question options, immediate answer submission, scoring
and result saving are retained. Instruction steps are visible during narration
and hidden when answers appear. Listen reads only the prompt during recall, so it
does not reveal a hidden sequence.

Desktop screenshots were reviewed at 1654 x 951; English/Sinhala mobile layouts
were also checked. The full real assessment was exercised with a mocked save
endpoint: 15 correct results, seven 7000ms memory allocations, one save, matching
completion score and functioning Back Home. Existing unit tests also passed.

This is a cleaner adaptation of the references, not a pixel-identical rendering.
It retains the provided artwork's aspect ratios and intentionally reduces visual
clutter, uses existing question illustrations, and keeps direct answer selection.
On narrow screens the original board image supplies a nine-slice frame around
readable, flowing content, rather than squeezing text into a landscape screenshot.
