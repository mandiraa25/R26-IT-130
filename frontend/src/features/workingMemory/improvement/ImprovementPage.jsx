/*
 * FILE PURPOSE
 * Main controller shared by all four improvement games and Levels 1-4.
 *
 * HOW IT CONNECTS
 * App.jsx supplies grade, levelNumber and subCategoryKey through the activity route.
 * getSubCategoryData selects the bank; answerChecking checks responses; improveApi reads access, saves
 * an attempt and refreshes progress/history. ActivityScreen receives the state and callbacks as props.
 * Direct source importers: ../../../App.jsx.
 * Local feature/style dependencies: ActivityScreen.jsx, ../logic/progression.js, ../logic/audio.js,
 * ../logic/progression.js, ../services/improveApi.js, data/index.js, ../config/gameConfig.js,
 * ../logic/presentation.js, ../config/levelThemes.js, ../logic/answerChecking.js.
 *
 * THINGS TO REMEMBER
 * phase chooses tutorial, study, recall, feedback or results. questions is a selected attempt of up to
 * five questions. score counts correct answers; earnedStars uses five per correct answer. words is the
 * saved/API key for Picture Memory. Timers and submission guards live here; styles live in the view
 * components, not this controller.
 */

// VIVA: Improvement controller: question flow, answer arrangement, rewards and persistence.
import ActivityScreen from "./ActivityScreen";
import { readTotalStars } from "../logic/progression";
import React, { useState, useEffect, useRef } from "react";
import { playMemoryFeedbackSound, useMemoryMusic } from "../logic/audio";
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

/*
 * FUNCTION: readSessionCache
 * Read a cached profile/progress object without failing on invalid JSON.
 * WHEN: ImprovementPage initial state calls this.
 * HOW / RESULT: Returns null on missing/bad cache; later server reads remain the source of saved
 * progress.
 */
const readSessionCache = (key) => {
  try { return JSON.parse(sessionStorage.getItem(key) || "null"); } catch { return null; }
};

/*
 * FUNCTION: pictureItemKey
 * Read a stable comparison key from a picture object or primitive value.
 * WHEN: Shuffle/drag/pool validation calls this.
 * HOW / RESULT: IDs keep matching independent of translated picture names.
 */
const pictureItemKey = (item) => item && typeof item === "object" ? item.id || item.image || item.alt : item;
/*
 * FUNCTION: shuffleIntoDifferentOrder
 * Shuffle a copied picture sequence and avoid returning the identical order when possible.
 * WHEN: Picture setup and Start over call this.
 * HOW / RESULT: If the shuffle is unchanged, rotates the sequence; it does not mutate authored
 * questions.
 */
const shuffleIntoDifferentOrder = (items) => {
  const source = [...items];
  if (source.length < 2) return source;
  let shuffled = shuffleArray(source);
  const unchanged = shuffled.every((item, index) => pictureItemKey(item) === pictureItemKey(source[index]));
  if (unchanged) shuffled = [...shuffled.slice(1), shuffled[0]];
  return shuffled;
};

const PATTERN_HOW_TO_PLAY_VIDEO = "https://youtu.be/uAqYnG7B0w8";
/*
 * REWARD CONSTANT: Each correctly checked improvement question adds five reward stars.
 * score still increases by one correct answer. Backend uses the same five-star rule;
 * the save response reconciles the displayed running total with persisted progress.
 */
const STARS_PER_CORRECT = 5;


/*
 * FUNCTION / COMPONENT: ImprovementPage
 * React renders this component when its parent uses <ImprovementPage /> or when its state/props
 * change.
 * This component has no explicit props; its body shows the hooks or fixed values it uses.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export default function ImprovementPage() {
  // VIVA: URL parameters choose the grade, level and game; React state below
  // holds this attempt, while savedProgress comes from the backend.
  const { grade, levelNumber, subCategoryKey } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("wm");

  /*
   * REMEMBER: profile
   * Student identity, name and grade. An API/cache fills it; navigation and attempt saving read the
   * student ID/grade.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [profile, setProfile] = useState(() => readSessionCache(WM_PROFILE_CACHE));
  /*
   * REMEMBER: accessState
   * Access check outcome: checking, allowed, connection error, screening required or locked. It selects
   * the loading/error/game return branch.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [accessState, setAccessState] = useState("checking");
  /*
   * REMEMBER: accessRetry
   * Retry counter for a failed access request. Changing it reruns the access effect with a refreshed
   * request.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [accessRetry, setAccessRetry] = useState(0);
  /*
   * REMEMBER: savedProgress
   * Backend progress used to confirm completions and unlocks. It is separate from the current local
   * attempt score.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [savedProgress, setSavedProgress] = useState(null);
  /*
   * REMEMBER: progressLoading
   * Whether an already-saved attempt is refreshing progress. This is separate from saving the attempt
   * again.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [progressLoading, setProgressLoading] = useState(false);
  /*
   * REMEMBER: progressError
   * Whether progress refresh failed. It enables retrying the read without awarding the same attempt
   * again.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [progressError, setProgressError] = useState(false);
  /*
   * REMEMBER: progressRefreshRef
   * The in-flight progress-read promise. Reusing it prevents duplicate refresh requests; cleanup clears
   * it.
   * Changing .current is immediate and does not cause a render.
   */
  const progressRefreshRef = useRef(null);
  /*
   * REMEMBER: levelHistory
   * Saved attempts for the level, used to total recorded rewards on result screens. History refresh
   * replaces it.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [levelHistory, setLevelHistory] = useState(null);
  /*
   * REMEMBER: historyLoading
   * Whether recorded attempt history is being fetched. Result screens show a loading message while it is
   * true.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [historyLoading, setHistoryLoading] = useState(false);
  /*
   * REMEMBER: historyError
   * Whether attempt-history loading failed. Result screens show unavailable/retry instead of invented
   * star totals.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [historyError, setHistoryError] = useState(false);
  /*
   * REMEMBER: historyRefreshRef
   * The in-flight history-read promise. It prevents duplicate history fetches for the current attempt.
   * Changing .current is immediate and does not cause a render.
   */
  const historyRefreshRef = useRef(null);
  /*
   * REMEMBER: phase
   * The current study/listening/answer/feedback stage. Event handlers and timers change it; the view
   * chooses which controls to display.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [phase, setPhase] = useState("video"); // 'video' | 'intro' | 'show' | 'countdown' | 'answer' | 'feedback' | 'result'
  /*
   * REMEMBER: subCatData
   * Selected game metadata and full question pool for this grade/level/language. The bank-loading effect
   * sets it.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [subCatData, setSubCatData] = useState(null);
  /*
   * REMEMBER: questions
   * Questions selected for the current improvement attempt. startQuiz selects up to five and currentIdx
   * chooses the active one.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [questions, setQuestions] = useState([]);
  /*
   * REMEMBER: currentIdx
   * Zero-based improvement question index. Next advances it after feedback; the tracker displays
   * currentIdx + 1.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [currentIdx, setCurrentIdx] = useState(0);
  /*
   * REMEMBER: score
   * Number of correctly answered improvement questions. Correct answers add one; this is not the
   * five-stars-per-answer reward.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [score, setScore] = useState(0);
  /*
   * REMEMBER: results
   * Recorded responses for this session (or fetched report records in report views). Rendering/scoring
   * reads this list; recording/loading replaces it.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [results, setResults] = useState([]);
  // VIVA: Refs change synchronously without rendering. These guards prevent
  // rapid repeated clicks from answering, advancing or saving the same attempt twice.
  /*
   * REMEMBER: latestResultRef
   * Most recently evaluated answer record, stored immediately without waiting for a React render.
   * Changing .current is immediate and does not cause a render.
   */
  const latestResultRef = useRef(null);
  /*
   * REMEMBER: answeredQuestionRef
   * Whether this question already accepted an answer. It is reset in setupQuestion and blocks duplicate
   * submissions.
   * Changing .current is immediate and does not cause a render.
   */
  const answeredQuestionRef = useRef(false);
  /*
   * REMEMBER: nextTransitionRef
   * Whether Next already started a transition. It blocks rapid double-clicks until setupQuestion resets
   * it.
   * Changing .current is immediate and does not cause a render.
   */
  const nextTransitionRef = useRef(false);
  /*
   * REMEMBER: previousQuestionIdsRef
   * IDs from the last selected attempt. Question selection prefers different questions when the pool
   * permits it.
   * Changing .current is immediate and does not cause a render.
   */
  const previousQuestionIdsRef = useRef([]);
  /*
   * REMEMBER: undoHistoryRef
   * Snapshots of both picture slots and pool. Undo restores a consistent arrangement without
   * losing/duplicating a picture.
   * Changing .current is immediate and does not cause a render.
   */
  const undoHistoryRef = useRef([]);
  /*
   * REMEMBER: submissionStartedRef
   * Whether final-question completion has begun. It prevents starting the final save path twice.
   * Changing .current is immediate and does not cause a render.
   */
  const submissionStartedRef = useRef(false);
  /*
   * REMEMBER: saveAttemptInFlightRef
   * Whether an attempt POST is currently running. It blocks duplicate saves/restarts during that
   * request.
   * Changing .current is immediate and does not cause a render.
   */
  const saveAttemptInFlightRef = useRef(false);
  /*
   * REMEMBER: savedAttemptRef
   * Whether this attempt already saved successfully. Refresh retries must not POST and award it again.
   * Changing .current is immediate and does not cause a render.
   */
  const savedAttemptRef = useRef(false);
  /*
   * REMEMBER: attemptGenerationRef
   * Attempt version counter. Late responses from an older attempt are ignored after replay or
   * route/language reload.
   * Changing .current is immediate and does not cause a render.
   */
  const attemptGenerationRef = useRef(0);
  /*
   * REMEMBER: wordsSpeechTimeoutRef
   * Pending pause between spoken picture names. setupQuestion/cleanup can cancel the timeout.
   * Changing .current is immediate and does not cause a render.
   */
  const wordsSpeechTimeoutRef = useRef(null);
  /*
   * REMEMBER: numbersReadyStartedRef
   * Synchronous guard preventing more than one Ready event from starting the same number reveal.
   * Changing .current is immediate and does not cause a render.
   */
  const numbersReadyStartedRef = useRef(false);
  /*
   * REMEMBER: earnedStars
   * Stars earned in this attempt, five for each correct answer. startQuiz resets this; saved response
   * later confirms the reward.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [earnedStars, setEarnedStars] = useState(0);
  /*
   * REMEMBER: lastStarReward
   * Reward for the latest answer: five or zero. Feedback displays this number beside decorative stars.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [lastStarReward, setLastStarReward] = useState(0);
  /*
   * REMEMBER: totalStars
   * Displayed accumulated WM reward total, seeded from cache and reconciled with the server after
   * saving.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [totalStars, setTotalStars] = useState(() =>
    readTotalStars(readSessionCache(WM_PROGRESS_CACHE) ?? readSessionCache(WM_PROFILE_CACHE))
  );

  // Timing states
  /*
   * REMEMBER: timerCount
   * Seconds remaining in the reveal stage. The timer effect decreases it and the timer component
   * displays it.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [timerCount, setTimerCount] = useState(0);
  /*
   * REMEMBER: timerMax
   * Initial reveal duration used to draw the timer bar as a fraction of the full time.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [timerMax, setTimerMax] = useState(15);
  /*
   * REMEMBER: questionStartTime
   * performance.now timestamp set in setupQuestion. Improvement question time includes
   * Ready/study/listening and recall.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [questionStartTime, setQuestionStartTime] = useState(null);
  /*
   * REMEMBER: totalStartTime
   * performance.now timestamp for the whole improvement attempt. Saving converts elapsed milliseconds to
   * seconds.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [totalStartTime, setTotalStartTime] = useState(null);
  const { muted } = useMemoryMusic();
  const soundEnabled = !muted;

  // Drag and drop slots state
  /*
   * REMEMBER: slots
   * The student answer positions. Taps/drops/Undo update them; Submit compares the completed sequence
   * with the authored answer.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [slots, setSlots] = useState([]);
  /*
   * REMEMBER: dragPool
   * Currently available choices/pictures. Placing a picture removes it; digits remain reusable for
   * repeated numbers.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [dragPool, setDragPool] = useState([]);
  /*
   * REMEMBER: activeStepIdx
   * Legacy instruction-step index retained by the shared controller/timer conditions; current
   * InstructionsGame owns its listening status.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [activeStepIdx, setActiveStepIdx] = useState(-1);

  // Words Subcategory states (Card Pack Theme)
  /*
   * REMEMBER: cardsFlipped
   * Retained picture animation flag: becomes true shortly after reveal starts and resets for recall.
   * The current picture view derives its displayed scene from phase and Ready props.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [cardsFlipped, setCardsFlipped] = useState(false);
  /*
   * REMEMBER: wordsAwaitingPlay
   * Whether Picture Memory is waiting for Ready. The reveal timer stays stopped until startWordsMemory
   * clears it.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [wordsAwaitingPlay, setWordsAwaitingPlay] = useState(false);
  /*
   * REMEMBER: numbersAwaitingPlay
   * Whether Number Memory is waiting for Ready. handleNumbersReady clears it and starts the
   * level-duration reveal.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [numbersAwaitingPlay, setNumbersAwaitingPlay] = useState(false);
  /*
   * REMEMBER: deckRevealed
   * Retained deck-interaction state used by controller callbacks. The current PictureMemoryGame displays
   * a visible pool instead of a deck stack.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [deckRevealed, setDeckRevealed] = useState(false);
  /*
   * REMEMBER: selectedSlotIndex
   * Picture slot selected for clearing or swapping. Slot taps/drops update it and CSS highlights the
   * selected position.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
  /*
   * REMEMBER: draggedItem
   * Source, index and value for an HTML drag gesture. Drop can read this state or the dataTransfer
   * payload.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [draggedItem, setDraggedItem] = useState(null);

  // HTML5 Drag & Drop and Slot Swap Handlers
  /*
   * FUNCTION: handleDragStart
   * Remember the drag source/index/value and write the browser drag payload.
   * WHEN: A draggable MemoryPicture calls this.
   * HOW / RESULT: Drop handlers can recover the item from state or dataTransfer.
   */
  const handleDragStart = (e, source, index, value) => {
    setDraggedItem({ source, index, value });
    if (e?.dataTransfer) {
      e.dataTransfer.setData("text/plain", JSON.stringify({ source, index, value }));
      e.dataTransfer.effectAllowed = "move";
    }
  };

  /*
   * FUNCTION: handleDragOver
   * Allow a drop target to accept the dragged picture.
   * WHEN: The answer slot drag-over event calls this.
   * HOW / RESULT: preventDefault enables dropping; dropEffect requests a move cursor.
   */
  const handleDragOver = (e) => {
    e.preventDefault();
    if (e?.dataTransfer) {
      e.dataTransfer.dropEffect = "move";
    }
  };

  /*
   * FUNCTION: handleDropOnSlot
   * Place or swap a dragged picture in a recall slot.
   * WHEN: An answer slot drop event calls this.
   * HOW / RESULT: Validates phase/source, remembers Undo state, swaps occupied slots or exchanges a pool
   * item with the target, then clears selection.
   */
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
  /*
   * FUNCTION: handleDeckTap
   * Handle the retained deck-stack interaction.
   * WHEN: Passed through ActivityScreen as a callback; current PictureMemoryGame renders a visible pool
   * instead.
   * HOW / RESULT: Can reveal the deck or place its top picture into an available/selected slot.
   */
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

  /*
   * FUNCTION: handlePlaceCardFromDeck
   * Move the retained deck top card into a target slot.
   * WHEN: Deck/slot controller callbacks can call this.
   * HOW / RESULT: Updates slots and pool together and clears deck/slot selection. Current picture view
   * uses the visible pool.
   */
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
  /*
   * REMEMBER: isCurrentCorrect
   * Correctness of the latest improvement answer. It chooses the feedback text, artwork and CSS state.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [isCurrentCorrect, setIsCurrentCorrect] = useState(null);
  /*
   * REMEMBER: lastUserAnswer
   * Latest submitted value/sequence. Answer/feedback views use it to keep the selected response visible.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [lastUserAnswer, setLastUserAnswer] = useState(null);

  // Backend submission status
  /*
   * REMEMBER: isSubmitting
   * Whether the attempt POST is running. Result actions are disabled and saving status is displayed
   * while true.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [isSubmitting, setIsSubmitting] = useState(false);
  /*
   * REMEMBER: submitResult
   * Data returned by a successful attempt POST. Continue requires this saved confirmation as well as a
   * passing score.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [submitResult, setSubmitResult] = useState(null);
  /*
   * REMEMBER: submissionError
   * Whether the attempt POST failed. Results expose Retry Saving without claiming an unlock was stored.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [submissionError, setSubmissionError] = useState(false);


  const isPatternGame = subCategoryKey === "pattern";


  /*
   * EFFECT: After React renders
   * Preload artwork before the child reaches its next screen; it changes download timing, not answers.
   * DEPENDENCIES: [levelNumber]. A changed dependency reruns the effect; its prior cleanup runs first.
   */
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

  /*
   * EFFECT: After React renders
   * Load saved student access/progress and ignore responses after leaving the screen.
   * DEPENDENCIES: [levelNumber, subCategoryKey, accessRetry]. A changed dependency reruns the effect;
   * its prior cleanup runs first.
   */
  useEffect(() => {
    let cancelled = false;
    /*
     * FUNCTION: checkAccess
     * Fetch the current student and saved screening/game access.
     * WHEN: The activity access effect runs this on route or retry changes.
     * HOW / RESULT: Caches the response, reads the selected game record and chooses allowed,
     * screening-required, locked or connection-error UI.
     */
    const checkAccess = async () => {
      // VIVA: Checking the direct activity URL also enforces the server's saved
      // screening/unlock state; hiding a locked button alone would be insufficient.
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

  /*
   * EFFECT: After React renders
   * Load the matching authored game bank and reset stale attempt requests after route/language changes.
   * DEPENDENCIES: [grade, levelNumber, subCategoryKey, i18n.language]. A changed dependency reruns the
   * effect; its prior cleanup runs first.
   */
  useEffect(() => {
    const currentLang = i18n.language?.startsWith("si") ? "si" : "en";
    // VIVA: Changing route/language loads the matching static bank and tutorial.
    // The generation number makes responses from an older attempt harmless.
    attemptGenerationRef.current += 1;
    saveAttemptInFlightRef.current = false;
    savedAttemptRef.current = false;
    progressRefreshRef.current = null;
    historyRefreshRef.current = null;
    setIsSubmitting(false);
    setProgressLoading(false);
    setHistoryLoading(false);
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

  /*
   * FUNCTION: handleSkipAndPlay
   * Start the improvement attempt from the tutorial.
   * WHEN: HowToPlay invokes this through onSkipAndPlay.
   * HOW / RESULT: Delegates to startQuiz; watching the video is not required for scoring access.
   */
  const handleSkipAndPlay = () => {
    startQuiz();
  };

  // Text-to-speech for instructions. Accepts an optional onEnd callback so callers
  // (e.g. the Instructions game) can chain utterances with a pause between them.
  /*
   * FUNCTION: speakText
   * Read text with the current browser language voice and optional completion callback.
   * WHEN: Game headings/listening and picture-name playback call this.
   * HOW / RESULT: Cleans decorative symbols and chooses voice/rate. A backup completion timer protects
   * callers if browser end events do not arrive.
   */
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
      // Some browsers never fire onend (or drop an utterance spoken right after
      // cancel()), which would leave the Instructions game waiting forever. A
      // backup timer sized to the text finishes the step once, whichever is first.
      let finished = false;
      const finish = () => { if (finished) return; finished = true; window.clearTimeout(backup); onEnd(); };
      const backup = window.setTimeout(finish, 2500 + cleanText.length * 110 / utterance.rate);
      utterance.onend = finish;
      utterance.onerror = finish;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Speak picture names without displaying them. Each name starts one second
  // after the previous name finishes so the sequence is easy to distinguish.
  /*
   * FUNCTION: speakPictureNames
   * Speak picture names in order with a pause between names.
   * WHEN: startWordsMemory calls this during the study reveal.
   * HOW / RESULT: Uses each object alt/id and stores the next timeout so question cleanup can stop it.
   */
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
  /*
   * FUNCTION: startQuiz
   * Create or replay a fresh improvement attempt.
   * WHEN: Skip & Play and Play Again call this.
   * HOW / RESULT: Resets question/result/reward/save guards, selects up to five questions, records the
   * attempt start time and calls setupQuestion.
   */
  const startQuiz = () => {
    if (saveAttemptInFlightRef.current) return;
    attemptGenerationRef.current += 1;
    progressRefreshRef.current = null;
    historyRefreshRef.current = null;
    setProgressLoading(false);
    setProgressError(false);
    setHistoryLoading(false);
    setHistoryError(false);
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
    setIsSubmitting(false);
    setTotalStartTime(performance.now());
    setSubmissionError(false);
    setupQuestion(0, attempt);
  };

  /*
   * FUNCTION: handleInstructionReady
   * Change from the listening scene to recall choices.
   * WHEN: InstructionsGame Show question calls this after playback finishes.
   * HOW / RESULT: Sets phase to answer; tapping a recall choice then evaluates immediately.
   */
  const handleInstructionReady = () => {
    setPhase("answer");
  };

  // Timer configuration based on levels for standard games
  /*
   * FUNCTION: getDisplayTime
   * Read the configured reveal duration for this level.
   * WHEN: Question setup/number Ready logic calls this.
   * HOW / RESULT: Returns seconds from gameConfig; Picture Memory has its own ten-second reveal.
   */
  const getDisplayTime = () => {
    return getLevelDisplaySeconds(levelNumber);
  };

  /*
   * FUNCTION: setupQuestion
   * Initialize one improvement question and its study/answer phase.
   * WHEN: startQuiz and Next call this with the target index.
   * HOW / RESULT: Cancels old speech, resets guards/feedback/Undo, builds answer slots and choices, and
   * sets Pattern answer, Pictures Ready, Instructions listening or Numbers Ready.
   */
  const setupQuestion = (idx, questionSet = questions) => {
    // VIVA: Every question starts here. Pattern opens in answer phase; Pictures
    // and Numbers wait for Ready; Instructions waits for listening to finish.
    const q = questionSet[idx];
    if (!q) return;

    window.clearTimeout(wordsSpeechTimeoutRef.current);
    window.speechSynthesis.cancel();

    answeredQuestionRef.current = false;
    nextTransitionRef.current = false;
    latestResultRef.current = null;
    undoHistoryRef.current = [];
    setQuestionStartTime(performance.now());
    // VIVA: Improvement question time includes Ready, memorization/listening
    // and recall. Screening measures its answer period separately.
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
    // VIVA: The current Picture pool uses only the remembered pictures, even
    // when the bank supplies extra distractors. Numbers renders a fixed keypad.

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
  /*
   * FUNCTION: startWordsMemory
   * Begin the Picture Memory reveal after Ready.
   * WHEN: PictureMemoryGame Ready calls this.
   * HOW / RESULT: Requires the correct waiting phase, sets the ten-second timer, clears waiting state
   * and starts ordered picture speech.
   */
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

  /*
   * FUNCTION: handleNumbersReady
   * Begin the Number Memory reveal exactly once.
   * WHEN: NumberMemoryGame Ready calls this.
   * HOW / RESULT: Uses a synchronous guard, sets this level timer and clears numbersAwaitingPlay; timer
   * expiry later opens recall.
   */
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
  /*
   * EFFECT: After React renders
   * Synchronize this component with browser state or external work after rendering; the existing
   * callback shows the exact side effects.
   * DEPENDENCIES: [phase, currentIdx, subCategoryKey, wordsAwaitingPlay]. A changed dependency reruns
   * the effect; its prior cleanup runs first.
   */
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
  /*
   * EFFECT: After React renders
   * Run the reveal countdown and switch to recall when it expires; clear scheduled timers when
   * dependencies change.
   * DEPENDENCIES: [phase, timerCount, currentIdx, levelNumber, subCategoryKey, isPatternGame,
   * activeStepIdx, wordsAwaitingPlay, numbersAwaitingPlay, questions]. A changed dependency reruns the
   * effect; its prior cleanup runs first.
   */
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

  /*
   * FUNCTION: handleTileClick
   * Put a selected picture/digit into the first empty answer slot.
   * WHEN: Picture pool or Number keypad calls this.
   * HOW / RESULT: Requires answer phase. Pictures leave the pool; digits remain reusable so repeated
   * numbers can be recalled.
   */
  const handleTileClick = (val) => {
    // VIVA: Tapping a picture/digit fills the first empty answer slot. Pictures
    // leave their pool; digits remain reusable so repeated numbers can be entered.
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

  /*
   * FUNCTION: handleSlotClear
   * Clear one chosen answer slot and return a movable item to the pool.
   * WHEN: Slot selection/clear interactions call this.
   * HOW / RESULT: Remembers Undo state and resets the selected slot; answering after feedback is
   * blocked.
   */
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

  /*
   * FUNCTION: handleSlotClick
   * Select, clear or swap picture recall positions.
   * WHEN: A picture answer slot calls this on click or keyboard activation.
   * HOW / RESULT: A second slot click exchanges positions; clicking the selected slot clears it.
   * Retained deck state can also place a card.
   */
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
  /*
   * FUNCTION: rememberArrangement
   * Store an Undo snapshot of both slots and picture pool.
   * WHEN: Arrangement-changing handlers call this before editing.
   * HOW / RESULT: Copies both arrays so Undo can restore all pictures together.
   */
  const rememberArrangement = () => { undoHistoryRef.current.push({ slots: [...slots], pool: [...dragPool] }); };
  /*
   * FUNCTION: handleUndo
   * Undo the current recall input.
   * WHEN: The game Undo button calls this.
   * HOW / RESULT: Numbers clears the last filled slot; Pictures restores the previous slots/pool
   * snapshot. Only answer phase accepts the action.
   */
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
  /*
   * FUNCTION: handleStartOver
   * Reset the picture arrangement for this question.
   * WHEN: Retained Start over UI branch calls this; supported level views currently hide that extra
   * button.
   * HOW / RESULT: Stores an Undo snapshot, empties the answer positions and reshuffles the correct
   * pictures.
   */
  const handleStartOver = () => {
    if (phase !== "answer" || answeredQuestionRef.current) return;
    rememberArrangement();
    setSlots(Array(questions[currentIdx].correct.length).fill(""));
    setDragPool(shuffleIntoDifferentOrder(questions[currentIdx].correct));
    setSelectedSlotIndex(null);
  };

  /*
   * FUNCTION: handleDragSubmit
   * Check a fully filled recall sequence.
   * WHEN: Picture/Number Submit calls this.
   * HOW / RESULT: Rejects empty/duplicate submissions, runs evaluateDragAnswer, then delegates to
   * evaluateAnswer.
   */
  const handleDragSubmit = () => {
    const q = questions[currentIdx];
    if (!q || phase !== "answer" || answeredQuestionRef.current || slots.length === 0 || slots.some((s) => s === "" || s === null)) {
      return;
    }

    const isCorrect = evaluateDragAnswer(subCategoryKey, slots, q);

    const answerToStore = subCategoryKey === "instructions" ? slots[0] : slots;
    evaluateAnswer(answerToStore, isCorrect);
  };

  // Instructions game recall step: the child taps one option and gets immediate feedback
  // (no drag-and-drop, no intermediate submit step).
  /*
   * FUNCTION: handleInstructionAnswer
   * Check the tapped listening recall choice immediately.
   * WHEN: An Instructions answer button calls this.
   * HOW / RESULT: Compares the choice with q.correct, then delegates to evaluateAnswer.
   */
  const handleInstructionAnswer = (selectedOption) => {
    const q = questions[currentIdx];
    if (!q) return;
    evaluateAnswer(selectedOption, selectedOption === q.correct);
  };

  // Record one answer and show its existing feedback and star reward.
  /*
   * FUNCTION: evaluateAnswer
   * Record one improvement response and display correct/incorrect feedback.
   * WHEN: All four game answer handlers converge here.
   * HOW / RESULT: Blocks duplicate answers, records elapsed milliseconds, adds one score/five stars when
   * correct and appends the result for the later save.
   */
  const evaluateAnswer = (userAnswer, isCorrect) => {
    // VIVA: All four games meet here: record one response, show feedback and
    // award five displayed stars per correct answer. The score counts questions.
    const q = questions[currentIdx];
    if (!q || phase !== "answer" || answeredQuestionRef.current) return;
    answeredQuestionRef.current = true;
    playMemoryFeedbackSound(isCorrect);
    const endTime = performance.now();
    const timeTaken = Math.round(endTime - questionStartTime);

    setIsCurrentCorrect(isCorrect);
    setLastUserAnswer(userAnswer);
    setPhase("feedback");

    if (isCorrect) {
      setEarnedStars((prev) => prev + STARS_PER_CORRECT);
      setTotalStars((prev) => prev + STARS_PER_CORRECT);
      setLastStarReward(STARS_PER_CORRECT);
      setScore((prev) => prev + 1);
    } else {
      setLastStarReward(0);
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
  /*
   * FUNCTION: handleNextQuestion
   * Advance after feedback or finish and save the attempt.
   * WHEN: Next or See results calls this.
   * HOW / RESULT: A synchronous transition guard prevents skipping questions. The final step opens
   * result phase and calls handleCompleteQuiz once.
   */
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
  /*
   * FUNCTION: handleRetryProgress
   * Refresh saved progress without posting the attempt again.
   * WHEN: Successful saves and Refresh Progress controls call this.
   * HOW / RESULT: Shares one in-flight request and ignores stale attempt responses; failure changes
   * progressError only.
   */
  const handleRetryProgress = () => {
    if (progressRefreshRef.current) return progressRefreshRef.current;
    const generation = attemptGenerationRef.current;
    setProgressLoading(true);
    setProgressError(false);
    const request = getWorkingMemoryAccess({ refresh: true }).then(({ profile: student, progress }) => {
      if (generation !== attemptGenerationRef.current) return progress;
      setProfile(student);
      setSavedProgress(progress);
      sessionStorage.setItem(WM_PROFILE_CACHE, JSON.stringify(student));
      sessionStorage.setItem(WM_PROGRESS_CACHE, JSON.stringify(progress));
      setTotalStars(readTotalStars(progress));
      return progress;
    }).catch(() => {
      if (generation === attemptGenerationRef.current) setProgressError(true);
      return null;
    }).finally(() => {
      if (progressRefreshRef.current === request) {
        setProgressLoading(false);
        progressRefreshRef.current = null;
      }
    });
    progressRefreshRef.current = request;
    return request;
  };

  /*
   * FUNCTION: handleRetryLevelHistory
   * Fetch recorded attempts for the current level.
   * WHEN: Successful final-game/final-level saves and history Retry call this.
   * HOW / RESULT: Totals can be shown from real history; errors set historyError and never invent
   * recorded rewards.
   */
  const handleRetryLevelHistory = () => {
    if (historyRefreshRef.current) return historyRefreshRef.current;
    const generation = attemptGenerationRef.current;
    const studentId = profile?._id || localStorage.getItem("studentId");
    if (!studentId) {
      setHistoryError(true);
      return Promise.resolve(null);
    }
    setHistoryLoading(true);
    setHistoryError(false);
    const request = getAttemptHistory(studentId, Number(levelNumber)).then((response) => {
      if (response?.success === false || !Array.isArray(response?.data)) throw new Error("Attempt history unavailable");
      if (generation === attemptGenerationRef.current) setLevelHistory(response.data);
      return response.data;
    }).catch(() => {
      if (generation === attemptGenerationRef.current) setHistoryError(true);
      return null;
    }).finally(() => {
      if (historyRefreshRef.current === request) {
        setHistoryLoading(false);
        historyRefreshRef.current = null;
      }
    });
    historyRefreshRef.current = request;
    return request;
  };

  // Save through the existing API; its response controls saved progression.
  /*
   * FUNCTION: handleCompleteQuiz
   * POST the completed improvement attempt and reconcile saved rewards/progress.
   * WHEN: Final Next or Retry Saving calls this.
   * HOW / RESULT: Sends score, question results and total seconds. Successful save sets submitResult,
   * then independent progress/history reads refresh the dashboard without repeating the POST.
   */
  const handleCompleteQuiz = async (finalScore, finalResults) => {
    // VIVA: One POST stores the whole attempt. questionResults.timeTaken is
    // milliseconds; totalTimeTaken below is seconds across the complete attempt.
    if (saveAttemptInFlightRef.current || savedAttemptRef.current) return;
    const generation = attemptGenerationRef.current;
    const totalTimeTaken = Math.round((performance.now() - totalStartTime) / 1000);
    const studentId = profile?._id || localStorage.getItem("studentId");

    if (!studentId) {
      console.warn("No studentId found for submitting improvement attempt.");
      setSubmissionError(true);
      setIsSubmitting(false);
      return;
    }

    saveAttemptInFlightRef.current = true;
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

      if (generation !== attemptGenerationRef.current) return;
      if (res?.success === false || !res?.data) throw new Error("Improvement attempt was not saved");
      setSubmitResult(res.data);
      savedAttemptRef.current = true;
      if (res.data?.progress) sessionStorage.setItem(WM_PROGRESS_CACHE, JSON.stringify(res.data.progress));
      if (res.data?.progress) setSavedProgress(res.data.progress);
      if (Number.isFinite(res.data?.totalStars ?? res.data?.totalCarrots)) {
        setTotalStars(readTotalStars(res.data));
      }
      // The POST is saved already. Refreshes have separate loading/error states
      // and must not leave a completed attempt stuck on "Saving".
      void handleRetryProgress();
      if (subCategoryKey === "numbers" || Number(levelNumber) === 4) void handleRetryLevelHistory();
    } catch (err) {
      if (generation === attemptGenerationRef.current) setSubmissionError(true);
      console.error("Error saving improvement attempt:", err);
    } finally {
      if (generation === attemptGenerationRef.current) {
        saveAttemptInFlightRef.current = false;
        setIsSubmitting(false);
      }
    }
  };

  /*
   * FUNCTION: handleBackToLevels
   * Return to this level game menu.
   * WHEN: Header Back and result return buttons call this.
   * HOW / RESULT: Navigates to the map with ?level= so the selected menu can reopen.
   */
  const handleBackToLevels = () => {
    navigate(`/improvement-wm/${grade}?level=${levelNumber}`);
  };

  /*
   * FUNCTION: handleNextSubCategory
   * Continue after a saved pass to the next activity or level summary.
   * WHEN: The result Continue button calls this.
   * HOW / RESULT: Requires at least three correct and saved confirmation. Numbers checks saved level
   * completion; other games follow SUBCATEGORY_ORDER.
   */
  const handleNextSubCategory = () => {
    // VIVA: A saved pass (at least 3 correct) permits continuation. After Numbers,
    // saved level completion decides whether to show the four-game overview.
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
    // VIVA: Connection failure renders retry and return-to-levels controls here.
    const isSinhala = i18n.language?.startsWith("si");
    return (
      /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <main className="min-h-screen flex items-center justify-center bg-sky-100 p-6 text-center">
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
    // VIVA: The screening-required notice and screening navigation are here.
    return (
      /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <div className="min-h-screen flex flex-col items-center justify-center bg-sky-100 p-6 text-center">
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
    // VIVA: Direct links to a locked game display this return-to-levels notice.
    return (
      /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <div className="min-h-screen flex flex-col items-center justify-center bg-sky-100 p-6 text-center">
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
      /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center">
        <div className="w-20 h-20 border-8 border-white border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-emerald-700 font-black text-2xl animate-pulse">{t("getting_ready")}</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  // Props shared by every game (video/header/result phases, submission state, etc.)
  /*
 * DATA TO THE VIEW: This props object passes controller state and named callbacks downward.
 * ActivityScreen reads phase to choose tutorial/game/results, then passes the same game
 * state to the selected child. A child calls a callback to ask the controller to change
 * state. This keeps timers, scoring and persistence consistent across the four games.
 */
const sharedProps = {
    // VIVA: Props pass controller state and callbacks down to ActivityScreen;
    // game components invoke these callbacks instead of owning saved progress.
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

  // VIVA: ActivityScreen renders the tutorial, current game, feedback or results.
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <ActivityScreen {...sharedProps} cardsFlipped={cardsFlipped} selectedSlotIndex={selectedSlotIndex} deckRevealed={deckRevealed} handleDeckTap={handleDeckTap} />;
}
