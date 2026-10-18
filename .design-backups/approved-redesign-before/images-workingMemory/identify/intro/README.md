# Working Memory introduction artwork

Current screen mapping:

- Screenshot 2026-10-14 235142.png -> choice popup reference -> WelcomeScreen.
- Screenshot 2026-10-14 235159.png -> rules popup reference -> BriefingScreen.

Both screens are implemented in `IdentifyIntroScreens.jsx`, with `identifyIntro.css`.
The forest background, bunny, magnifier and wooden close icon are reused from the existing project.
All UI text, badges, numbered steps, cards and buttons are editable HTML/CSS. The optional
Listen control preserves the original speech narration. Demo completion and quiz logic are unchanged.

Ten illustrations were extracted/recreated using the built-in imagegen tool and stored in this folder.
They are close recreations, not guaranteed pixel-identical extractions. The supplied full-screen
reference images are never rendered as the interface.

## Final prompts

### choice-board.png

Use case: background-extraction. Extract only the blank cream ivory parchment board and narrow rounded orange-brown wooden frame plus two green corner leaf clusters (top left and bottom right) from this reference. Remove ALL bunny, cards, controller, magnifier, text, grade badge and every button. Fill their former space with original blank cream parchment. Outside frame and corner leaves genuinely transparent PNG. Preserve original frame thickness, colors and proportions. Board landscape aspect ratio approximately 1.17:1, tightly framed, occupies 98 percent of canvas. No forest, no labels, no extra decorations.

### rules-board.png

Use case: background-extraction. Reusable individual illustration for LexiLand website. Keep ONLY the blank ivory parchment board with its narrow layered orange wooden rounded frame and green leaves at top-left and bottom-right. Remove all lettering, bunny, buttons, icons, cards, grade badge and close icon. Outside the board and leaves is transparent, NOT the forest background. Board approximately square 1.02:1 ratio, fills almost the entire canvas. Preserve original frame thickness, shape, colors and corner leaves; empty cream interior. Reproduce source artwork faithfully, no redesign. Genuine transparent PNG alpha background. Isolate subject tightly with a modest 4 percent transparent margin. Do not include any other part of the reference.

### controller.png

Use case: background-extraction. Reusable individual illustration for LexiLand website. Extract ONLY the white game controller illustrated in the left card with green plus pad, yellow orange red blue face buttons and green leaves. Preserve exact object shape, colors, perspective and polished 3D style. No surrounding card or text. Reproduce source artwork faithfully, no redesign. Genuine transparent PNG alpha background. Isolate subject tightly with a modest 4 percent transparent margin. Do not include any other part of the reference.

### look.png

Use case: background-extraction. Reusable individual illustration for LexiLand website. Extract ONLY the blue eye illustration in step 1, including its brown upper eyelid and three small gold attention rays. No numbered badge, cream circle or Look label. Match original proportions and colors. Reproduce source artwork faithfully, no redesign. Genuine transparent PNG alpha background. Isolate subject tightly with a modest 4 percent transparent margin. Do not include any other part of the reference.

### remember.png

Use case: background-extraction. Reusable individual illustration for LexiLand website. Extract ONLY the pink brain illustration in step 2, including three small golden attention rays. No numbered badge, cream circle or Remember label. Match exact brain shape, pink shading and colors. Reproduce source artwork faithfully, no redesign. Genuine transparent PNG alpha background. Isolate subject tightly with a modest 4 percent transparent margin. Do not include any other part of the reference.

### answer.png

Use case: background-extraction. Reusable individual illustration for LexiLand website. Extract ONLY the pointing orange hand illustration in step 3 with blue cuff and three golden attention rays. No numbered badge, cream circle or Answer label. Preserve exact pointing pose, colors and cartoon style. Reproduce source artwork faithfully, no redesign. Genuine transparent PNG alpha background. Isolate subject tightly with a modest 4 percent transparent margin. Do not include any other part of the reference.

### pattern.png

Use case: background-extraction. Reusable individual illustration for LexiLand website. Extract ONLY the three glossy red, blue, green balls in the top-left small rules card. Same diameter, evenly arranged horizontally in that order, preserve shading. No text or card background. Reproduce source artwork faithfully, no redesign. Genuine transparent PNG alpha background. Isolate subject tightly with a modest 4 percent transparent margin. Do not include any other part of the reference.

### pictures.png

Use case: background-extraction. Reusable individual illustration for LexiLand website. Extract ONLY the two tilted green-framed picture cards from the upper-right small rules card. Left shows green mountains blue sky yellow sun; right shows a red apple with leaves. Match the exact overlapping arrangement, frames, colors and polished illustration style. No text or UI background. Reproduce source artwork faithfully, no redesign. Genuine transparent PNG alpha background. Isolate subject tightly with a modest 4 percent transparent margin. Do not include any other part of the reference.

### instructions.png

Use case: background-extraction. Reusable individual illustration for LexiLand website. Extract ONLY the orange ear and blue-bordered checklist illustration from the lower-left small rules card. Checklist has three green check marks and blue horizontal strokes, no letters. Keep original relative positioning ear on left checklist on right, exact colors and polished style. No card background or other text. Reproduce source artwork faithfully, no redesign. Genuine transparent PNG alpha background. Isolate subject tightly with a modest 4 percent transparent margin. Do not include any other part of the reference.

### numbers.png

Use case: background-extraction. Reusable individual illustration for LexiLand website. Extract ONLY the three tilted rounded square number tiles from the lower-right small rules card. Blue left with white 1, red middle with white 2, green right with white 3, arranged horizontally with original tilt and shading. Preserve the exact digits, colors and style. No UI card background or other text. Reproduce source artwork faithfully, no redesign. Genuine transparent PNG alpha background. Isolate subject tightly with a modest 4 percent transparent margin. Do not include any other part of the reference.

