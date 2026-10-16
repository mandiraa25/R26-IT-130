# Activity selection artwork

The live selectors are assembled from eight separate transparent PNG assets:

- `board-separated.png`: blank cream board, narrow orange wooden frame and corner leaves.
- `bunny-separated.png`, `lion-separated.png`, `parrot-separated.png`, `zebra-separated.png`: subject mascots.
- `magnifier-separated.png`, `puzzle-separated.png`: activity illustrations.
- `close-wooden.png`: circular wooden close button, including its white X.

All assets were extracted/recreated with the built-in image generation tool from
the user's four wooden-board references. They closely match the source artwork;
they are not guaranteed to be pixel-identical extractions.

All visible headings, grades, activity labels and buttons are actual HTML/CSS,
translated through the existing English/Sinhala dictionaries. Images use
`object-fit: contain` to preserve their proportions. The shared component is
`src/components/common/ActivitySelectionModal.jsx`; styling is in its adjacent CSS.
Reference pixel coordinates specify the board contents' positions. The maximum
popup width remains 860px. Existing full-screen game routes are unchanged.

## Final asset prompt set

All eight calls used `background-extraction`, their corresponding supplied
reference as the edit target, and genuine transparent-background output:

- Board: keep only the complete blank cream parchment board, exact narrow orange-brown rounded wooden frame and top-left/bottom-right leaves. Remove characters, cards, icons, all lettering and controls; fill the interior with matching ivory parchment; keep the original landscape proportions.
- Bunny: extract the original waving white bunny with blue eyes, orange round glasses, orange carrot bandana and shoulder leaves. Keep its upper-body pose and identity; remove all surrounding UI; center on transparent canvas.
- Lion: extract the original waving golden baby lion, brown mane/eyes and shoulder leaves. Preserve its expression, proportions and pose; remove all surrounding UI; center on transparent canvas.
- Parrot: extract the original red baby macaw, brown eyes, black beak, yellow/green/blue extended wing and green leaves. Preserve its original pose and character; remove all surrounding UI; center on transparent canvas.
- Zebra: extract the original waving baby zebra, brown eyes, black upright mane, stripes and shoulder leaves. Preserve identity, pose and colors; remove all surrounding UI; center on transparent canvas.
- Magnifier: extract the original wooden circular magnifying glass, glossy blue lens, lower-right angled wooden handle and lower-left green leaves. Preserve original proportions, colors and illustrated style; remove surrounding UI; center on transparent canvas.
- Puzzle: extract the original chunky interlocking yellow top, green lower-left and blue lower-right puzzle pieces with side leaves. Preserve angle, textures, colors and shapes; remove surrounding UI; center on transparent canvas.
- Close: extract only the small top-right circular wooden close button from the Working Memory reference. Preserve its warm orange-brown wood, layered bevelled rim, horizontal grain, centered thick white X and subtle shadow. Remove all surrounding UI; center the icon on a square canvas with genuine transparent alpha outside the circle.

Earlier reference screenshots, outline masks, blank-board and atlas experiments
remain as comparison material; none are rendered by the current selector.
