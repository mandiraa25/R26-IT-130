// VIVA: OVERVIEW - PA improvement controller: loads activity data, runs tutorial/quiz/result phases and saves attempts.
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getStudentProfile } from "../../services/student/api";
import { submitSubCategoryAttempt } from "../../services/phonologicalAwareness/improveApi";
import { getSubCategoryData } from "./data/improvement";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import PACategory1 from "./PACategory1";
import PACategory2 from "./PACategory2";
import PACategory3 from "./PACategory3";
import PACategory4 from "./PACategory4";
import PATutorial, { PATutorialNavigation, PATutorialStage } from "./PATutorial";
import PAScoreboard from "./PAScoreboard";
import { registerAudio, stopAllAudio } from "../../utils/phonologicalAwareness/audio";

// Helper to format YouTube Embed URL with auto-loop parameter (prevents YouTube end-screen video grids)
const formatYouTubeEmbedUrl = (url) => {
  if (!url) return "";
  let videoId = "";
  if (url.includes("/embed/")) {
    videoId = url.split("/embed/")[1]?.split("?")[0];
  } else if (url.includes("v=")) {
    videoId = url.split("v=")[1]?.split("&")[0];
  } else if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split("?")[0];
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`;
  }
  return url;
};

export default function ImprovementActivityPA() {
  const { grade, levelNumber, subCategoryKey } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("pa");

  const [profile, setProfile] = useState(null);
  const [phase, setPhase] = useState("video"); // 'video' | 'quiz' | 'result'
  const [subCatData, setSubCatData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [results, setResults] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [totalStartTime, setTotalStartTime] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Backend submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  // YouTube player state & refs
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoStarted, setVideoStarted] = useState(false);
  const [useFallbackIframe, setUseFallbackIframe] = useState(false);
  const playerRef = useRef(null);

  const clickSound = useRef(new Audio("/click.mp3"));

  const getYouTubeId = (url) => {
    if (!url) return "";
    if (url.includes("/embed/")) return url.split("/embed/")[1]?.split("?")[0];
    if (url.includes("v=")) return url.split("v=")[1]?.split("&")[0];
    if (url.includes("youtu.be/")) return url.split("youtu.be/")[1]?.split("?")[0];
    return "";
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    // Load questions based on current grade, level, subcategory and language
    const currentLang = i18n.language?.startsWith("si") ? "si" : "en";
    const data = getSubCategoryData(grade, levelNumber, subCategoryKey, currentLang);
    if (data) {
      setSubCatData(data);
      setQuestions(data.questions || []);
    } else {
      console.error(`Subcategory data not found for G:${grade} L:${levelNumber} K:${subCategoryKey}`);
    }
  }, [grade, levelNumber, subCategoryKey, i18n.language]);

  // Handle YouTube IFrame API initialization & ENDED state detection
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
        } catch (e) { }
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

  const handleWatchVideo = () => {
    setVideoStarted(true);
    setVideoEnded(false);
    if (typeof playerRef.current?.playVideo === "function") {
      playerRef.current.playVideo();
    } else {
      setUseFallbackIframe(true);
    }
  };

  useEffect(() => {
    if (soundEnabled) playerRef.current?.unMute?.();
    else playerRef.current?.mute?.();
  }, [soundEnabled, videoStarted]);

  const fetchProfile = async () => {
    try {
      const res = await getStudentProfile();
      setProfile(res.data);
    } catch (err) {
      console.error("Error fetching student profile:", err);
    }
  };

  const playSound = () => {
    if (soundEnabled) {
      clickSound.current.currentTime = 0;
      clickSound.current.play().catch((e) => console.log("Audio play blocked", e));
    }
  };

  // Question audio management & Web Speech Synthesis
  const questionAudioRef = useRef(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const lastSpokenKeyRef = useRef("");

  // Ensure all audio and speech synthesis is immediately stopped on unmount
  useEffect(() => {
    return () => {
      stopQuestionAudio();
      stopAllAudio();
    };
  }, []);

  const stopQuestionAudio = () => {
    if (questionAudioRef.current) {
      questionAudioRef.current.pause();
      questionAudioRef.current.currentTime = 0;
      questionAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  const playQuestionAudio = (customTextOrAudioPath) => {
    if (!soundEnabled) return;
    stopQuestionAudio();

    const isSinhala = i18n.language?.startsWith("si");

    // Check if customTextOrAudioPath is a number string (e.g., counting "1", "2", "3" from drum taps)
    const isCountNumber =
      typeof customTextOrAudioPath === "number" ||
      (typeof customTextOrAudioPath === "string" && /^\d+$/.test(customTextOrAudioPath.trim()));

    if (!isSinhala || isCountNumber) {
      // English Questions or Drum Tap Number Count: Use Speech Synthesis to speak in English
      let textToRead = isCountNumber
        ? String(customTextOrAudioPath)
        : typeof customTextOrAudioPath === "string" &&
          !customTextOrAudioPath.includes("/") &&
          !customTextOrAudioPath.endsWith(".ogg") &&
          !customTextOrAudioPath.endsWith(".mp3")
          ? customTextOrAudioPath
          : questions[currentIdx]?.instruction || questions[currentIdx]?.question || questions[currentIdx]?.instructionText || "";

      if (textToRead && window.speechSynthesis) {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }

        // Sanitize instruction text to remove colon, quoted fill-in target, and underscores for Speech Synthesis
        const textToReadCleaned = textToRead
          .replace(/:\s*['"][^'"]*['"]/g, "")
          .replace(/_+/g, "")
          .trim();

        const utterance = new SpeechSynthesisUtterance(textToReadCleaned || textToRead);
        utterance.lang = "en-US";
        utterance.rate = 0.9; // Calm, clear pace for children
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
          const enVoice = voices.find((v) => v.lang.startsWith("en")) || voices[0];
          if (enVoice) utterance.voice = enVoice;
        }

        utterance.onstart = () => setIsPlayingAudio(true);
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      // Sinhala Questions: Play audio file (.ogg / .mp3)
      let src =
        typeof customTextOrAudioPath === "string" &&
        (customTextOrAudioPath.includes("/") || customTextOrAudioPath.endsWith(".ogg") || customTextOrAudioPath.endsWith(".mp3"))
          ? customTextOrAudioPath
          : questions[currentIdx]?.audioUrl || "/audio/phonologicalAwareness/improvement/sample.ogg";

      try {
        const audio = registerAudio(new Audio(src));
        questionAudioRef.current = audio;

        audio.onplay = () => setIsPlayingAudio(true);
        audio.onended = () => setIsPlayingAudio(false);
        audio.onerror = () => {
          if (src !== "/audio/phonologicalAwareness/improvement/sample.ogg") {
            const fallbackAudio = registerAudio(new Audio("/audio/phonologicalAwareness/improvement/sample.ogg"));
            questionAudioRef.current = fallbackAudio;
            fallbackAudio.onplay = () => setIsPlayingAudio(true);
            fallbackAudio.onended = () => setIsPlayingAudio(false);
            fallbackAudio.onerror = () => setIsPlayingAudio(false);
            fallbackAudio.play().catch(() => setIsPlayingAudio(false));
          } else {
            setIsPlayingAudio(false);
          }
        };

        audio.play().catch((err) => {
          console.log("Audio play blocked or interrupted:", err);
          setIsPlayingAudio(false);
        });
      } catch (err) {
        console.error("Failed to play question audio:", err);
        setIsPlayingAudio(false);
      }
    }
  };

  // Fisher-Yates Shuffle helper to randomize questions & prevent memorization
  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const startQuiz = () => {
    playSound();
    stopQuestionAudio();
    lastSpokenKeyRef.current = "";

    // Shuffle current subcategory questions so question order changes every attempt
    if (subCatData && subCatData.questions) {
      setQuestions(shuffleArray(subCatData.questions));
    }

    setPhase("quiz");
    setCurrentIdx(0);
    setUserAnswers({});
    setScore(0);
    setResults([]);
    setQuestionStartTime(performance.now());
    setTotalStartTime(performance.now());

    // Trigger Speech Synthesis within user gesture click session
    const firstQText = questions[0]?.instruction || questions[0]?.question;
    setTimeout(() => {
      playQuestionAudio(firstQText);
    }, 100);
  };

  useEffect(() => {
    if (phase === "quiz" && questions[currentIdx]) {
      const currentKey = `${phase}_${currentIdx}_${i18n.language}`;
      if (lastSpokenKeyRef.current !== currentKey) {
        lastSpokenKeyRef.current = currentKey;
        setQuestionStartTime(performance.now());

        const timer = setTimeout(() => {
          playQuestionAudio(questions[currentIdx]?.instruction || questions[currentIdx]?.question);
        }, 150);

        return () => clearTimeout(timer);
      }
    } else if (phase !== "quiz") {
      lastSpokenKeyRef.current = "";
      stopQuestionAudio();
    }
  }, [currentIdx, phase, soundEnabled, i18n.language, questions]);

  const handlePrevQuestion = (currentOpt) => {
    stopQuestionAudio();
    if (currentOpt) {
      setUserAnswers((prev) => ({ ...prev, [currentIdx]: currentOpt }));
    }
    if (currentIdx > 0) {
      playSound();
      const prevIdx = currentIdx - 1;
      setCurrentIdx(prevIdx);
      setTimeout(() => {
        playQuestionAudio(questions[prevIdx]?.instruction || questions[prevIdx]?.question);
      }, 100);
    }
  };

  const handleNextQuestion = (currentOpt) => {
    stopQuestionAudio();
    if (currentOpt) {
      setUserAnswers((prev) => ({ ...prev, [currentIdx]: currentOpt }));
    }
    if (currentIdx < questions.length - 1) {
      playSound();
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setTimeout(() => {
        playQuestionAudio(questions[nextIdx]?.instruction || questions[nextIdx]?.question);
      }, 100);
    }
  };

  const handleOptionSelect = async (selectedOption) => {
    stopQuestionAudio();
    playSound();
    const updatedUserAnswers = { ...userAnswers, [currentIdx]: selectedOption };
    setUserAnswers(updatedUserAnswers);

    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      setTimeout(() => {
        playQuestionAudio(questions[nextIdx]?.instruction || questions[nextIdx]?.question);
      }, 100);
    } else {
      // Ensure all questions have an answer before submitting
      const unansweredIdx = questions.findIndex((_, idx) => !updatedUserAnswers[idx]);
      if (unansweredIdx !== -1) {
        setCurrentIdx(unansweredIdx);
        return;
      }

      // Quiz finished -> calculate total score across all questions and submit
      let calculatedScore = 0;
      const finalResults = questions.map((q, idx) => {
        const ans = updatedUserAnswers[idx];
        const isCorrect = ans === q.correct;
        if (isCorrect) calculatedScore += 1;
        return {
          questionId: q.id,
          isCorrect,
          timeTaken: 1000,
          userAnswer: ans,
          correctAnswer: q.correct,
        };
      });

      setScore(calculatedScore);
      setResults(finalResults);
      setPhase("result");
      await handleCompleteQuiz(calculatedScore, finalResults);
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
        grade: Number(grade),
        language: i18n.language?.startsWith("si") ? "si" : "en",
        levelNumber: Number(levelNumber),
        subCategoryKey,
        score: finalScore,
        totalQuestions: questions.length,
        questionResults: finalResults,
        totalTimeTaken,
        minPassPercentage: 50,
      });

      setSubmitResult(res.data);
    } catch (err) {
      console.error("Error saving improvement attempt:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBackToLevels = () => {
    stopQuestionAudio();
    playSound();
    navigate(`/improvement-pa/${grade}`);
  };

  const handleNextSubCategory = () => {
    stopQuestionAudio();
    playSound();
    const subCatOrder = [
      "phonological_awareness",
      "visual_processing",
      "orthographic_skills",
      "segmentation_counting",
    ];

    const currentSubIdx = subCatOrder.indexOf(subCategoryKey);
    if (currentSubIdx !== -1 && currentSubIdx + 1 < subCatOrder.length) {
      const nextKey = subCatOrder[currentSubIdx + 1];
      navigate(`/improvement-activity-pa/${grade}/${levelNumber}/${nextKey}`);
      setPhase("video");
    } else if (Number(levelNumber) < 4) {
      // Move to next level subcategory 1
      navigate(`/improvement-activity-pa/${grade}/${Number(levelNumber) + 1}/phonological_awareness`);
      setPhase("video");
    } else {
      navigate(`/improvement-pa/${grade}`);
    }
  };

  if (!subCatData) {
    return (
      <div className="min-h-screen bg-sky-100 flex flex-col items-center justify-center">
        <div className="w-20 h-20 border-8 border-white border-t-emerald-500 rounded-full animate-spin mb-4" />
        <p className="text-emerald-700 font-black text-2xl animate-pulse">
          {t("getting_ready")}
        </p>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];

  // Render PACategory1 directly during quiz phase for phonological_awareness
  if (phase === "quiz" && subCategoryKey === "phonological_awareness" && currentQuestion) {
    return (
      <PACategory1
        currentQuestion={currentQuestion}
        currentIdx={currentIdx}
        totalQuestions={questions.length}
        onOptionSelect={handleOptionSelect}
        onPrevQuestion={handlePrevQuestion}
        onNextQuestion={handleNextQuestion}
        onBack={handleBackToLevels}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        speakText={(txt) => playQuestionAudio(txt || currentQuestion?.audioUrl)}
        isPlayingAudio={isPlayingAudio}
        levelNumber={levelNumber}
        subCategoryTitle={t(`subcat_${subCategoryKey}`)}
        savedAnswer={userAnswers[currentIdx] || null}
      />
    );
  }

  // Render PACategory2 directly during quiz phase for visual_processing
  if (phase === "quiz" && subCategoryKey === "visual_processing" && currentQuestion) {
    return (
      <PACategory2
        key={currentQuestion?.id || currentIdx}
        currentQuestion={currentQuestion}
        currentIdx={currentIdx}
        totalQuestions={questions.length}
        onOptionSelect={handleOptionSelect}
        onPrevQuestion={handlePrevQuestion}
        onNextQuestion={handleNextQuestion}
        onBack={handleBackToLevels}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        speakText={(txt) => playQuestionAudio(txt || currentQuestion?.audioUrl)}
        isPlayingAudio={isPlayingAudio}
        levelNumber={levelNumber}
        subCategoryTitle={t(`subcat_${subCategoryKey}`)}
        savedAnswer={userAnswers[currentIdx] || null}
      />
    );
  }

  // Render PACategory3 directly during quiz phase for orthographic_skills
  if (phase === "quiz" && subCategoryKey === "orthographic_skills" && currentQuestion) {
    return (
      <PACategory3
        currentQuestion={currentQuestion}
        currentIdx={currentIdx}
        totalQuestions={questions.length}
        onOptionSelect={handleOptionSelect}
        onPrevQuestion={handlePrevQuestion}
        onNextQuestion={handleNextQuestion}
        onBack={handleBackToLevels}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        speakText={(txt) => playQuestionAudio(txt || currentQuestion?.audioUrl)}
        isPlayingAudio={isPlayingAudio}
        levelNumber={levelNumber}
        subCategoryTitle={t(`subcat_${subCategoryKey}`)}
        savedAnswer={userAnswers[currentIdx] || null}
      />
    );
  }

  // Render PACategory4 directly during quiz phase for segmentation_counting
  if (phase === "quiz" && subCategoryKey === "segmentation_counting" && currentQuestion) {
    return (
      <PACategory4
        currentQuestion={currentQuestion}
        currentIdx={currentIdx}
        totalQuestions={questions.length}
        onOptionSelect={handleOptionSelect}
        onPrevQuestion={handlePrevQuestion}
        onNextQuestion={handleNextQuestion}
        onBack={handleBackToLevels}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        speakText={(txt) => playQuestionAudio(txt || currentQuestion?.audioUrl)}
        isPlayingAudio={isPlayingAudio}
        levelNumber={levelNumber}
        subCategoryTitle={t(`subcat_${subCategoryKey}`)}
        savedAnswer={userAnswers[currentIdx] || null}
      />
    );
  }

  if (phase === "result") {
    return <PAScoreboard
      levelNumber={levelNumber}
      categoryTitle={t(`subcat_${subCategoryKey}`)}
      score={score}
      totalQuestions={questions.length}
      soundEnabled={soundEnabled}
      onToggleSound={() => setSoundEnabled(!soundEnabled)}
      onBack={handleBackToLevels}
      onRetry={startQuiz}
      onNext={handleNextSubCategory}
      isSubmitting={isSubmitting}
      submitResult={submitResult}
    />;
  }

  return (
    <div className={`relative w-full h-screen h-dvh overflow-hidden font-sans select-none flex flex-col ${phase === "video" ? "pa-tutorial-screen" : ""}`}>
      {/* 🌄 Jungle Background */}
      <img
        src={phase === "video" ? "/images/phonologicalAwareness/tutorial/jungle-background-v2.png" : "/images/phonologicalAwareness/quiz_interaction_bg2.png"}
        alt="Jungle Background"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
      />
      {phase !== "video" && <div className="absolute inset-0 bg-black/20 pointer-events-none" />}
      <PATutorialStage active={phase === "video"}>

      {/* 🌟 Header */}
      {phase === "video" ? (
        <PATutorialNavigation levelNumber={levelNumber} score={score} soundEnabled={soundEnabled} onToggleSound={() => setSoundEnabled(!soundEnabled)} onBack={handleBackToLevels} />
      ) : <header className="relative z-10 w-full px-4 py-2 md:px-8 md:py-3 flex items-center justify-between gap-4 shrink-0">
        {/* Left: Back button & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackToLevels}
            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-emerald-500 hover:bg-emerald-600 border-b-4 md:border-b-6 border-emerald-700 text-white flex items-center justify-center text-2xl md:text-3xl font-black transition-all transform active:translate-y-1 active:border-b-0 shadow-lg cursor-pointer"
            title="Go Back"
          >
            ←
          </button>
          <div className="bg-yellow-400 border-b-4 md:border-b-6 border-yellow-600 px-4 md:px-5 py-1.5 md:py-2 rounded-2xl shadow-lg flex items-center gap-2">
            <span className="text-yellow-950 font-black text-base md:text-xl uppercase tracking-wider">
              Level {levelNumber} • {t(`subcat_${subCategoryKey}`)}
            </span>
          </div>
        </div>

        {/* Right: Sound & Language Switcher */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-lg md:text-xl shadow-lg border-b-4 active:translate-y-1 active:border-b-0 transition-all ${soundEnabled
              ? "bg-purple-500 border-purple-700 hover:bg-purple-600 text-white"
              : "bg-gray-400 border-gray-600 hover:bg-gray-500 text-gray-200"
              }`}
          >
            {soundEnabled ? "🔊" : "🔇"}
          </button>
          <div className="bg-white/90 backdrop-blur-sm p-1 rounded-2xl shadow-md">
            <LanguageSwitcher />
          </div>
        </div>
      </header>}

      {/* VIVA: Tutorial phase with the current activity instructions and video. */}
      {/* 📺 PHASE 1: VIDEO LESSON */}
      {phase === "video" && (
        <PATutorial
          instruction={subCatData.instruction || t("video_instruction")}
          videoStarted={videoStarted}
          onWatch={handleWatchVideo}
          onSkip={startQuiz}
        >
              {subCatData.youtubeVideoUrl ? (
                <>
                  {useFallbackIframe ? (
                    <iframe
                      className="w-full h-full"
                      src={`${formatYouTubeEmbedUrl(subCatData.youtubeVideoUrl)}${videoStarted ? "&autoplay=1" : ""}${soundEnabled ? "" : "&mute=1"}`}
                      title="Lesson Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div id="yt-player-element" className="w-full h-full" />
                  )}

                  {/* 🛡️ Distraction Click-Shield Masks */}
                  {/* Bottom-Right Shield: Blocks clicks on 'More videos' and YouTube logo */}
                  <div
                    className="absolute bottom-0 right-0 z-20 w-44 md:w-56 h-14 pointer-events-auto bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    style={{ touchAction: "none" }}
                  />

                  {/* Top-Left Shield: Blocks clicking channel title / opening YouTube in external tab */}
                  <div
                    className="absolute top-0 left-0 z-20 w-3/4 h-16 pointer-events-auto bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    style={{ touchAction: "none" }}
                  />

                  {/* Top-Right Shield: Blocks YouTube share / watch later buttons */}
                  <div
                    className="absolute top-0 right-0 z-20 w-28 h-16 pointer-events-auto bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    style={{ touchAction: "none" }}
                  />

                  {/* Completion Card Overlay - Completely hides YouTube End-Screen & Suggested Video Cards */}
                  {videoEnded && (
                    <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
                      <span className="text-6xl mb-3 animate-bounce">🌟</span>
                      <h3 className="text-2xl md:text-3xl font-black text-white mb-2">
                        {i18n.language?.startsWith("si") ? "වීඩියෝ පාඩම නරඹා අවසන්!" : "Lesson Video Completed!"}
                      </h3>
                      <p className="text-indigo-200 text-sm md:text-base font-semibold mb-6 max-w-md">
                        {i18n.language?.startsWith("si")
                          ? "ඔබ වීඩියෝව සාර්ථකව නරඹන ලදී. දැන් ප්‍රායෝගික පුහුණුව ආරම්භ කිරීමට පහත බොත්තම ඔබන්න!"
                          : "Great job watching the video! Click below to start your practice activity."}
                      </p>
                      <div className="flex flex-wrap justify-center gap-4">
                        <button
                          onClick={handleReplayVideo}
                          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 rounded-2xl font-bold transition-all flex items-center gap-2 cursor-pointer"
                        >
                          <span>🔄</span> {i18n.language?.startsWith("si") ? "නැවත නරඹන්න" : "Replay Video"}
                        </button>
                        <button
                          onClick={startQuiz}
                          className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black shadow-lg shadow-emerald-500/30 transition-all transform hover:scale-105 flex items-center gap-2 cursor-pointer uppercase tracking-wider"
                        >
                          <span>🚀</span> {t("start_practice")}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-white bg-slate-800 p-6">
                  <span className="text-6xl mb-4 animate-bounce">📽️</span>
                  <p className="text-xl font-bold">Educational Demonstration Video</p>
                </div>
              )}
        </PATutorial>
      )}

      {/* VIVA: Fallback quiz presentation for the current activity question. */}
      {/* 🧩 PHASE 2: INTERACTIVE PRACTICE QUIZ (for other subcategories) */}
      {phase === "quiz" && currentQuestion && (
        <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 py-4 flex flex-col items-center justify-center animate-fadeIn">
          <div className="bg-white/95 backdrop-blur-md rounded-[3rem] p-6 md:p-8 shadow-2xl border-b-[10px] border-slate-200 w-full flex flex-col items-center text-center">
            {/* VIVA: Current question position within this attempt. */}
            {/* Progress indicator */}
            <div className="w-full flex items-center justify-between mb-4 px-2">
              <span className="bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full font-black text-sm uppercase tracking-wider border-2 border-purple-200">
                {t("quest")} {currentIdx + 1} / {questions.length}
              </span>
              <div className="flex gap-1 text-2xl">
                {Array.from({ length: questions.length }).map((_, i) => (
                  <span key={i}>
                    {i < currentIdx ? "⭐" : i === currentIdx ? "✨" : "⚪"}
                  </span>
                ))}
              </div>
            </div>

            {/* VIVA: Question instruction and speech playback action. */}
            {/* Instruction & TTS Speaker */}
            <div className="flex items-center gap-3 bg-sky-50 border-2 border-sky-200 px-6 py-4 rounded-3xl mb-6 max-w-2xl w-full justify-between shadow-inner">
              <h3 className="text-xl md:text-2xl font-black text-slate-800 text-left leading-snug">
                {currentQuestion.instruction}
              </h3>
              <button
                onClick={() => speakText(currentQuestion.instruction)}
                className="w-12 h-12 bg-sky-400 hover:bg-sky-500 border-b-4 border-sky-600 text-white rounded-2xl flex items-center justify-center text-2xl shadow-md shrink-0 active:translate-y-1"
                title="Listen to Instruction"
              >
                🔊
              </button>
            </div>

            {/* VIVA: Answer options passed to the current activity handler. */}
            {/* Options Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl my-4">
              {currentQuestion.options.map((opt, i) => {
                const colors = [
                  "bg-amber-400 hover:bg-amber-500 border-amber-600 text-amber-950",
                  "bg-pink-400 hover:bg-pink-500 border-pink-600 text-white",
                  "bg-sky-400 hover:bg-sky-500 border-sky-600 text-white",
                  "bg-emerald-400 hover:bg-emerald-500 border-emerald-600 text-white",
                ];
                const isMirrored = typeof opt === "string" && opt.startsWith("MIRROR:");
                const displayOpt = isMirrored ? opt.replace("MIRROR:", "") : opt;

                return (
                  <button
                    key={i}
                    onClick={() => handleOptionSelect(opt)}
                    className={`${colors[i % colors.length]} py-6 md:py-8 rounded-[2rem] border-b-8 font-black text-3xl md:text-4xl shadow-xl hover:scale-105 active:scale-95 transition-all transform flex items-center justify-center cursor-pointer`}
                  >
                    <span className={isMirrored ? "scale-x-[-1] inline-block" : ""}>
                      {displayOpt}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      )}

      </PATutorialStage>
      {/* Animation Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
