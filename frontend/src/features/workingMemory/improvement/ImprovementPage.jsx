import ActivityScreen from "./ActivityScreen";
import { readTotalStars } from "../logic/progression";
import React, { useState, useEffect, useRef } from "react";
import { useMemoryMusic } from "../logic/audio";
import { selectAttemptQuestions } from "../logic/progression";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAttemptHistory, getWorkingMemoryAccess, submitSubCategoryAttempt } from "../services/improveApi";
import { getSubCategoryData } from "./data";
import { getLevelDisplaySeconds, SUBCATEGORY_ORDER } from "../config/gameConfig";

import { shuffleArray } from "../logic/presentation";
import { getWorkingMemoryThemeAssets } from "../config/levelThemes";
import { evaluateDragAnswer, evaluatePatternAnswer } from "../logic/answerChecking.js";

const COMMON_BACKGROUND = "/images/workingMemory/shared/backgrounds/bg-level1.webp";
const HOW_TO_WATCH_BUNNY = "/images/workingMemory/shared/bunny/wm-bunny-question.png";
const LEVEL_CARD_BACKS = {
  1: "/images/workingMemory/pictures/cards/card-back-level-1.png",
  2: "/images/workingMemory/pictures/cards/card-back-level-2.png",
  3: "/images/workingMemory/pictures/cards/card-back-level-3.png",
  4: "/images/workingMemory/pictures/cards/card-back-level-4.png",
};
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

const PATTERN_HOW_TO_PLAY_VIDEO = "https://youtu.be/uAqYnG7B0w8";
const STARS_PER_CORRECT = 5;


export default function ImprovementPage() {
  const { grade, levelNumber, subCategoryKey } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("wm");

  const [profile, setProfile] = useState(() => readSessionCache(WM_PROFILE_CACHE));
  const [accessState, setAccessState] = useState("checking");
  const [accessRetry, setAccessRetry] = useState(0);
  const [savedProgress, setSavedProgress] = useState(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState(false);
  const progressRefreshRef = useRef(null);
  const [levelHistory, setLevelHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(false);
  const historyRefreshRef = useRef(null);
  const [phase, setPhase] = useState("video"); // 'video' | 'intro' | 'show' | 'countdown' | 'answer' | 'feedback' | 'result'
  const [subCatData, setSubCatData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const latestResultRef = useRef(null);
  const answeredQuestionRef = useRef(false);
  const nextTransitionRef = useRef(false);
  const previousQuestionIdsRef = useRef([]);
  const undoHistoryRef = useRef([]);
  const submissionStartedRef = useRef(false);
  const saveAttemptInFlightRef = useRef(false);
  const savedAttemptRef = useRef(false);
  const wordsSpeechTimeoutRef = useRef(null);
  const numbersReadyStartedRef = useRef(false);
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
  const { muted } = useMemoryMusic();
  const soundEnabled = !muted;

  // Drag and drop slots state
  const [slots, setSlots] = useState([]);
  const [dragPool, setDragPool] = useState([]);
  const [activeStepIdx, setActiveStepIdx] = useState(-1);

  // Words Subcategory states (Card Pack Theme)
  const [cardsFlipped, setCardsFlipped] = useState(false);
  const [wordsAwaitingPlay, setWordsAwaitingPlay] = useState(false);
  const [numbersAwaitingPlay, setNumbersAwaitingPlay] = useState(false);
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

    const { source, index: sourceIndex } = item;
    if (phase !== "answer" || answeredQuestionRef.current) return;
    const poolIndex = dragPool.findIndex(candidate => pictureItemKey(candidate) === pictureItemKey(item.value));
    if (!["pool", "slot"].includes(source) || targetIndex < 0 || targetIndex >= slots.length) return;
    if (source === "pool" && poolIndex < 0) return;
    if (source === "slot" && (!slots[sourceIndex] || pictureItemKey(slots[sourceIndex]) !== pictureItemKey(item.value))) return;
    const value = source === "slot" ? slots[sourceIndex] : dragPool[poolIndex];
    rememberArrangement();
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
      updatedPool.splice(poolIndex, 1);

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
  const [submissionError, setSubmissionError] = useState(false);


  const isPatternGame = subCategoryKey === "pattern";


  useEffect(() => {
    const themeAssets = getWorkingMemoryThemeAssets(levelNumber);
    const imageSources = [
      COMMON_BACKGROUND,
      themeAssets.background,
      themeAssets.howToBackground,
      themeAssets.howToBoard,
      themeAssets.questionBoard,
      LEVEL_CARD_BACKS[Number(levelNumber)],
      HOW_TO_WATCH_BUNNY,
    ].filter(Boolean);
    imageSources.forEach((src) => { const image = new Image(); image.src = src; });
  }, [levelNumber]);

  useEffect(() => {
    let cancelled = false;
    const checkAccess = async () => {
      setAccessState("checking");
      try {
        // Use the authenticated profile ID, just as the level map does. A
        // legacy localStorage ID can be absent or refer to a different session.
        const { profile: student, progress } = await getWorkingMemoryAccess({ refresh: accessRetry > 0 });
        if (cancelled) return;
        setProfile(student);
        sessionStorage.setItem(WM_PROFILE_CACHE, JSON.stringify(student));
        sessionStorage.setItem(WM_PROGRESS_CACHE, JSON.stringify(progress));
        setSavedProgress(progress);
        setTotalStars(readTotalStars(progress));
        const level = progress.levelsProgress?.find((item) => item.levelNumber === Number(levelNumber));
        const activity = level?.subCategories?.find((item) => item.subCategoryKey === subCategoryKey);
        setAccessState(!progress.isIdentificationCompleted
          ? "denied_identification"
          : activity?.isUnlocked ? "allowed" : "denied_locked");
      } catch {
        // A connection/server error says nothing about screening completion.
        if (!cancelled) setAccessState("error");
      }
    };
    void checkAccess();
    return () => { cancelled = true; };
  }, [levelNumber, subCategoryKey, accessRetry]);

  useEffect(() => {
    const currentLang = i18n.language?.startsWith("si") ? "si" : "en";
    // Load the existing bank for this grade, language, level and game.
    const data = getSubCategoryData(grade, levelNumber, subCategoryKey, currentLang);
    if (data) {
      setSubCatData(
        subCategoryKey === "pattern"
          ? { ...data, youtubeVideoUrl: PATTERN_HOW_TO_PLAY_VIDEO }
          : data,
      );
      setQuestions(selectAttemptQuestions(data.questions || []));
      previousQuestionIdsRef.current = [];
      setPhase("video");
    } else {
      console.error(`Working Memory Subcategory data not found for G:${grade} L:${levelNumber} K:${subCategoryKey}`);
    }
  }, [grade, levelNumber, subCategoryKey, i18n.language]);

  const handleSkipAndPlay = () => {
    startQuiz();
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

  // Start a fresh five-question attempt, including when the child plays again.
  const startQuiz = () => {
    const attempt = selectAttemptQuestions(subCatData?.questions || questions, previousQuestionIdsRef.current);
    previousQuestionIdsRef.current = attempt.map(q => q.id);
    setQuestions(attempt);
    setCurrentIdx(0);
    setScore(0);
    setResults([]);
    latestResultRef.current = null;
    submissionStartedRef.current = false;
    saveAttemptInFlightRef.current = false;
    savedAttemptRef.current = false;
    setLastStarReward(0);
    setEarnedStars(0);
    setSubmitResult(null);
    setTotalStartTime(performance.now());
    setSubmissionError(false);
    setupQuestion(0, attempt);
  };

  const handleInstructionReady = () => {
    setPhase("answer");
  };

  // Timer configuration based on levels for standard games
  const getDisplayTime = () => {
    return getLevelDisplaySeconds(levelNumber);
  };

  const setupQuestion = (idx, questionSet = questions) => {
    const q = questionSet[idx];
    if (!q) return;

    window.clearTimeout(wordsSpeechTimeoutRef.current);
    window.speechSynthesis.cancel();

    answeredQuestionRef.current = false;
    nextTransitionRef.current = false;
    latestResultRef.current = null;
    undoHistoryRef.current = [];
    setQuestionStartTime(performance.now());
    setIsCurrentCorrect(null);
    setLastUserAnswer(null);
    setCardsFlipped(false);
    setWordsAwaitingPlay(false);
    setNumbersAwaitingPlay(false);
    numbersReadyStartedRef.current = false;
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

    if (subCategoryKey === "numbers" && [1, 2, 3, 4].includes(Number(levelNumber))) {
      setPhase("show");
      setNumbersAwaitingPlay(true);
      setTimerCount(0);
      return;
    }

    setPhase("show");
    const displaySeconds = getDisplayTime();
    setTimerCount(displaySeconds);
    setTimerMax(displaySeconds);
  };

  // Picture Memory keeps its original ten-second memorization period.
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

  const handleNumbersReady = () => {
    if (![1, 2, 3, 4].includes(Number(levelNumber)) || subCategoryKey !== "numbers" || phase !== "show" || !numbersAwaitingPlay || numbersReadyStartedRef.current) return;
    // Claim the start synchronously, before the Ready button can be clicked again.
    numbersReadyStartedRef.current = true;
    const displaySeconds = getDisplayTime();
    setTimerCount(displaySeconds);
    setTimerMax(displaySeconds);
    setNumbersAwaitingPlay(false);
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
    if ([1, 2, 3, 4].includes(Number(levelNumber)) && subCategoryKey === "numbers" && numbersAwaitingPlay) return;
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
  }, [phase, timerCount, currentIdx, levelNumber, subCategoryKey, isPatternGame, activeStepIdx, wordsAwaitingPlay, numbersAwaitingPlay, questions]);

  const handleTileClick = (val) => {
    if (phase !== "answer" || answeredQuestionRef.current) return;
    if (isPatternGame) {
      setSlots([val]);
      return;
    }

    if (subCategoryKey === "words" && !dragPool.some(item => pictureItemKey(item) === pictureItemKey(val))) return;
    rememberArrangement();
    const emptyIndex = slots.findIndex((s) => s === "" || s === null);
    if (emptyIndex !== -1) {
      const updated = [...slots];
      updated[emptyIndex] = val;
      setSlots(updated);

      if (!isPatternGame && subCategoryKey !== "numbers") {
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
    if (phase !== "answer" || answeredQuestionRef.current) return;
    if (val) rememberArrangement();
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
      rememberArrangement();
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

  // Snapshots include both rows, so Undo conserves the complete picture set.
  const rememberArrangement = () => { undoHistoryRef.current.push({ slots: [...slots], pool: [...dragPool] }); };
  const handleUndo = () => {
    if (phase !== "answer" || answeredQuestionRef.current) return;
    if (subCategoryKey === "numbers") {
      const last = slots.findLastIndex(value => value !== "");
      if (last >= 0) setSlots(current => current.map((value, i) => i === last ? "" : value));
    } else {
      const previous = undoHistoryRef.current.pop();
      if (previous) { setSlots(previous.slots); setDragPool(previous.pool); setSelectedSlotIndex(null); }
    }
  };
  const handleStartOver = () => {
    if (phase !== "answer" || answeredQuestionRef.current) return;
    rememberArrangement();
    setSlots(Array(questions[currentIdx].correct.length).fill(""));
    setDragPool(shuffleIntoDifferentOrder(questions[currentIdx].correct));
    setSelectedSlotIndex(null);
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

  // Record one answer and show its existing feedback and star reward.
  const evaluateAnswer = (userAnswer, isCorrect) => {
    const q = questions[currentIdx];
    if (!q || phase !== "answer" || answeredQuestionRef.current) return;
    answeredQuestionRef.current = true;
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

  // Move on after feedback, or save the result after the final question.
  const handleNextQuestion = async () => {
    if (!answeredQuestionRef.current || nextTransitionRef.current) return;
    nextTransitionRef.current = true;
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

  // Re-read the existing progress endpoint after saving. A refresh failure must
  // never retry the successful attempt POST, which would award the stars twice.
  const handleRetryProgress = () => {
    if (progressRefreshRef.current) return progressRefreshRef.current;
    setProgressLoading(true);
    setProgressError(false);
    const request = getWorkingMemoryAccess({ refresh: true }).then(({ profile: student, progress }) => {
      setProfile(student);
      setSavedProgress(progress);
      sessionStorage.setItem(WM_PROFILE_CACHE, JSON.stringify(student));
      sessionStorage.setItem(WM_PROGRESS_CACHE, JSON.stringify(progress));
      setTotalStars(readTotalStars(progress));
      return progress;
    }).catch(() => {
      setProgressError(true);
      return null;
    }).finally(() => {
      setProgressLoading(false);
      progressRefreshRef.current = null;
    });
    progressRefreshRef.current = request;
    return request;
  };

  const handleRetryLevelHistory = () => {
    if (historyRefreshRef.current) return historyRefreshRef.current;
    const studentId = profile?._id || localStorage.getItem("studentId");
    if (!studentId) {
      setHistoryError(true);
      return Promise.resolve(null);
    }
    setHistoryLoading(true);
    setHistoryError(false);
    const request = getAttemptHistory(studentId, Number(levelNumber)).then((response) => {
      if (response?.success === false || !Array.isArray(response?.data)) throw new Error("Attempt history unavailable");
      setLevelHistory(response.data);
      return response.data;
    }).catch(() => {
      setHistoryError(true);
      return null;
    }).finally(() => {
      setHistoryLoading(false);
      historyRefreshRef.current = null;
    });
    historyRefreshRef.current = request;
    return request;
  };

  // Save through the existing API; its response controls saved progression.
  const handleCompleteQuiz = async (finalScore, finalResults) => {
    const isLevelOne = [1, 2, 3, 4].includes(Number(levelNumber));
    if (isLevelOne && (saveAttemptInFlightRef.current || savedAttemptRef.current)) return;
    const totalTimeTaken = Math.round((performance.now() - totalStartTime) / 1000);
    const studentId = profile?._id || localStorage.getItem("studentId");

    if (!studentId) {
      console.warn("No studentId found for submitting improvement attempt.");
      return;
    }

    if (isLevelOne) saveAttemptInFlightRef.current = true;
    setIsSubmitting(true);
    setSubmissionError(false);
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
      if (isLevelOne) savedAttemptRef.current = true;
      if (res.data?.progress) sessionStorage.setItem(WM_PROGRESS_CACHE, JSON.stringify(res.data.progress));
      if (isLevelOne && res.data?.progress) setSavedProgress(res.data.progress);
      if (Number.isFinite(res.data?.totalStars ?? res.data?.totalCarrots)) {
        setTotalStars(readTotalStars(res.data));
      }
      if (isLevelOne) await Promise.all([
        handleRetryProgress(),
        (subCategoryKey === "numbers" || Number(levelNumber) === 4) ? handleRetryLevelHistory() : Promise.resolve(),
      ]);
    } catch (err) {
      setSubmissionError(true);
      console.error("Error saving improvement attempt:", err);
    } finally {
      if (isLevelOne) saveAttemptInFlightRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleBackToLevels = () => {
    navigate(`/improvement-wm/${grade}?level=${levelNumber}`);
  };

  const handleNextSubCategory = () => {
    if (score < 3 || isSubmitting || !submitResult) return;
    if (subCategoryKey === "numbers") {
      const progress = [1, 2, 3, 4].includes(Number(levelNumber)) ? savedProgress || submitResult.progress : submitResult.progress;
      const savedLevel = progress?.levelsProgress?.find(level => level.levelNumber === Number(levelNumber));
      if (savedLevel?.isCompleted) setPhase("levelComplete");
      else handleBackToLevels();
      return;
    }
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

  if (accessState === "error") {
    const isSinhala = i18n.language?.startsWith("si");
    return (
      <main className="min-h-screen flex items-center justify-center bg-sky-100 p-6 text-center">
        <section className="max-w-lg rounded-[2rem] border-4 border-amber-200 bg-white p-8 shadow-xl" role="alert">
          <h1 className="text-2xl font-black text-slate-800">{isSinhala ? "ප්‍රගතිය පූරණය කළ නොහැක" : "Unable to load your progress"}</h1>
          <p className="mt-3 font-bold text-slate-600">{isSinhala ? "සම්බන්ධතාවය පරීක්ෂා කර නැවත උත්සාහ කරන්න." : "Please check your connection and try again."}</p>
          <button type="button" onClick={() => setAccessRetry((value) => value + 1)} className="mt-6 rounded-2xl bg-amber-500 px-6 py-3 font-black text-white shadow-md">
            {isSinhala ? "නැවත උත්සාහ කරන්න" : "Try Again"}
          </button>
          <button type="button" onClick={handleBackToLevels} className="mt-3 block w-full rounded-2xl border-2 border-slate-200 px-6 py-3 font-black text-slate-600">
            {t("back_to_levels")}
          </button>
        </section>
      </main>
    );
  }

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
  // Props shared by every game (video/header/result phases, submission state, etc.)
  const sharedProps = {
    phase,
    levelNumber,
    subCategoryKey,
    t,
    i18n,
    handleBackToLevels,
    subCatData,
    handleSkipAndPlay,
    startQuiz,
    currentQuestion,
    timerCount,
    timerMax,
    currentIdx,
    questions,
    slots,
    dragPool,
    handleTileClick,
    handleSlotClick,
    handleDragOver,
    handleDropOnSlot,
    handleDragStart,
    handleDragSubmit,
    handleInstructionAnswer,
    handlePatternAnswer: (answer) => { const q = questions[currentIdx]; if (q) evaluateAnswer(answer, evaluatePatternAnswer(q, answer)); },
    handleUndo,
    handleStartOver,
    pictureMemorySeconds: 10,
    numberMemorySeconds: getLevelDisplaySeconds(levelNumber),
    speakText,
    isCurrentCorrect,
    lastUserAnswer,
    handleNextQuestion,
    score,
    results,
    isSubmitting,
    submissionError,
    handleRetrySave: () => handleCompleteQuiz(score, results),
    handleContinueLevel: () => { if (Number(levelNumber) < 4) navigate(`/improvement-activity-wm/${grade}/${Number(levelNumber) + 1}/pattern`); else handleBackToLevels(); },
    submitResult,
    savedProgress,
    progressLoading,
    progressError,
    handleRetryProgress,
    levelHistory,
    historyLoading,
    historyError,
    handleRetryLevelHistory,
    handleNextSubCategory,
    wordsAwaitingPlay,
    numbersAwaitingPlay,
    handleNumbersReady,
    startWordsMemory,
    handleInstructionReady,
    earnedStars,
    lastStarReward,
    totalStars,
  };

  return <ActivityScreen {...sharedProps} cardsFlipped={cardsFlipped} selectedSlotIndex={selectedSlotIndex} deckRevealed={deckRevealed} handleDeckTap={handleDeckTap} />;
}
