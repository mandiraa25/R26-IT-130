import { afterEach, describe, expect, test, vi } from "vitest";
import { getSubCategoryData } from "../../src/features/workingMemory/improvement/data";
import { getInstructionAudioUrl } from "../../src/features/workingMemory/config/instructionAudio";
import { playInstructionRecording } from "../../src/features/workingMemory/logic/instructionRecording";

afterEach(() => vi.unstubAllGlobals());

describe("Grade 3 instruction recordings", () => {
  test("maps all 20 Sinhala questions by ID and keeps languages separate", () => {
    const urls = [];
    for (let level = 1; level <= 4; level++) {
      const questions = getSubCategoryData(3, level, "instructions", "si").questions;
      expect(questions).toHaveLength(5);
      for (const question of questions) {
        const url = getInstructionAudioUrl(question.id, "si-LK");
        expect(url).toBe(`/audio/workingMemory/instructions/grade3/si/${question.id}.mp4`);
        expect(getInstructionAudioUrl(question.id, "en")).not.toBe(url);
        urls.push(url);
      }
    }
    expect(new Set(urls).size).toBe(20);
    expect(getInstructionAudioUrl("g2_l1_g3_1", "si")).toBeNull();
    expect(getInstructionAudioUrl("g4_l4_g3_5", "si")).toBeNull();
  });

  const mockAudio = (play = () => Promise.resolve()) => {
    const audio = { play: vi.fn(play), pause: vi.fn(), removeAttribute: vi.fn(), load: vi.fn() };
    vi.stubGlobal("Audio", vi.fn(function () { return audio; }));
    return audio;
  };

  test("waits for the recording to end before completing", () => {
    const audio = mockAudio();
    const done = vi.fn();
    const fallback = vi.fn();
    playInstructionRecording("/instruction.mp4", done, fallback);
    expect(done).not.toHaveBeenCalled();
    audio.onended();
    expect(done).toHaveBeenCalledOnce();
    expect(fallback).not.toHaveBeenCalled();
    expect(audio.pause).toHaveBeenCalled();
  });

  test("a missing file and rejected play only trigger one fallback", async () => {
    const audio = mockAudio(() => Promise.reject(new Error("unavailable")));
    const fallback = vi.fn();
    playInstructionRecording("/missing.mp4", vi.fn(), fallback);
    audio.onerror();
    await Promise.resolve();
    expect(fallback).toHaveBeenCalledOnce();
  });

  test("leaving the question stops audio and ignores a late completion", () => {
    const audio = mockAudio();
    const done = vi.fn();
    const fallback = vi.fn();
    const stop = playInstructionRecording("/instruction.mp4", done, fallback);
    const lateEnd = audio.onended;
    stop();
    lateEnd();
    expect(audio.pause).toHaveBeenCalled();
    expect(audio.onended).toBeNull();
    expect(done).not.toHaveBeenCalled();
    expect(fallback).not.toHaveBeenCalled();
  });
});
