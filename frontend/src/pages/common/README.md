# Student home and picture references

The student home route is `/dashboard`, registered in [`src/App.jsx`](../../App.jsx). Its main files are [`Dashboard.jsx`](Dashboard.jsx) and [`dashboard.css`](dashboard.css).

## Implementation map

| Area | Files |
| --- | --- |
| Home layout, category cards, demo links and background video | [`Dashboard.jsx`](Dashboard.jsx), [`dashboard.css`](dashboard.css) |
| Profile, photo upload and stars per module | [`Profile.jsx`](Profile.jsx); route `/profile` |
| Category activity selection popup | [`ActivitySelectionModal.jsx`](../../components/common/ActivitySelectionModal.jsx), [`activitySelectionModal.css`](../../components/common/activitySelectionModal.css) |
| Shared wooden star counter, music button and language control | [`WoodenNavControls.jsx`](../../components/common/WoodenNavControls.jsx), [`woodenNavControls.css`](../../components/common/woodenNavControls.css) |
| Language selection | [`LanguageSwitcher.jsx`](../../components/common/LanguageSwitcher.jsx); its `woodland` variant delegates to the shared segmented `EN` / `සිං` control |
| English and Sinhala labels | [`locales/en/common.json`](../../locales/en/common.json), [`locales/si/common.json`](../../locales/si/common.json), loaded by [`i18n.js`](../../i18n.js) |
| Local Fredoka, Lexend and Noto Sans Sinhala fonts | [`public/fonts/workingMemory/fonts.css`](../../../public/fonts/workingMemory/fonts.css), loaded by [`index.html`](../../../index.html) |
| Student data and cached profile | [`services/student/api.js`](../../services/student/api.js), [`utils/studentProfileCache.js`](../../utils/studentProfileCache.js) |

## Picture and video references

These are browser URLs. A URL beginning with `/images/` resolves to `frontend/public/images/`; `/vedios/` resolves to `frontend/public/vedios/` (the existing spelling is intentional).

### Home background and category cards

| Purpose | Exact URL |
| --- | --- |
| Animated background | `/vedios/bgvedio.mp4` |
| Home video poster / fallback | `/images/bg.png` |
| Working Memory card | `/images/dashboard/category-cards/working-memory-removebg-preview.png` |
| Reading Processing card | `/images/dashboard/category-cards/reading-processing-removebg-preview.png` |
| Phonological Awareness card | `/images/dashboard/category-cards/phonological-awareness-removebg-preview.png` |
| Speech Processing card | `/images/dashboard/category-cards/speech-processing-removebg-preview.png` |
| Working Memory badge | `/images/dashboard/reference-style/badge-wm.png` |
| Reading Processing badge | `/images/dashboard/reference-style/badge-rp.png` |
| Phonological Awareness badge | `/images/dashboard/reference-style/badge-pa.png` |
| Speech Processing badge | `/images/dashboard/reference-style/badge-sp.png` |

`Dashboard.jsx` selects card filenames from the `cards` array and badge filenames from each category ID. The profile avatar uses `profile.profilePhoto` when available and falls back to the bunny listed below.

The tiger and giraffe scenery is embedded in `/vedios/bgvedio.mp4`. Leaf and trophy icons are rendered with `lucide-react` in `Dashboard.jsx`; the demo symbols are emoji in the JSX.

### Shared wooden controls

| Purpose | Exact URL |
| --- | --- |
| Blank wooden frame | `/images/dashboard/reference-style/wooden-pill.png` |
| Music button artwork | `/images/workingMemory/shared/buttons/navigation/nav-music.png` |
| English-selected language artwork | `/images/workingMemory/shared/buttons/navigation/nav-lang-en.png` |
| Sinhala-selected language artwork | `/images/workingMemory/shared/buttons/navigation/nav-lang-si.png` |
| Star counter artwork | `/images/workingMemory/shared/feedback/star.webp` |

Shared controls keep their labels, counts and selected language in React so they remain interactive and translated.

### Activity selection popup

All categories use the same board, close button and activity illustrations. The category determines the mascot.

| Purpose | Exact URL |
| --- | --- |
| Popup board | `/images/dashboard/activity-popup/board-separated.png` |
| Working Memory mascot; home/profile avatar fallback | `/images/dashboard/activity-popup/bunny-separated.png` |
| Reading Processing mascot | `/images/dashboard/activity-popup/zebra-separated.png` |
| Phonological Awareness mascot | `/images/dashboard/activity-popup/parrot-separated.png` |
| Speech Processing mascot | `/images/dashboard/activity-popup/lion-separated.png` |
| Close button | `/images/dashboard/activity-popup/close-wooden.png` |
| Identification illustration | `/images/dashboard/activity-popup/magnifier-separated.png` |
| Improvement illustration | `/images/dashboard/activity-popup/puzzle-separated.png` |

The popup's image references and mascot mapping live in `ActivitySelectionModal.jsx`; its adjacent CSS controls placement and styling. Category reference screenshots, outline SVGs and earlier artwork remain in the asset folder but are not rendered by this popup.

### Profile page

| Purpose | Exact URL |
| --- | --- |
| Profile background fallback and video poster | `/images/profile/profile-bg.jpeg` |
| Profile summary board | `/images/profile/profile-sidebar-board.png` |
| Animated background | `/vedios/bgvedio.mp4` |
| Default avatar / failed-photo fallback | `/images/dashboard/activity-popup/bunny-separated.png` |

Profile picture URLs come from student data or an uploaded image; they have no fixed public asset filename. The profile language selector also uses the shared wooden control artwork above.

## Artwork notes

Generated dashboard artwork and its prompts are documented in [`reference-style/README.md`](../../../public/images/dashboard/reference-style/README.md) and [`generation-prompts.json`](../../../public/images/dashboard/reference-style/generation-prompts.json). Popup extraction prompts and asset notes are in [`activity-popup/README.md`](../../../public/images/dashboard/activity-popup/README.md). Prefer the `public` asset sources when editing; `dist` contains generated build output.
