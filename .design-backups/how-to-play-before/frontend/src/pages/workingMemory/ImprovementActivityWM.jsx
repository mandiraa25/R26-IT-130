import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getStudentProfile } from "../../services/student/api";
import { getStudentProgress, submitSubCategoryAttempt } from "../../services/workingMemory/improveApi";
import { getSubCategoryData } from "./data/improvement";
import { getLevelDisplaySeconds, SUBCATEGORY_ORDER } from "./data/improvement/config";

import { getYouTubeId, shuffleArray } from "./utils/helpers";
import { getWorkingMemoryThemeAssets } from "./utils/themeAssets";
import { evaluateDragAnswer, evaluatePatternAnswer } from "../../utils/workingMemory/evaluateImprovementAnswer.util";
import PatternGame from "./games/Patterngame";
import WordsGame from "./games/WordsGame";
import InstructionsGame from "./games/Instructionsgame";
import NumbersGame from "./games/Numbersgame";

const COMMON_BACKGROUND = "/images/workingMemory/improve/common/common_bg.png";
const HOW_TO_WATCH_BUNNY = "/images/workingMemory/improve/boards/wm_bunny_question.png";
const LEVEL_CARD_BACKS = {
  1: "/images/workingMemory/improve/cards/level1/level1carrot_card_back.png",
  2: "/images/workingMemory/improve/cards/level2/level2carrot_card_back.png",
  3: "/images/workingMemory/improve/cards/level3/level3carrot_card_back.png",
  4: "/images/workingMemory/improve/cards/level4/level4carrot_card_back.png",
};
const FRONT_CARD = "/images/workingMemory/improve/cards/front_card.png";
const WM_PROFILE_CACHE = "wm-profile-cache";
const WM_PROGRESS_CACHE = "wm-progress-cache";

const readSessionCache = (key) => {
  try { return JSON.parse(sessionStorage.getItem(key) || "null"); } catch { return null; }
};

const pictureItemKey = (item) => item && typeof item === "object" ? item.id || item.image || item.alt : item;
const shuffleIntoDifferentOrder = (items) => {
  const source = [...items];
  if (source.length < 2) return source;
  let shuffled = shuffleArray(source);
  const unchanged = shuffled.every((item, index) => pictureItemKey(item) === pictureItemKey(source[index]));
  if (unchanged) shuffled = [...shuffled.slice(1), shuffled[0]];
  return shuffled;
};

const cachedAccessState = (levelNumber, subCategoryKey) => {
  const progress = readSessionCache(WM_PROGRESS_CACHE);
  if (!progress) return "checking";
  if (!progress.isIdentificationCompleted) return "denied_identification";
  const level = progress.levelsProgress?.find((item) => item.levelNumber === Number(levelNumber));
  const activity = level?.subCategories?.find((item) => item.subCategoryKey === subCategoryKey);
  return activity?.isUnlocked ? "allowed" : "denied_locked";
};

const PATTERN_HOW_TO_PLAY_VIDEO = "https://youtu.be/uAqYnG7B0w8";
const STARS_PER_CORRECT = 5;

const readTotalStars = (payload) =>
  Math.max(0, Number(payload?.totalStars ?? payload?.totalCarrots) || 0);

export default function ImprovementActivityWM() {
  const { grade, levelNumber, subCategoryKey } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("wm");

  const [profile, setProfile] = useState(() => readSessionCache(WM_PROFILE_CACHE));
  const [accessState, setAccessState] = useState(() => cachedAccessState(levelNumber, subCategoryKey));
  const [phase, setPhase] = useState("video"); // 'video' | 'intro' | 'show' | 'countdown' | 'answer' | 'feedback' | 'result'
  const [subCatData, setSubCatData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const latestResultRef = useRef(null);
  const submissionStartedRef = useRef(false);
  const wordsSpeechTimeoutRef = useRef(null);
  const [earnedStars, setEarnedStars] = useState(0);
  const [lastStarReward, setLastStarReward] = useState(0);
  const [totalStars, setTotalStars] = useState(() =>
    readTotalStars(readSessionCache(WM_PROGRESS_CACHE) ?? readSessionCache(WM_PROFILE_CACHE))
  );

  // Timing states
  const [timerCount, setTimerCount] = useState(0);
  const [timerMax, setTimerMax] = useState(15);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [totalStartTime, setTotalStartTime] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Drag and drop slots state
  const [slots, setSlots] = useState([]);
  const [dragPool, setDragPool] = useState([]);
  const [activeStepIdx, setActiveStepIdx] = useState(-1);

  // Words Subcategory states (Card Pack Theme)
  const [cardsFlipped, setCardsFlipped] = useState(false);
  const [wordsAwaitingPlay, setWordsAwaitingPlay] = useState(false);
  const [deckRevealed, setDeckRevealed] = useState(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  // HTML5 Drag & Drop and Slot Swap Handlers
  const handleDragStart = (e, source, index, value) => {
    setDraggedItem({ source, index, value });
    if (e?.dataTransfer) {
      e.dataTransfer.setData("text/plain", JSON.stringify({ source, index, value }));
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (e?.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
  };

  const handleDropOnSlot = (e, targetIndex) => {
    if (e) e.preventDefault();
    let item = draggedItem;
    if (!item && e?.dataTransfer) {
      try {
        item = JSON.parse(e.dataTransfer.getData("text/plain"));
      } catch {
        item = null;
      }
    }
    if (!item) return;

    const { source, index: sourceIndex, value } = item;
    const targetValue = slots[targetIndex];

    if (source === "slot") {
      if (sourceIndex === targetIndex) return;
      const updatedSlots = [...slots];
      updatedSlots[targetIndex] = value;
      updatedSlots[sourceIndex] = targetValue || "";
      setSlots(updatedSlots);
    } else if (source === "pool" || source === "deck") {
      const updatedSlots = [...slots];
      updatedSlots[targetIndex] = value;

      const updatedPool = [...dragPool];
      const foundIdx = sourceIndex !== undefined ? sourceIndex : updatedPool.lastIndexOf(value);
      if (foundIdx !== -1) updatedPool.splice(foundIdx, 1);

      if (targetValue) {
        updatedPool.push(targetValue);
      }

      setSlots(updatedSlots);
      setDragPool(updatedPool);
      if (source === "deck") setDeckRevealed(false);
    }

    setDraggedItem(null);
    setSelectedSlotIndex(null);
  };

  // Handle deck stack interactions for Words subcategory
  const handleDeckTap = () => {
    if (dragPool.length === 0) return;

    if (!deckRevealed) {
      setDeckRevealed(true);
    } else {
      const targetIdx = selectedSlotIndex !== null ? selectedSlotIndex : slots.findIndex((s) => s === "" || s === null);
      if (targetIdx !== -1) {
        handlePlaceCardFromDeck(targetIdx);
      }
    }
  };

  const handlePlaceCardFromDeck = (slotIdx) => {
    if (dragPool.length === 0) return;
    const topCard = dragPool[dragPool.length - 1];
    const targetValue = slots[slotIdx];

    const updatedSlots = [...slots];
    updatedSlots[slotIdx] = topCard;

    const updatedPool = [...dragPool];
    updatedPool.pop();

    if (targetValue) {
      updatedPool.push(targetValue);
    }

    setSlots(updatedSlots);
    setDragPool(updatedPool);
    setDeckRevealed(false);
    setSelectedSlotIndex(null);
  };

  // Feedbacks
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(null);
  const [lastUserAnswer, setLastUserAnswer] = useState(null);

  // Backend submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // YouTube player state & refs
  const [videoEnded, setVideoEnded] = useState(false);
  const [useFallbackIframe, setUseFallbackIframe] = useState(false);
  const playerRef = useRef(null);

  const isPatternGame = subCategoryKey === "pattern";

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const themeAssets = getWorkingMemoryThemeAssets(levelNumber);
    const imageSources = [
      COMMON_BACKGROUND,
      themeAssets.background,
      themeAssets.howToBoard,
      themeAssets.questionBoard,
      LEVEL_CARD_BACKS[Number(levelNumber)],
      FRONT_CARD,
      HOW_TO_WATCH_BUNNY,
      "/images/workingMemory/improve/boards/wm_bunny_ready.png",
      "/images/workingMemory/improve/boards/wm_bunny_answer.png",
      "/images/workingMemory/improve/boards/wm_vine_board.png",
      "/images/workingMemory/improve/boards/how_to%20play_vine%20board.png",
    ].filter(Boolean);
    imageSources.forEach((src) => { const image = new Image(); image.src = src; });
  }, [levelNumber]);

  useEffect(() => {
    const studentId = localStorage.getItem("studentId");
    if (!studentId) {
      setAccessState("denied_identification");
      return;
    }

    getStudentProgress(studentId)
      .then((response) => {
        sessionStorage.setItem(WM_PROGRESS_CACHE, JSON.stringify(response?.data || null));
        setTotalStars(readTotalStars(response?.data));
        const level = response?.data?.levelsProgress?.find((item) => item.levelNumber === Number(levelNumber));
        const activity = level?.subCategories?.find((item) => item.subCategoryKey === subCategoryKey);
        if (!response?.data?.isIdentificationCompleted) {
          setAccessState("denied_identification");
        } else if (activity?.isUnlocked) {
          setAccessState("allowed");
        } else {
          setAccessState("denied_locked");
        }
      })
      .catch(() => setAccessState("denied_identification"));
  }, [levelNumber, subCategoryKey]);

  useEffect(() => {
    const currentLang = i18n.language?.startsWith("si") ? "si" : "en";
    const data = getSubCategoryData(grade, levelNumber, subCategoryKey, currentLang);
    if (data) {
      setSubCatData(
        subCategoryKey === "pattern"
          ? { ...data, youtubeVideoUrl: PATTERN_HOW_TO_PLAY_VIDEO }
          : data,
      );
      setQuestions(subCategoryKey === "words" ? data.questions || [] : shuffleArray(data.questions || []));
    } else {
      console.error(`Working Memory Subcategory data not found for G:${grade} L:${levelNumber} K:${subCategoryKey}`);
    }
  }, [grade, levelNumber, subCategoryKey, i18n.language]);

  // Handle YouTube IFrame API initialization
  useEffect(() => {
    if (phase !== "video" || !subCatData?.youtubeVideoUrl) return;

    setVideoEnded(false);
    setUseFallbackIframe(false);
    const videoId = getYouTubeId(subCatData.youtubeVideoUrl);
    if (!videoId) return;

    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
    }

    let ytPlayer = null;
    let isCancelled = false;

    const initPlayer = () => {
      if (isCancelled) return;
      const elem = document.getElementById("yt-player-element");
      if (!elem) return;

      try {
        ytPlayer = new window.YT.Player("yt-player-element", {
          videoId: videoId,
          playerVars: {
            rel: 0,
            modestbranding: 1,
            iv_load_policy: 3,
            controls: 1,
            enablejsapi: 1,
            origin: window.location.origin,
          },
          events: {
            onStateChange: (event) => {
              if (event.data === 0) {
                setVideoEnded(true);
              }
            },
          },
        });
        playerRef.current = ytPlayer;
      } catch (err) {
        console.warn("YouTube API fallback to iframe:", err);
        setUseFallbackIframe(true);
      }
    };

    if (window.YT && window.YT.Player) {
      setTimeout(initPlayer, 50);
    } else {
      const origCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (origCallback) origCallback();
        initPlayer();
      };
      const timeoutId = setTimeout(() => {
        if (!playerRef.current) setUseFallbackIframe(true);
      }, 3000);
      return () => clearTimeout(timeoutId);
    }

    return () => {
      isCancelled = true;
      if (playerRef.current && typeof playerRef.current.destroy === "function") {
        try {
          playerRef.current.destroy();
        } catch {
          return undefined;
        }
      }
    };
  }, [phase, subCatData, i18n.language]);

  const handleReplayVideo = () => {
    setVideoEnded(false);
    if (playerRef.current && typeof playerRef.current.seekTo === "function") {
      playerRef.current.seekTo(0);
      playerRef.current.playVideo();
    }
  };

  const handleSkipAndPlay = () => {
    setVideoEnded(false);
    if (playerRef.current && typeof playerRef.current.stopVideo === "function") {
      playerRef.current.stopVideo();
    }
    setPhase("intro");
  };

  const fetchProfile = async () => {
    try {
      const res = await getStudentProfile();
      setProfile(res.data);
      sessionStorage.setItem(WM_PROFILE_CACHE, JSON.stringify(res.data));
      if (Number.isFinite(res.data?.totalStars ?? res.data?.totalCarrots)) {
        setTotalStars(readTotalStars(res.data));
      }
    } catch (err) {
      console.error("Error fetching student profile:", err);
    }
  };

  // Match the child-friendly answer feedback used by Phonological Awareness:
  // a four-note victory chime for correct answers and a gentle descending
  // two-note tone for incorrect answers.
  const playResultSound = (isCorrect) => {
    if (!soundEnabled) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;

      const audioContext = new AudioContextClass();
      const scheduleNotes = () => {
        const notes = isCorrect
          ? [523.25, 659.25, 783.99, 1046.5]
          : [220, 164.81];
        const noteDelay = isCorrect ? 0.08 : 0.12;
        const noteDuration = isCorrect ? 0.3 : 0.25;

        notes.forEach((frequency, index) => {
          const startTime = audioContext.currentTime + index * noteDelay;
          const oscillator = audioContext.createOscillator();
          const gain = audioContext.createGain();

          oscillator.type = isCorrect ? "triangle" : "sine";
          oscillator.frequency.setValueAtTime(frequency, startTime);
          gain.gain.setValueAtTime(isCorrect ? 0.3 : 0.25, startTime);
          gain.gain.exponentialRampToValueAtTime(
            isCorrect ? 0.001 : 0.01,
            startTime + noteDuration,
          );
          oscillator.connect(gain);
          gain.connect(audioContext.destination);
          oscillator.start(startTime);
          oscillator.stop(startTime + noteDuration);
        });

        const totalDuration = (notes.length - 1) * noteDelay + noteDuration;
        window.setTimeout(() => audioContext.close().catch(() => {}), (totalDuration + 0.1) * 1000);
      };

      if (audioContext.state === "suspended") {
        audioContext.resume().then(scheduleNotes).catch(() => audioContext.close().catch(() => {}));
      } else {
        scheduleNotes();
      }
    } catch (error) {
      console.warn("Answer feedback audio could not play:", error);
    }
  };

  // Text-to-speech for instructions. Accepts an optional onEnd callback so callers
  // (e.g. the Instructions game) can chain utterances with a pause between them.
  const speakText = (text, slow = true, onEnd) => {
    if (!text) {
      onEnd?.();
      return;
    }
    window.speechSynthesis.cancel();

    const cleanText = text.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF]/g, "").trim();
    if (!cleanText) {
      onEnd?.();
      return;
    }

    const isSinhalaSpeech = i18n.language?.startsWith("si");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = isSinhalaSpeech ? "si-LK" : "en-US";
    utterance.rate = isSinhalaSpeech ? (slow ? 0.68 : 0.76) : (slow ? 0.75 : 0.85);
    utterance.pitch = isSinhalaSpeech ? 1.05 : 1.25;

    const voices = window.speechSynthesis.getVoices();
    const exactLanguage = isSinhalaSpeech ? "si-lk" : "en-us";
    const languageCode = isSinhalaSpeech ? "si" : "en";
    const voice = voices.find((candidate) => candidate.lang?.toLowerCase() === exactLanguage)
      || voices.find((candidate) => candidate.lang?.toLowerCase().startsWith(languageCode));
    if (voice) utterance.voice = voice;

    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Speak picture names without displaying them. Each name starts one second
  // after the previous name finishes so the sequence is easy to distinguish.
  const speakPictureNames = (items) => {
    const names = items
      .map((item) => typeof item === "object" ? item?.alt || item?.id : item)
      .filter(Boolean);
    let index = 0;

    const speakNext = () => {
      if (index >= names.length) return;
      const name = names[index];
      index += 1;
      speakText(name, false, () => {
        if (index < names.length) {
          wordsSpeechTimeoutRef.current = window.setTimeout(speakNext, 1000);
        }
      });
    };

    speakNext();
  };

  const startQuiz = () => {
    setQuestions((currentQuestions) => subCategoryKey === "words" ? currentQuestions : shuffleArray(currentQuestions));
    setCurrentIdx(0);
    setScore(0);
    setResults([]);
    latestResultRef.current = null;
    submissionStartedRef.current = false;
    setLastStarReward(0);
    setEarnedStars(0);
    setSubmitResult(null);
    setTotalStartTime(performance.now());
    setPhase("intro");
  };

  const handleReadyToPlay = () => {
    setupQuestion(0);
  };

  const handleInstructionReady = () => {
    setPhase("answer");
  };

  // Timer configuration based on levels for standard games
  const getDisplayTime = () => {
    return getLevelDisplaySeconds(levelNumber);
  };

  const setupQuestion = (idx) => {
    const q = questions[idx];
    if (!q) return;

    window.clearTimeout(wordsSpeechTimeoutRef.current);
    window.speechSynthesis.cancel();

    setQuestionStartTime(performance.now());
    setIsCurrentCorrect(null);
    setLastUserAnswer(null);
    setCardsFlipped(false);
    setWordsAwaitingPlay(false);
    setDeckRevealed(false);
    setSelectedSlotIndex(null);
    setDraggedItem(null);
    setLastStarReward(0);

    const correctSeq = q.correct || [];
    setSlots(Array(correctSeq.length).fill(""));
    setDragPool(subCategoryKey === "numbers"
      ? shuffleArray(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"])
      : (subCategoryKey === "words" ? shuffleIntoDifferentOrder(correctSeq) : shuffleArray(q.dragPool || [])));

    if (subCategoryKey === "words") {
      setPhase("show");
      setCardsFlipped(false);
      setWordsAwaitingPlay(true);
      return;
    }

    if (isPatternGame) {
      setSlots([""]);
      setDragPool(shuffleArray(q.options || q.dragPool || []));
      setPhase("answer");
      return;
    }

    const isInstructionsGame = subCategoryKey === "instructions";
    if (isInstructionsGame) {
      setPhase("show");
      setActiveStepIdx(-1);

      setSlots([null]);
      setDragPool(shuffleArray(q.options || []));
      return;
    }

    if (q.type === "tap") {
      setPhase("answer");
      return;
    }

    setPhase("show");
    const displaySeconds = getDisplayTime();
    setTimerCount(displaySeconds);
    setTimerMax(displaySeconds);
  };

  const startWordsMemory = () => {
    if (!wordsAwaitingPlay) return;

    const displaySeconds = 10;
    setWordsAwaitingPlay(false);
    setCardsFlipped(true);
    setTimerCount(displaySeconds);
    setTimerMax(displaySeconds);
    if (soundEnabled) {
      speakPictureNames(questions[currentIdx]?.showItems || []);
    }
  };

  // 3D card flip animation hook for Words subcategory in Phase 2 (show)
  useEffect(() => {
    if (phase === "show" && subCategoryKey === "words" && !wordsAwaitingPlay) {
      setCardsFlipped(false);
      const timer = setTimeout(() => {
        setCardsFlipped(true);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [phase, currentIdx, subCategoryKey, wordsAwaitingPlay]);

  // Timer countdown hook for showing items
  useEffect(() => {
    if (phase !== "show" || !questions[currentIdx]) return;
    if (subCategoryKey === "words" && wordsAwaitingPlay) return;
    if (subCategoryKey === "instructions") return;

    if (timerCount <= 0) {
      if (subCategoryKey === "words") {
        setCardsFlipped(false);
      }
      setPhase("answer");
      return;
    }

    const interval = setInterval(() => {
      setTimerCount((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, timerCount, currentIdx, levelNumber, subCategoryKey, isPatternGame, activeStepIdx, wordsAwaitingPlay, questions]);

  const handleTileClick = (val) => {
    if (isPatternGame) {
      setSlots([val]);
      return;
    }

    const emptyIndex = slots.findIndex((s) => s === "" || s === null);
    if (emptyIndex !== -1) {
      const updated = [...slots];
      updated[emptyIndex] = val;
      setSlots(updated);

      if (!isPatternGame) {
        const poolIndex = dragPool.findIndex((item) => {
          if (item && val && typeof item === "object" && typeof val === "object") {
            return pictureItemKey(item) === pictureItemKey(val);
          }
          return item === val;
        });
        if (poolIndex !== -1) {
          const updatedPool = [...dragPool];
          updatedPool.splice(poolIndex, 1);
          setDragPool(updatedPool);
        }
      }
    }
  };

  const handleSlotClear = (index) => {
    const val = slots[index];
    if (val) {
      const updated = [...slots];
      updated[index] = subCategoryKey === "instructions" ? null : "";
      setSlots(updated);

      if (!isPatternGame) {
        setDragPool((prev) => [...prev, val]);
      }
    }
    setSelectedSlotIndex(null);
  };

  const handleSlotClick = (targetIndex) => {
    if (selectedSlotIndex !== null) {
      if (selectedSlotIndex === targetIndex) {
        handleSlotClear(targetIndex);
        setSelectedSlotIndex(null);
        return;
      }
      const updatedSlots = [...slots];
      const temp = updatedSlots[targetIndex];
      updatedSlots[targetIndex] = updatedSlots[selectedSlotIndex];
      updatedSlots[selectedSlotIndex] = temp;
      setSlots(updatedSlots);
      setSelectedSlotIndex(null);
      return;
    }

    if (subCategoryKey === "words" && deckRevealed && dragPool.length > 0) {
      handlePlaceCardFromDeck(targetIndex);
      return;
    }

    if (slots[targetIndex]) {
      setSelectedSlotIndex(targetIndex);
    }
  };

  const handleDragSubmit = () => {
    const q = questions[currentIdx];

    if (slots.some((s) => s === "" || s === null)) {
      return;
    }

    const isCorrect = evaluateDragAnswer(subCategoryKey, slots, q);

    const answerToStore = subCategoryKey === "instructions" ? slots[0] : slots;
    evaluateAnswer(answerToStore, isCorrect);
  };

  // Instructions game recall step: the child taps one option and gets immediate feedback
  // (no drag-and-drop, no intermediate submit step).
  const handleInstructionAnswer = (selectedOption) => {
    const q = questions[currentIdx];
    if (!q) return;
    evaluateAnswer(selectedOption, selectedOption === q.correct);
  };

  const handlePatternConfirm = () => {
    const q = questions[currentIdx];
    const choice = slots[0];
    if (!q || !choice) return;
    evaluateAnswer(choice, evaluatePatternAnswer(q, choice));
  };

  const evaluateAnswer = (userAnswer, isCorrect) => {
    const q = questions[currentIdx];
    if (!q) return;
    const endTime = performance.now();
    const timeTaken = Math.round(endTime - questionStartTime);

    setIsCurrentCorrect(isCorrect);
    setLastUserAnswer(userAnswer);
    setPhase("feedback");

    if (isCorrect) {
      setEarnedStars((prev) => prev + STARS_PER_CORRECT);
      setTotalStars((prev) => prev + STARS_PER_CORRECT);
      setLastStarReward(STARS_PER_CORRECT);
      playResultSound(true);
      setScore((prev) => prev + 1);
    } else {
      setLastStarReward(0);
      playResultSound(false);
    }

    const newResult = {
      questionId: q.id,
      isCorrect,
      timeTaken,
      userAnswer,
      correctAnswer: isPatternGame ? q.missingAnswer : q.correct,
    };
    latestResultRef.current = newResult;
    setResults((prev) => [...prev, newResult]);
  };

  const handleNextQuestion = async () => {
    const finalResults = results;
    const finalScore = finalResults.filter((result) => result.isCorrect).length;
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
      setupQuestion(currentIdx + 1);
    } else {
      if (submissionStartedRef.current) return;
      submissionStartedRef.current = true;
      setPhase("result");
      await handleCompleteQuiz(finalScore, finalResults);
    }
  };

  const handleCompleteQuiz = async (finalScore, finalResults) => {
    const totalTimeTaken = Math.round((performance.now() - totalStartTime) / 1000);
    const studentId = profile?._id || localStorage.getItem("studentId");

    if (!studentId) {
      console.warn("No studentId found for submitting improvement attempt.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await submitSubCategoryAttempt({
        studentId,
        grade: grade,
        language: i18n.language?.startsWith("si") ? "si" : "en",
        levelNumber: Number(levelNumber),
        subCategoryKey,
        score: finalScore,
        totalQuestions: questions.length,
        questionResults: finalResults,
        totalTimeTaken,
      });

      setSubmitResult(res.data);
      if (Number.isFinite(res.data?.totalStars ?? res.data?.totalCarrots)) {
        setTotalStars(readTotalStars(res.data));
      }
    } catch (err) {
      console.error("Error saving improvement attempt:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLevels = () => {
    navigate(`/improvement-wm/${grade}`);
  };

  const handleNextSubCategory = () => {
    const subCatOrder = SUBCATEGORY_ORDER;
    const currentSubIdx = subCatOrder.indexOf(subCategoryKey);

    if (currentSubIdx !== -1 && currentSubIdx + 1 < subCatOrder.length) {
      const nextKey = subCatOrder[currentSubIdx + 1];
      navigate(`/improvement-activity-wm/${grade}/${levelNumber}/${nextKey}`);
      setPhase("video");
    } else if (Number(levelNumber) < 4) {
      navigate(`/improvement-activity-wm/${grade}/${Number(levelNumber) + 1}/pattern`);
      setPhase("video");
    } else {
      navigate(`/improvement-wm/${grade}`);
    }
  };

  if (accessState === "denied_identification") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-100 p-6 text-center">
        <div className="max-w-lg rounded-[2rem] border-4 border-amber-200 bg-white p-8 shadow-xl">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-50 text-5xl">📝</div>
          <h1 className="text-2xl font-black text-slate-800 uppercase">{t("identification_required_title")}</h1>
          <p className="mt-3 text-base font-bold text-slate-600">{t("identification_required_msg")}</p>
          <button
            type="button"
            onClick={() => navigate(`/working-memory/${grade}`)}
            className="mt-6 rounded-2xl bg-amber-500 px-6 py-3 font-black text-white shadow-md hover:bg-amber-600"
          >
            {t("go_to_identification")} ➔
          </button>
          <button
            type="button"
            onClick={() => navigate(`/improvement-wm/${grade}`)}
            className="mt-3 block w-full rounded-2xl border-2 border-slate-200 px-6 py-3 font-black text-slate-600 hover:bg-slate-50"
          >
            {t("back_to_levels")}
          </button>
        </div>
      </div>
    );
  }

  if (accessState === "denied_locked") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-sky-100 p-6 text-center">
        <div className="max-w-lg rounded-[2rem] border-4 border-slate-200 bg-white p-8 shadow-xl">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-5xl">🔒</div>
          <h1 className="text-2xl font-black text-slate-800 uppercase">{t("locked")}</h1>
          <p className="mt-3 text-base font-bold text-slate-600">{t("complete_previous_subcat")}</p>
          <button
            type="button"
            onClick={() => navigate(`/improvement-wm/${grade}`)}
            className="mt-6 rounded-2xl bg-indigo-500 px-6 py-3 font-black text-white shadow-md hover:bg-indigo-600"
          >
            {t("back_to_levels")} ➔
          </button>
        </div>
      </div>
    );
  }

  if (accessState === "checking" || !subCatData) {
    return (
      <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center">
        <div className="w-20 h-20 border-8 border-white border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-emerald-700 font-black text-2xl animate-pulse">{t("getting_ready")}</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const backgroundSrc = getWorkingMemoryThemeAssets(levelNumber).background || COMMON_BACKGROUND;
  const cardBackSrc = LEVEL_CARD_BACKS[Number(levelNumber)];

  // Props shared by every game (video/header/result phases, submission state, etc.)
  const sharedProps = {
    phase,
    levelNumber,
    subCategoryKey,
    t,
    i18n,
    soundEnabled,
    setSoundEnabled,
    handleBackToLevels,
    subCatData,
    useFallbackIframe,
    videoEnded,
    handleReplayVideo,
    handleSkipAndPlay,
    howToWatchBunny: HOW_TO_WATCH_BUNNY,
    startQuiz,
    currentQuestion,
    timerCount,
    timerMax,
    currentIdx,
    questions,
    slots,
    dragPool,
    handleTileClick,
    handleSlotClear,
    handleSlotClick,
    handleDragOver,
    handleDropOnSlot,
    handleDragStart,
    handleDragSubmit,
    handleInstructionAnswer,
    handlePatternConfirm,
    speakText,
    isCurrentCorrect,
    lastUserAnswer,
    handleNextQuestion,
    score,
    results,
    isSubmitting,
    submitResult,
    handleNextSubCategory,
    backgroundSrc,
    cardBackSrc,
    frontCardSrc: FRONT_CARD,
    wordsAwaitingPlay,
    startWordsMemory,
    handleReadyToPlay,
    handleInstructionReady,
    earnedStars,
    lastStarReward,
    totalStars,
  };

  if (isPatternGame) {
    return <PatternGame {...sharedProps} />;
  }

  if (subCategoryKey === "words") {
    return <WordsGame {...sharedProps} cardsFlipped={cardsFlipped} selectedSlotIndex={selectedSlotIndex} deckRevealed={deckRevealed} handleDeckTap={handleDeckTap} />;
  }

  if (subCategoryKey === "instructions") {
    return <InstructionsGame {...sharedProps} />;
  }

  return <NumbersGame {...sharedProps} selectedSlotIndex={selectedSlotIndex} />;
}
