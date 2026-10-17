import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { getImprovementBunnyMessage, getImprovementFeedback, numberStageInstruction } from "../../src/features/workingMemory/config/gameConfig";

vi.mock("../../src/features/workingMemory/shared/GameLayout", () => ({
  MemoryButton: ({ children }) => <button>{children}</button>,
  MemoryPicture: () => <span />,
}));

import Feedback from "../../src/features/workingMemory/shared/Feedback";

describe("Improvement answer feedback", () => {
  it("celebrates a correct answer with three stars while displaying the actual five-star reward", () => {
    const markup = renderToStaticMarkup(<Feedback p={{ isCurrentCorrect: true, lastStarReward: 5 }} si={false} />);
    expect((markup.match(/<img\b/g) || []).length).toBe(3);
    expect(markup).toContain("+5 stars");
    expect(markup).toContain(getImprovementFeedback({ correct: true }).note);
  });

  it.each([
    { si: false, title: "Oops!", note: "That’s not the correct answer. Try again later!" },
    { si: true, title: "අයියෝ!", note: "එය නිවැරදි පිළිතුර නොවේ. පසුව නැවත උත්සාහ කරන්න!" },
  ])("shows the requested incorrect-answer notice without earned stars or a reward / Sinhala $si", ({ si, title, note }) => {
    expect(getImprovementFeedback({ correct: false, si })).toEqual({ title, note });
    const markup = renderToStaticMarkup(<Feedback p={{ isCurrentCorrect: false, lastStarReward: 0 }} si={si} />);
    expect(markup).toContain(title);
    expect(markup).toContain(note);
    expect(markup).not.toContain("star.webp");
    expect(markup).not.toContain("lx-feedback-reward");
  });

  it("keeps the existing bunny feedback guidance in every game", () => {
    for (const game of ["pattern", "words", "instructions", "numbers"]) {
      for (const correct of [true, false]) {
        expect(getImprovementBunnyMessage({ game, phase: "feedback", correct }))
          .toBe(correct ? getImprovementFeedback({ correct }).note : "Every go helps you learn.");
      }
      expect(getImprovementBunnyMessage({ game, phase: "feedback", correct: false, si: true }))
        .toBe("හැම උත්සාහයකින්ම අපි ඉගෙන ගනිමු.");
    }
  });

  it("distinguishes Ready, memorising and recall guidance without losing backward-order instructions", () => {
    const ready = numberStageInstruction({ awaiting: true });
    const show = numberStageInstruction({ awaiting: false });
    const recall = numberStageInstruction({ recall: true });
    expect(ready).toContain("Ready");
    expect(show).toContain("Remember");
    expect(recall).toContain("same order");
    expect(numberStageInstruction({ recall: true, backward: true })).toContain("last to first");
    expect(numberStageInstruction({ awaiting: true, backward: true })).toContain("last number");
    expect(numberStageInstruction({ backward: true })).toContain("last one");
    expect(getImprovementBunnyMessage({ game: "words", phase: "show", awaiting: true })).toContain("Ready");
    expect(getImprovementBunnyMessage({ game: "instructions", phase: "ready" })).toContain("Listen");
  });

  it("provides Sinhala guidance for both feedback states and every activity phase", () => {
    for (const game of ["pattern", "words", "instructions", "numbers"]) {
      for (const phase of ["ready", "show", "answer", "feedback", "result"]) {
        expect(getImprovementBunnyMessage({ game, phase, si: true })).toMatch(/[\u0D80-\u0DFF]/);
      }
    }
    expect(getImprovementFeedback({ correct: true, si: true }).title).toMatch(/[\u0D80-\u0DFF]/);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

async function loadFeedbackAudio({ muted = false, supported = true, suspended = false } = {}) {
  const contexts = [];
  class TestAudioContext {
    constructor() {
      this.currentTime = 10;
      this.state = suspended ? "suspended" : "running";
      this.destination = {};
      this.notes = [];
      this.gains = [];
      this.resume = vi.fn().mockResolvedValue();
      this.close = vi.fn().mockResolvedValue();
      contexts.push(this);
    }
    createOscillator() {
      const note = { frequency: { setValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn(), start: vi.fn(), stop: vi.fn() };
      this.notes.push(note);
      return note;
    }
    createGain() {
      const gain = { gain: { setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() }, connect: vi.fn(), disconnect: vi.fn() };
      this.gains.push(gain);
      return gain;
    }
  }
  const closeTimer = vi.fn();
  const setPreference = vi.fn();
  const musicPlay = vi.fn().mockResolvedValue();
  vi.stubGlobal("localStorage", { getItem: () => String(muted), setItem: setPreference });
  vi.stubGlobal("Audio", vi.fn(function () { this.play = musicPlay; this.pause = vi.fn(); }));
  vi.stubGlobal("window", { AudioContext: supported ? TestAudioContext : undefined, setTimeout: closeTimer });
  const { playMemoryFeedbackSound } = await import("../../src/features/workingMemory/logic/audio");
  return { playMemoryFeedbackSound, contexts, closeTimer, setPreference, musicPlay };
}

describe("Improvement answer sounds", () => {
  it("starts the happy chime immediately and closes its audio context after the short sound", async () => {
    const { playMemoryFeedbackSound, contexts, closeTimer } = await loadFeedbackAudio();
    playMemoryFeedbackSound(true);
    const context = contexts[0];
    expect(context.notes).toHaveLength(4);
    expect(context.notes[0].start).toHaveBeenCalledWith(context.currentTime);
    expect(context.notes.every(note => note.type === "triangle")).toBe(true);
    const [close, delay] = closeTimer.mock.calls[0];
    expect(delay).toBeLessThan(1000);
    close();
    expect(context.close).toHaveBeenCalledOnce();
  });

  it("matches the Phonological Awareness incorrect-answer tone and envelope", async () => {
    const { playMemoryFeedbackSound, contexts } = await loadFeedbackAudio();
    playMemoryFeedbackSound(false);
    const [incorrect] = contexts;
    expect(incorrect.notes).toHaveLength(2);
    expect(incorrect.notes.every(note => note.type === "sine")).toBe(true);
    [220, 164.81].forEach((frequency, index) => {
      const start = incorrect.currentTime + index * .12;
      expect(incorrect.notes[index].frequency.setValueAtTime).toHaveBeenCalledWith(frequency, start);
      expect(incorrect.notes[index].start).toHaveBeenCalledWith(start);
      expect(incorrect.notes[index].stop).toHaveBeenCalledWith(start + .25);
      expect(incorrect.gains[index].gain.setValueAtTime).toHaveBeenCalledWith(.25, start);
      expect(incorrect.gains[index].gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(.01, start + .25);
    });
  });

  it("plays both feedback sounds while music is muted without restarting music or changing the preference", async () => {
    const { playMemoryFeedbackSound, contexts, musicPlay, setPreference } = await loadFeedbackAudio({ muted: true });
    playMemoryFeedbackSound(true);
    playMemoryFeedbackSound(false);
    expect(contexts.map(context => context.notes.length)).toEqual([4, 2]);
    expect(musicPlay).not.toHaveBeenCalled();
    expect(setPreference).not.toHaveBeenCalled();
  });

  it("resumes browser-suspended audio and stays optional when Web Audio is unavailable", async () => {
    const suspendedAudio = await loadFeedbackAudio({ suspended: true });
    suspendedAudio.playMemoryFeedbackSound(true);
    expect(suspendedAudio.contexts[0].resume).toHaveBeenCalledOnce();
    await Promise.resolve();
    expect(suspendedAudio.contexts[0].notes).toHaveLength(4);
    vi.resetModules();
    const unsupportedAudio = await loadFeedbackAudio({ supported: false });
    expect(() => unsupportedAudio.playMemoryFeedbackSound(false)).not.toThrow();
    expect(unsupportedAudio.contexts).toHaveLength(0);
  });
});
