/**
 * Generates cat-48k-mono.wav for Speech E2E fake-microphone tests.
 * Uses Windows System.Speech (SAPI) — not a child's voice.
 * Output: 48 kHz, mono, 16-bit PCM (Chromium fake-audio-capture format).
 */
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_DIR = __dirname;
const RAW_WAV = path.join(FIXTURE_DIR, "cat-tts-raw.wav");
const OUT_WAV = path.join(FIXTURE_DIR, "cat-48k-mono.wav");
const REPO_ROOT = path.resolve(FIXTURE_DIR, "../../../../../");
const FFMPEG = path.join(REPO_ROOT, "backend/node_modules/ffmpeg-static/ffmpeg.exe");
const FFPROBE = path.join(REPO_ROOT, "backend/node_modules/ffprobe-static/bin/win32/x64/ffprobe.exe");

const psScript = `
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$synth.Rate = 0
$synth.SetOutputToWaveFile('${RAW_WAV.replace(/'/g, "''")}')
$synth.Speak('cat')
$synth.Dispose()
`;

if (!fs.existsSync(FFMPEG)) {
  console.error("ffmpeg-static not found. Run npm install in backend first.");
  process.exit(1);
}

console.log("Generating TTS raw WAV via Windows SAPI...");
spawnSync("powershell", ["-NoProfile", "-Command", psScript], { stdio: "inherit" });

if (!fs.existsSync(RAW_WAV) || fs.statSync(RAW_WAV).size === 0) {
  console.error("TTS generation failed.");
  process.exit(1);
}

console.log("Converting to 48 kHz mono PCM...");
execFileSync(FFMPEG, ["-y", "-i", RAW_WAV, "-ar", "48000", "-ac", "1", "-sample_fmt", "s16", OUT_WAV], {
  stdio: "inherit",
});

if (fs.existsSync(FFPROBE)) {
  const probe = spawnSync(FFPROBE, [
    "-v",
    "error",
    "-show_entries",
    "stream=codec_name,sample_rate,channels",
    "-of",
    "json",
    OUT_WAV,
  ]);
  console.log(probe.stdout?.toString() || "");
}

const size = fs.statSync(OUT_WAV).size;
console.log(`Fixture ready: ${OUT_WAV} (${size} bytes)`);
if (size < 1000) process.exit(1);
