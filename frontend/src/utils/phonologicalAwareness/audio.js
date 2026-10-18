// Utility to manage audio instances and stop all playing audio / speech synthesis across route changes and page exits

const activeAudioInstances = new Set();

/**
 * Register an Audio instance to be tracked globally so it can be stopped on route changes or page exit.
 */
export const registerAudio = (audioInstance) => {
  if (audioInstance && audioInstance instanceof HTMLMediaElement) {
    activeAudioInstances.add(audioInstance);
    audioInstance.addEventListener("ended", () => activeAudioInstances.delete(audioInstance), { once: true });
    audioInstance.addEventListener("pause", () => activeAudioInstances.delete(audioInstance));
  }
  return audioInstance;
};

/**
 * Stop all active speech synthesis and audio elements (both registered and DOM audio elements).
 */
export const stopAllAudio = () => {
  // 1. Cancel Web Speech Synthesis
  if (typeof window !== "undefined" && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel();
    } catch (e) {
      console.error("Error cancelling speechSynthesis:", e);
    }
  }

  // 2. Pause registered JS Audio instances
  activeAudioInstances.forEach((audio) => {
    try {
      if (audio && !audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
    } catch (e) {
      console.error("Error stopping registered audio:", e);
    }
  });
  activeAudioInstances.clear();

  // 3. Pause any DOM audio or video tags
  if (typeof document !== "undefined") {
    const mediaElements = document.querySelectorAll("audio, video");
    mediaElements.forEach((el) => {
      try {
        if (el && !el.paused) {
          el.pause();
          el.currentTime = 0;
        }
      } catch (e) {
        console.error("Error stopping DOM media element:", e);
      }
    });
  }
};
