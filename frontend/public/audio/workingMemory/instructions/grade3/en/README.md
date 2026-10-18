# Grade 3 listening recordings (English)

This folder is only for future English recordings. The supplied recordings are
Sinhala: copy those 20 MP4 files into the sibling `../si/` folder instead.
Keep their filenames unchanged:

| Level | Filenames (questions 1–5) |
| --- | --- |
| 1 | `g3_l1_g3_1.mp4` through `g3_l1_g3_5.mp4` |
| 2 | `g3_l2_g3_1.mp4` through `g3_l2_g3_5.mp4` |
| 3 | `g3_l3_g3_1.mp4` through `g3_l3_g3_5.mp4` |
| 4 | `g3_l4_g3_1.mp4` through `g3_l4_g3_5.mp4` |

These are per-question instruction recordings, not the How to Play tutorial.
The game plays the MP4 audio without displaying a video player. Each recording
should contain only the instruction sequence for that question, including any
desired pauses. Do not include the answer or the later recall question.

Listen plays the matching question ID, even when question order changes.
Show question becomes available when playback ends; Listen again replays it.
Recordings play even when background music is muted. Missing, unsupported or
failed recordings fall back to the existing text-to-speech instructions.

For Sinhala recordings, put the same filenames in the sibling `../si/` folder.
The app selects recordings by interface language; it never substitutes English
recordings for Sinhala instructions. Grades 2 and 4 keep text-to-speech.

Mapping: `src/features/workingMemory/config/instructionAudio.js`.
Playback: `src/features/workingMemory/improvement/games/InstructionsGame.jsx`.
