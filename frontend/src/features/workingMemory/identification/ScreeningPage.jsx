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

const MEMORIZATION_DURATIONS_MS = {
  "2": 8000,
  "3": 7000,
  "4": 6000,
};

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

const getCategoryPrefix = (category, t) => {
  if (category === "Number Memory") return t("prep_memory_recall");
  if (category === "Picture Memory") return t("prep_picture_memory");
  if (category === "Instruction") return t("prep_instruction");
  if (category === "Pattern") return t("prep_pattern");
  return "";
};

const isTimedMemoryQuestion = (question) =>
  question.category === "Picture Memory" || question.category === "Number Memory";

const getPictureSequence = (option) => option.split(",").map((item) => item.trim());

const PictureSequence = ({ sequence }) => (
  <div className="wm-screen__picture-strip">
    {getPictureSequence(sequence).map((word, index) => {
      const image = wordToImageMap[word] || wordToImageMap[word.toLowerCase()];
      return (
        <div className="wm-screen__picture-item" key={`${word}-${index}`}>
          {image && <ScreeningPicture src={`/images/workingMemory/identification/objects/${image}`} alt="" />}
        </div>
      );
    })}
  </div>
);

const pickDemoQuestions = (data) => {
  const picked = [];
  for (const category of DEMO_CATEGORIES) {
    const match = data.find((question) => question.category === category);
    if (match && !picked.some((question) => question.id === match.id)) picked.push(match);
  }
  return picked.length >= 2 ? picked.slice(0, 2) : data.slice(0, 2);
};

// Real screening uses the full grade bank; practice uses the existing demo selection.
const buildQuizSet = (grade, language, sessionMode, idsParam) => {
  const source = QUIZ_DATA[grade]?.[language];
  if (!source) return [];

  const ids = idsParam?.split(",").filter(Boolean) ?? [];
  if (sessionMode !== "demo") return source;
  return ids.length ? source.filter((question) => ids.includes(question.id)) : pickDemoQuestions(source);
};

export default function ScreeningPage() {
  const { grade } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation(["wm", "common"]);
  const searchParams = new URLSearchParams(location.search);
  const urlDemoIds = searchParams.get("ids");
  const urlDemo = searchParams.get("demo") === "true";
  const skipIntro = Boolean(urlDemoIds);
  const gradeLabel = `${t("common:grade")} ${grade}`;

  const [entryPhase, setEntryPhase] = useState(() => (skipIntro ? "quiz" : "welcome"));
  const [sessionMode, setSessionMode] = useState(() => (skipIntro && urlDemo ? "demo" : "real"));
  const [quizData, setQuizData] = useState([]);
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState("memorize");
  const [phaseQuestionId, setPhaseQuestionId] = useState(null);
  const [results, setResults] = useState([]);
  const [finished, setFinished] = useState(false);
  const answerStartTime = useRef(null);
  const submittedQuestion = useRef(null);
  const speechGeneration = useRef(0);
  const [audioState, setAudioState] = useState("idle");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  const resetQuizState = () => {
    setCurrent(0);
    setResults([]);
    setFinished(false);
    setPhase("memorize");
    answerStartTime.current = null;
  };

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

  const startDemo = () => {
    resetQuizState();
    setSessionMode("demo");
    setEntryPhase("quiz");
  };

  const startBriefing = () => {
    setSessionMode("real");
    setEntryPhase("briefing");
  };

  const startRealQuiz = () => {
    resetQuizState();
    setSessionMode("real");
    setEntryPhase("quiz");
  };

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

  useEffect(() => () => { speechGeneration.current++; stopAllAudio(); }, []);

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

  useEffect(() => {
    if (!quizData.length || finished) return undefined;

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

  const saveResults = async (finalResults) => {
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

  const handleSubmit = async (userAnswer) => {
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
    return <WelcomeScreen gradeLabel={gradeLabel} t={t} onBack={() => navigate("/dashboard")} onTryDemo={startDemo} onStartTest={startBriefing} />;
  }

  if (entryPhase === "briefing") {
    return <BriefingScreen gradeLabel={gradeLabel} t={t} onBack={() => { stopAllAudio(); setEntryPhase("welcome"); }} onClose={() => { stopAllAudio(); navigate("/dashboard"); }} onListen={speakBriefing} onReady={() => { stopAllAudio(); startRealQuiz(); }} />;
  }

  if (entryPhase === "quiz" && !quizData.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-sky-400 to-emerald-300">
        <div className="w-24 h-24 border-8 border-white border-t-sky-500 rounded-full animate-spin mb-4" />
        <p className="text-white font-black text-2xl animate-pulse">{t("checking_access")}</p>
      </div>
    );
  }

  if (finished && sessionMode === "demo" && !skipIntro) {
    return <DemoCompleteScreen t={t} onStartReal={startBriefing} onTryAgain={startDemo} onBackHome={() => navigate("/dashboard")} />;
  }

  if (finished) {
    return <ScreeningResults
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
  return <ScreeningQuestionScreen
    key={question.id} question={question} current={current} total={quizData.length}
    phase={questionPhase} t={t} heading={heading} responses={results} audioState={audioState} renderPictures={sequence => <PictureSequence sequence={sequence} />}
    onAnswer={handleSubmit} onListen={listenToQuestion} onListenEnglish={listenInEnglish}
    onAudioFallback={() => { answerStartTime.current = Date.now(); setPhase("answer"); }}
  />;
}
