# Speech E2E audio fixtures

## `cat-48k-mono.wav`

- **Word spoken:** "cat" (English)
- **Producer:** Windows `System.Speech.Synthesis` (SAPI text-to-speech), adult system voice — not a child's voice
- **Format:** 48 kHz, mono, 16-bit PCM (Chromium `--use-file-for-fake-audio-capture` compatible)
- **Regenerate:**

```bash
cd frontend
node tests/e2e/fixtures/speech/generate-cat-fixture.mjs
```

Requires `backend/node_modules/ffmpeg-static` (run `npm install` in `backend` first).
