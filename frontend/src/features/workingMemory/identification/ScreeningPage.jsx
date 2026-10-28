/*
 * FILE PURPOSE
 * Page controller for the Working Memory screening, including its demo and real test.
 *
 * HOW IT CONNECTS
 * App.jsx opens /working-memory/:grade. ScreeningIntro supplies welcome/rules screens;
 * ScreeningQuestions displays each question; ScreeningResults displays calculated metrics. identifyApi
 * saves the real test.
 * Direct source importers: ../../../App.jsx.
 * Local feature/style dependencies: ../shared/ScreeningResults.jsx, data/index.js,
 * ../services/identifyApi.js, ../logic/answerChecking.js, ../logic/scoring.js, ScreeningIntro.jsx,
 * ScreeningQuestions.jsx.
 *
 * THINGS TO REMEMBER
 * The grade and language select QUIZ_DATA. Entry screens and question phases are separate. A real
 * answer advances automatically; screening has no separate Next button. Demo answers are not saved.
 * Styles are in identification.css and identificationScreens.css.
 */

// VIVA: Screening controller: entry screens, question phases, scoring and saving.
import ScreeningResults from "../shared/ScreeningResults";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { QUIZ_DATA } from "./data";
import { saveWorkingMemoryResult } from "../services/identifyApi";
import { evaluateIdentifyAnswer } from "../logic/answerChecking.js";
import { calculateWorkingMemoryMetrics } from "../logic/scoring.js";
import { stopAllAudio } from "../../../utils/phonologicalAwareness/audio";
import { WelcomeScreen, BriefingScreen, DemoCompleteScreen } from "./ScreeningIntro";
import { ScreeningQuestionScreen, ScreeningPicture } from "./ScreeningQuestions";

/*
 * DATA / TIMING: Grade-specific screening study windows in milliseconds.
 * Picture and Number Memory use 8000/7000/6000 ms for Grades 2/3/4.
 * Answer timing starts after this study period, not when the study image first appears.
 */
const MEMORIZATION_DURATIONS_MS = {
  "2": 8000,
  "3": 7000,
  "4": 6000,
};

/*
 * ASSETS: Map authored English/Sinhala picture names to shared object PNG filenames.
 * PictureSequence combines each filename with /images/workingMemory/identification/objects/.
 * The map selects the artwork; .wm-screen__picture-* CSS determines size and placement.
 */
const wordToImageMap = {
  cat: "cat.png",
  ball: "ball.png",
  tree: "tree.png",
  sun: "sun.png",
  book: "book.png",
  fish: "fish.png",
  dog: "dog.png",
  cup: "cup.png",
  bottle: "bottle.png",
  bird: "bird.png",
  river: "river.png",
  home: "house.png",
  house: "house.png",
  "පූසා": "cat.png",
  "බෝලය": "ball.png",
  "ගස": "tree.png",
  "ඉර": "sun.png",
  "පොත": "book.png",
  "මාළුවා": "fish.png",
  "බල්ලා": "dog.png",
  "කෝප්පය": "cup.png",
  "බෝතලය": "bottle.png",
  "කුරුල්ලා": "bird.png",
  "ගඟ": "river.png",
  "ගෙදර": "house.png",
};

const DEMO_CATEGORIES = ["Pattern", "Picture Memory", "Number Memory", "Instruction"];

/*
 * FUNCTION: getCategoryPrefix
 * Choose a translated preparation heading for the screening category.
 * WHEN: ScreeningPage calls this during study/listening and English read-aloud.
 * HOW / RESULT: Returns UI text without changing the question or expected answer.
 */
const getCategoryPrefix = (category, t) => {
  if (category === "Number Memory") return t("prep_memory_recall");
  if (category === "Picture Memory") return t("prep_picture_memory");
  if (category === "Instruction") return t("prep_instruction");
  if (category === "Pattern") return t("prep_pattern");
  return "";
};

/*
 * FUNCTION: isTimedMemoryQuestion
 * Identify Picture Memory and Number Memory study questions.
 * WHEN: Question setup and response recording call this.
 * HOW / RESULT: These categories get the grade-dependent reveal delay; Pattern and Instruction use
 * different phase rules.
 */
const isTimedMemoryQuestion = (question) =>
  question.category === "Picture Memory" || question.category === "Number Memory";

/*
 * FUNCTION: getPictureSequence
 * Split a comma-separated picture choice into item names.
 * WHEN: PictureSequence calls this before mapping names to image paths.
 * HOW / RESULT: Trims each name; rendering remains separate from correctness checks.
 */
const getPictureSequence = (option) => option.split(",").map((item) => item.trim());

/*
 * FUNCTION / COMPONENT: PictureSequence
 * Convert one comma-separated screening choice into a row of object images.
 * PROPS: sequence is the option string or joined study names supplied by ScreeningPage.
 * getPictureSequence splits names and wordToImageMap selects object PNG filenames.
 * RETURNS: .wm-screen__picture-strip with fitted ScreeningPicture children.
 * Rendering uses image paths; evaluateIdentifyAnswer separately checks the original choice.
 */
const PictureSequence = ({ sequence }) => (
  <div className="wm-screen__picture-strip">
    {getPictureSequence(sequence).map((word, index) => {
      const image = wordToImageMap[word] || wordToImageMap[word.toLowerCase()];
      return (
        /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <div className="wm-screen__picture-item" key={`${word}-${index}`}>
          {image && <ScreeningPicture src={`/images/workingMemory/identification/objects/${image}`} alt="" />}
        </div>
      );
    })}
  </div>
);

/*
 * FUNCTION: pickDemoQuestions
 * Choose two short practice questions from the demo category order.
 * WHEN: buildQuizSet calls this when demo mode has no explicit question IDs.
 * HOW / RESULT: Uses existing records rather than changing their question/answer data.
 */
const pickDemoQuestions = (data) => {
  const picked = [];
  for (const category of DEMO_CATEGORIES) {
    const match = data.find((question) => question.category === category);
    if (match && !picked.some((question) => question.id === match.id)) picked.push(match);
  }
  return picked.length >= 2 ? picked.slice(0, 2) : data.slice(0, 2);
};

// Real screening uses the full grade bank; practice uses the existing demo selection.
/*
 * FUNCTION: buildQuizSet
 * Select the authored grade/language screening bank or demo subset.
 * WHEN: The question-loading effect calls this after entry, grade, language or demo parameters change.
 * HOW / RESULT: Real mode returns the full source array; demo IDs filter it, otherwise
 * pickDemoQuestions chooses two.
 */
const buildQuizSet = (grade, language, sessionMode, idsParam) => {
  const source = QUIZ_DATA[grade]?.[language];
  if (!source) return [];

  const ids = idsParam?.split(",").filter(Boolean) ?? [];
  if (sessionMode !== "demo") return source;
  return ids.length ? source.filter((question) => ids.includes(question.id)) : pickDemoQuestions(source);
};

/*
 * FUNCTION / COMPONENT: ScreeningPage
 * React renders this component when its parent uses <ScreeningPage /> or when its state/props change.
 * This component has no explicit props; its body shows the hooks or fixed values it uses.
 * RETURN: The existing JSX below builds this part of the screen. See the file guide for its caller and
 * CSS.
 */
export default function ScreeningPage() {
  // VIVA: This controller separates entry screens (welcome/briefing/quiz) from
  // question phases (memorize/audio/answer) and demo sessions from saved tests.
  const { grade } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation(["wm", "common"]);
  const searchParams = new URLSearchParams(location.search);
  const urlDemoIds = searchParams.get("ids");
  const urlDemo = searchParams.get("demo") === "true";
  const skipIntro = Boolean(urlDemoIds);
  const gradeLabel = `${t("common:grade")} ${grade}`;

  /*
   * REMEMBER: entryPhase
   * Which entry screen is visible: welcome, briefing or quiz. Entry-button callbacks change it and
   * select the return branch.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [entryPhase, setEntryPhase] = useState(() => (skipIntro ? "quiz" : "welcome"));
  /*
   * REMEMBER: sessionMode
   * Whether this is an unsaved demo or a real screening. Start callbacks change it; saveResults saves
   * only real tests.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [sessionMode, setSessionMode] = useState(() => (skipIntro && urlDemo ? "demo" : "real"));
  /*
   * REMEMBER: quizData
   * The active grade/language question array. The loading effect fills it and the current index selects
   * its question.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [quizData, setQuizData] = useState([]);
  /*
   * REMEMBER: current
   * Zero-based screening question index. handleSubmit increases it; the board and tracker display the
   * next question.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [current, setCurrent] = useState(0);
  /*
   * REMEMBER: phase
   * The current study/listening/answer/feedback stage. Event handlers and timers change it; the view
   * chooses which controls to display.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [phase, setPhase] = useState("memorize");
  /*
   * REMEMBER: phaseQuestionId
   * Which screening question the phase belongs to. This prevents a new question briefly rendering with
   * the old question phase.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [phaseQuestionId, setPhaseQuestionId] = useState(null);
  /*
   * REMEMBER: results
   * Recorded responses for this session (or fetched report records in report views). Rendering/scoring
   * reads this list; recording/loading replaces it.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [results, setResults] = useState([]);
  /*
   * REMEMBER: finished
   * Whether all screening questions have been answered. The last submission turns it on and selects the
   * completion screen.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [finished, setFinished] = useState(false);
  /*
   * REMEMBER: answerStartTime
   * Start timestamp for the screening answer period. A ref stores it without rendering; reveal/listening
   * completion sets it before elapsed milliseconds are calculated.
   * Changing .current is immediate and does not cause a render.
   */
  const answerStartTime = useRef(null);
  // VIVA: These refs hold timing and duplicate-submission guards without an
  // extra render; results state is the list used to build the final payload.
  /*
   * REMEMBER: submittedQuestion
   * ID already submitted during screening. Synchronous ref updates prevent repeated taps from recording
   * one question twice.
   * Changing .current is immediate and does not cause a render.
   */
  const submittedQuestion = useRef(null);
  /*
   * REMEMBER: speechGeneration
   * Counter identifying the newest speech request. Old callbacks are ignored after another request or
   * cleanup.
   * Changing .current is immediate and does not cause a render.
   */
  const speechGeneration = useRef(0);
  /*
   * REMEMBER: audioState
   * Whether screening speech is idle, playing or unavailable. Speech callbacks update it; the view can
   * offer a manual Continue fallback.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [audioState, setAudioState] = useState("idle");
  /*
   * REMEMBER: saving
   * Whether screening POST is in progress. It shows saving feedback and blocks practice navigation until
   * saving finishes.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [saving, setSaving] = useState(false);
  /*
   * REMEMBER: saveError
   * Whether the last screening save failed. It shows Retry instead of pretending the attempt was stored.
   * Calling the setter schedules a React render so the dependent UI can update.
   */
  const [saveError, setSaveError] = useState(false);

  /*
   * FUNCTION: resetQuizState
   * Reset screening index, responses, completion, phase and answer timer.
   * WHEN: Demo/restart and real-start callbacks call this before showing questions.
   * HOW / RESULT: React renders a fresh session; no backend data is deleted.
   */
  const resetQuizState = () => {
    setCurrent(0);
    setResults([]);
    setFinished(false);
    setPhase("memorize");
    answerStartTime.current = null;
  };

  /*
 * FUNCTION: speak - the screening read-aloud helper, memoized with useCallback.
 * The language dependency keeps the function identity stable until language changes,
 * so the question effect does not restart simply because unrelated state rendered.
 * A speech-generation ref ignores callbacks from cancelled/older requests.
 * An instruction completes its audio phase through onEnd. If speech is unavailable,
 * audioState exposes the manual Continue path; the question is not silently scored.
 */
const speak = useCallback((text, { onEnd, onError, slow = true, english = false } = {}) => {
    if (!text) {
      onEnd?.();
      return;
    }

    const generation = ++speechGeneration.current;
    setAudioState("idle");
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      setAudioState("unavailable"); (onError || onEnd)?.(); return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    // The English read-aloud always uses an English voice; most browsers have no Sinhala voice.
    const speechLanguage = english ? "en" : i18n.language;
    utterance.lang = speechLanguage.startsWith("si") ? "si-LK" : "en-US";
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(item => item.lang.startsWith(speechLanguage)) || voices[0];
    if (voice) utterance.voice = voice;
    utterance.rate = slow ? 0.7 : 0.8;
    utterance.pitch = 1.3;
    utterance.onstart = () => { if (generation === speechGeneration.current) setAudioState("playing"); };
    const finish = unavailable => {
      if (generation !== speechGeneration.current) return;
      setAudioState(unavailable ? "unavailable" : "idle");
      if (unavailable) (onError || onEnd)?.();
      else onEnd?.();
    };
    utterance.onend = () => finish(false);
    utterance.onerror = () => finish(true);
    try { window.speechSynthesis.speak(utterance); } catch { finish(true); }
  }, [i18n.language]);

  /*
   * FUNCTION: startDemo
   * Start an unsaved screening demo.
   * WHEN: The welcome/demo completion button calls this.
   * HOW / RESULT: Resets local quiz state, sets demo mode and opens quiz entry.
   */
  const startDemo = () => {
    resetQuizState();
    setSessionMode("demo");
    setEntryPhase("quiz");
  };

  /*
   * FUNCTION: startBriefing
   * Show the real-test instructions before starting.
   * WHEN: Start Test or the demo-complete real-test action calls this.
   * HOW / RESULT: Sets real mode and briefing entry; answering has not started yet.
   */
  const startBriefing = () => {
    setSessionMode("real");
    setEntryPhase("briefing");
  };

  /*
   * FUNCTION: startRealQuiz
   * Begin the full real screening after instructions.
   * WHEN: The briefing Ready button calls this.
   * HOW / RESULT: Resets local state, sets real mode and opens quiz entry.
   */
  const startRealQuiz = () => {
    resetQuizState();
    setSessionMode("real");
    setEntryPhase("quiz");
  };

  /*
   * FUNCTION: speakBriefing
   * Read the translated overview and category instructions aloud.
   * WHEN: The briefing Listen button calls this.
   * HOW / RESULT: Joins UI translation strings and delegates to speak.
   */
  const speakBriefing = () => {
    speak(
      [
        t("identify_briefing_intro"),
        t("identify_briefing_flow"),
        t("identify_briefing_pattern"),
        t("identify_briefing_words"),
        t("identify_briefing_instructions"),
        t("identify_briefing_numbers"),
      ].join(" "),
    );
  };

  /*
   * EFFECT: After React renders
   * Synchronize or clean up speech/media for the active screen so old playback does not affect a new
   * question.
   * DEPENDENCIES: [] means mount once; a returned cleanup runs on unmount.
   */
  useEffect(() => () => { speechGeneration.current++; stopAllAudio(); }, []);

  /*
   * EFFECT: After React renders
   * Synchronize the displayed screening bank/phases with the selected session and question.
   * DEPENDENCIES: [entryPhase, grade, i18n.language, sessionMode, urlDemoIds]. A changed dependency
   * reruns the effect; its prior cleanup runs first.
   */
  useEffect(() => {
    if (entryPhase !== "quiz") {
      setQuizData([]);
      return;
    }

    const language = i18n.language?.startsWith("si") ? "si" : "en";
    const data = buildQuizSet(grade, language, sessionMode, urlDemoIds);
    if (!data.length) console.error(`No quiz data found for grade ${grade} and language ${language}`);
    setQuizData(data);
  }, [entryPhase, grade, i18n.language, sessionMode, urlDemoIds]);

  /*
   * EFFECT: After React renders
   * Synchronize or clean up speech/media for the active screen so old playback does not affect a new
   * question.
   * DEPENDENCIES: [current, finished, grade, quizData, speak]. A changed dependency reruns the effect;
   * its prior cleanup runs first.
   */
  useEffect(() => {
    if (!quizData.length || finished) return undefined;
    // VIVA: Each question resets speech and answer timing. Pictures/Numbers
    // reveal for 8/7/6 seconds by grade; Instructions waits for audio completion.

    const question = quizData[current];
    setPhaseQuestionId(question.id);
    answerStartTime.current = null;
    submittedQuestion.current = null;
    speechGeneration.current++;
    window.speechSynthesis?.cancel();
    setAudioState("idle");
    const cleanupSpeech = () => { speechGeneration.current++; window.speechSynthesis?.cancel(); };

    if (isTimedMemoryQuestion(question)) {
      setPhase("memorize");
      const timer = window.setTimeout(() => {
        answerStartTime.current = Date.now();
        setPhase("answer");
      }, MEMORIZATION_DURATIONS_MS[grade] ?? MEMORIZATION_DURATIONS_MS["2"]);
      return () => { window.clearTimeout(timer); cleanupSpeech(); };
    }

    if (question.category === "Instruction") {
      setPhase("audio");
      speak(question.text, {
        onError: () => {},
        onEnd: () => {
          answerStartTime.current = Date.now();
          setPhase("answer");
        },
      });
      return cleanupSpeech;
    }

    answerStartTime.current = Date.now();
    setPhase("answer");
    return cleanupSpeech;
  }, [current, finished, grade, quizData, speak]);

  /*
   * FUNCTION: saveResults
   * Save a real screening attempt with its per-question records and calculated metrics.
   * WHEN: The final answer or Retry Saving calls this; demo mode returns immediately.
   * HOW / RESULT: Sets saving/error state, POSTs through identifyApi and clears cached improvement
   * progress on success.
   */
  const saveResults = async (finalResults) => {
    // VIVA: Demo answers never reach the save API. Real tests send per-question
    // results plus calculated features; the backend can add an ML prediction.
    if (sessionMode !== "real") return;
    setSaving(true);
    setSaveError(false);
    try {
    await saveWorkingMemoryResult({
      studentId: localStorage.getItem("studentId"),
      grade,
      questionResults: finalResults,
      metrics: calculateWorkingMemoryMetrics(finalResults),
    });
    sessionStorage.removeItem("wm-progress-cache");
    } catch { setSaveError(true); } finally { setSaving(false); }
  };

  /*
   * FUNCTION: handleSubmit
   * Accept one screening answer, calculate correctness and append its record.
   * WHEN: ScreeningQuestionScreen calls onAnswer after an option tap.
   * HOW / RESULT: Records answer-only elapsed milliseconds and allocated study time. Advances
   * automatically or marks finished and saves the final responses.
   */
  const handleSubmit = async (userAnswer) => {
    // VIVA: A valid tap records correctness and answer-only elapsed milliseconds,
    // then advances automatically. The final question triggers one test save.
    const question = quizData[current];
    if (finished || submittedQuestion.current === question.id || (question.category !== "Pattern" && phase !== "answer")) return;
    submittedQuestion.current = question.id;
    speechGeneration.current++;
    window.speechSynthesis?.cancel();
    const now = Date.now();
    const timeTaken = answerStartTime.current ? Math.max(0, now - answerStartTime.current) : 0;
    const { isCorrect, errorType } = evaluateIdentifyAnswer(question, userAnswer);
    const memorizationTimeAllocated = isTimedMemoryQuestion(question)
      ? MEMORIZATION_DURATIONS_MS[grade] ?? MEMORIZATION_DURATIONS_MS["2"]
      : 0;

    const result = {
      questionId: question.id,
      category: question.category,
      isCorrect,
      timeTaken,
      memorizationTimeAllocated,
      userAnswer,
      correctAnswer: question.sequence || question.words || question.text || question.correct,
      errorType,
    };
    const updated = [...results, result];

    if (current < quizData.length - 1) {
      setResults(updated);
      setCurrent((value) => value + 1);
      return;
    }

    setResults(updated);
    setFinished(true);
    await saveResults(updated);
  };

  if (entryPhase === "welcome") {
    // VIVA: The opening demo/test choice cards are rendered here.
    return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <WelcomeScreen gradeLabel={gradeLabel} t={t} onBack={() => navigate("/dashboard")} onTryDemo={startDemo} onStartTest={startBriefing} />;
  }

  if (entryPhase === "briefing") {
    // VIVA: The rules board appears before the real screening starts.
    return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <BriefingScreen gradeLabel={gradeLabel} t={t} onBack={() => { stopAllAudio(); setEntryPhase("welcome"); }} onClose={() => { stopAllAudio(); navigate("/dashboard"); }} onListen={speakBriefing} onReady={() => { stopAllAudio(); startRealQuiz(); }} />;
  }

  if (entryPhase === "quiz" && !quizData.length) {
    return (
      /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-400 to-emerald-300">
        <div className="w-24 h-24 border-8 border-white border-t-sky-500 rounded-full animate-spin mb-4" />
        <p className="text-white font-black text-2xl animate-pulse">{t("checking_access")}</p>
      </div>
    );
  }

  if (finished && sessionMode === "demo" && !skipIntro) {
    return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <DemoCompleteScreen t={t} onStartReal={startBriefing} onTryAgain={startDemo} onBackHome={() => navigate("/dashboard")} />;
  }

  if (finished) {
    // VIVA: The completed test's score, recommendations and navigation are here.
    // VIVA: Scoring is a pure calculation, so display and save use the same
    // metrics. Improvement navigation is disabled while saving or after failure.
    return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <ScreeningResults
      metrics={calculateWorkingMemoryMetrics(results)} responses={results} total={quizData.length} t={t}
      saving={saving} saveError={saveError} onRetry={() => saveResults(results)}
      onPractice={key => navigate(`/improvement-wm/${grade}${key ? `?recommended=${key}` : ""}`)}
      onReplay={() => window.location.reload()} onHome={() => navigate("/dashboard")}
    />;
  }

  const question = quizData[current];
  const isInstruction = question.category === "Instruction";
  // Never render the previous question's recall state for a new stimulus.
  const questionPhase = phaseQuestionId === question.id ? phase
    : isInstruction ? "audio" : question.category === "Pattern" ? "answer" : "memorize";
  const heading = questionPhase === "answer" ? (question.category === "Picture Memory" ? t("screen_picture_recall") : question.category === "Number Memory" ? t("screen_number_recall") : question.instruction)
    : isInstruction ? t("screen_remember_steps") : getCategoryPrefix(question.category, t);
  /*
   * FUNCTION: listenToQuestion
   * Read the current safe heading or replay instruction speech.
   * WHEN: The screening Listen control calls this.
   * HOW / RESULT: During instruction audio, speech completion starts answer timing. It does not reveal a
   * hidden picture/number sequence during recall.
   */
  const listenToQuestion = () => {
    if (isInstruction && questionPhase === "audio") {
      speak(question.text, { onError: () => {}, onEnd: () => { answerStartTime.current = Date.now(); setPhase("answer"); } });
    } else {
      // Read the prompt, never reveal a hidden sequence during the answer phase.
      speak(heading);
    }
  };
  // Sinhala screens also offer an English read-aloud of the same question
  // (the English bank has the same questions in the same order: wm-g4-si-8 <-> wm-g4-8).
  const englishQuestion = i18n.language?.startsWith("si")
    ? QUIZ_DATA[grade]?.en?.find(item => item.id === question.id.replace("-si-", "-"))
    : null;
  const listenInEnglish = englishQuestion ? () => {
    const en = i18n.getFixedT("en", ["wm", "common"]);
    if (isInstruction && questionPhase === "audio") {
      speak(englishQuestion.text, { english: true, onError: () => {}, onEnd: () => { answerStartTime.current = Date.now(); setPhase("answer"); } });
      return;
    }
    const englishHeading = questionPhase === "answer" ? (question.category === "Picture Memory" ? en("screen_picture_recall") : question.category === "Number Memory" ? en("screen_number_recall") : englishQuestion.instruction)
      : isInstruction ? en("screen_remember_steps") : getCategoryPrefix(question.category, en);
    speak(englishHeading, { english: true });
  } : undefined;
  // VIVA: The active question board receives stimulus, options and event handlers.
  return /* RETURN: This JSX is the visible UI for this branch; props/state choose its content. */ <ScreeningQuestionScreen
    key={question.id} question={question} current={current} total={quizData.length}
    phase={questionPhase} t={t} heading={heading} responses={results} audioState={audioState} renderPictures={sequence => <PictureSequence sequence={sequence} />}
    onAnswer={handleSubmit} onListen={listenToQuestion} onListenEnglish={listenInEnglish}
    onAudioFallback={() => { answerStartTime.current = Date.now(); setPhase("answer"); }}
  />;
}
