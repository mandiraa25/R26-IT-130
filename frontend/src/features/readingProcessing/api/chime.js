let ctx = null;

function context() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function playAttentionChime(volume = 0.12) {
  const audio = context();
  if (!audio) return;
  const start = audio.currentTime;

  for (const [freq, offset] of [[784, 0], [587.33, 0.16]]) {
    const osc = audio.createOscillator();
    const gain = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = start + offset;
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(volume, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
    osc.connect(gain).connect(audio.destination);
    osc.start(t);
    osc.stop(t + 0.5);
  }
}

export function speakIfQuiet(text) {
  const synth = window.speechSynthesis;
  if (!synth || synth.speaking || synth.pending) return false;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;
  utterance.pitch = 1.1;
  synth.speak(utterance);
  return true;
}

export function releaseReadingAudio() {
  window.speechSynthesis?.cancel();
  if (ctx && ctx.state !== "closed") ctx.suspend().catch(() => {});
}
