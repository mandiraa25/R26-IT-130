# Dashboard UI artwork

Generated with the built-in image generation tool for the reference-style dashboard.
Existing animal card illustrations remain in `../category-cards/`.
Exact generation prompts are saved in `generation-prompts.json`. PNGs were resized locally after generation while retaining their transparent backgrounds (256px badges, 960px-wide wooden frame).

## Assets and prompts

- `wooden-pill.png`: One wide, front-facing horizontal capsule button frame for a children's jungle learning app. Honey-orange carved wood outer rim, darker brown side groove, golden top bevel, empty opaque cream parchment center for live HTML labels. Premium 3D cartoon game UI. Transparent outside; no letters, numbers, icons, plants, or extra objects.
- `badge-wm.png`: One front-facing tangerine-orange circular glossy cartoon game medallion, beveled double rim and white inset highlight, centered white brain silhouette, transparent outside, no text.
- `badge-rp.png`: Same medallion treatment in sky blue, with a white open book and blue page lines.
- `badge-pa.png`: Same medallion treatment in apple green, with a white speaker and three sound-wave arcs.
- `badge-sp.png`: Same medallion treatment in violet purple, with a white speech bubble and three purple dots.

All category badges use a square canvas, a circular face occupying roughly 90%, a soft upper-left highlight and short bottom shadow. The marks remain readable at small sizes. The wooden frame is reused behind the shared live star counter and dashboard achievements button. Music and segmented EN/සිං controls reuse the Working Memory navigation artwork through `src/components/common/WoodenNavControls.jsx`. Text is rendered by React so it stays translatable.

For home-page JSX, styles and every picture/video reference, see `frontend/src/pages/common/README.md`.
