import fs from 'node:fs';
const file='frontend/src/pages/workingMemory/ImprovementActivityWM.jsx';let s=fs.readFileSync(file,'utf8');
s=s.replace('import React, { useState, useEffect, useRef } from "react";','import React, { useState, useEffect, useRef } from "react";\nimport { useMemoryMusic } from "./utils/memoryMusic";\nimport { selectAttemptQuestions } from "./utils/attemptQuestions";');
s=s.replace('const [soundEnabled, setSoundEnabled] = useState(true);','const { muted, toggle: toggleMusic } = useMemoryMusic();\n  const soundEnabled = !muted;\n  const setSoundEnabled = toggleMusic;');
s=s.replace('const latestResultRef = useRef(null);','const latestResultRef = useRef(null);\n  const answeredQuestionRef = useRef(false);\n  const nextTransitionRef = useRef(false);\n  const previousQuestionIdsRef = useRef([]);\n  const undoHistoryRef = useRef([]);');
s=s.replace('const [submitResult, setSubmitResult] = useState(null);','const [submitResult, setSubmitResult] = useState(null);\n  const [submissionError, setSubmissionError] = useState(false);');
s=s.replace('setQuestions(subCategoryKey === "words" ? data.questions || [] : shuffleArray(data.questions || []));','setQuestions(selectAttemptQuestions(data.questions || []));\n      previousQuestionIdsRef.current = [];\n      setPhase("video");');
s=s.replace('    setPhase("intro");\n  };','    startQuiz();\n  };');
// The source is CRLF; normalize so all targeted flow changes are explicit.
s=s.replace(/\r\n/g,'\n');
s=s.replace('    setPhase("intro");\n  };','    startQuiz();\n  };');
s=s.replace('    setQuestions((currentQuestions) => subCategoryKey === "words" ? currentQuestions : shuffleArray(currentQuestions));','    const attempt = selectAttemptQuestions(subCatData?.questions || questions, previousQuestionIdsRef.current);\n    previousQuestionIdsRef.current = attempt.map(q => q.id);\n    setQuestions(attempt);');
// Start the first question directly; there is no extra general Ready screen.
const a=s.indexOf('  const startQuiz = () => {');const b=s.indexOf('  const handleReadyToPlay',a);let start=s.slice(a,b);start=start.replace('    startQuiz();','    setSubmissionError(false);\n    setupQuestion(0, attempt);').replace('    setPhase("intro");','    setSubmissionError(false);\n    setupQuestion(0, attempt);');s=s.slice(0,a)+start+s.slice(b);
s=s.replace('const setupQuestion = (idx) => {\n    const q = questions[idx];','const setupQuestion = (idx, questionSet = questions) => {\n    const q = questionSet[idx];');
s=s.replace('    setQuestionStartTime(performance.now());','    answeredQuestionRef.current = false;\n    nextTransitionRef.current = false;\n    latestResultRef.current = null;\n    undoHistoryRef.current = [];\n    setQuestionStartTime(performance.now());');
s=s.replace('    if (isPatternGame) {\n      setSlots([val]);','    if (phase !== "answer" || answeredQuestionRef.current) return;\n    if (isPatternGame) {\n      setSlots([val]);');
s=s.replace('    const emptyIndex = slots.findIndex', '    if (subCategoryKey === "words" && !dragPool.some(item => pictureItemKey(item) === pictureItemKey(val))) return;\n    rememberArrangement();\n    const emptyIndex = slots.findIndex');
s=s.replace('      if (!isPatternGame) {','      if (!isPatternGame && subCategoryKey !== "numbers") {');
s=s.replace('    const targetValue = slots[targetIndex];','    if (phase !== "answer" || answeredQuestionRef.current) return;\n    if (source === "pool" && !dragPool.some(candidate => pictureItemKey(candidate) === pictureItemKey(value))) return;\n    if (source === "slot" && pictureItemKey(slots[sourceIndex]) !== pictureItemKey(value)) return;\n    rememberArrangement();\n    const targetValue = slots[targetIndex];');
s=s.replace('    const val = slots[index];','    const val = slots[index];\n    if (phase !== "answer" || answeredQuestionRef.current) return;\n    if (val) rememberArrangement();');
s=s.replace('      const updatedSlots = [...slots];\n      const temp = updatedSlots[targetIndex];','      rememberArrangement();\n      const updatedSlots = [...slots];\n      const temp = updatedSlots[targetIndex];');
s=s.replace('    if (!q) return;\n    const endTime = performance.now();','    if (!q || phase !== "answer" || answeredQuestionRef.current) return;\n    answeredQuestionRef.current = true;\n    const endTime = performance.now();');
s=s.replace('  const handleNextQuestion = async () => {\n    const finalResults = results;','  const handleNextQuestion = async () => {\n    if (!answeredQuestionRef.current || nextTransitionRef.current) return;\n    nextTransitionRef.current = true;\n    const finalResults = results;');
s=s.replace('    setIsSubmitting(true);\n    try {','    setIsSubmitting(true);\n    setSubmissionError(false);\n    try {');
s=s.replace('      setSubmitResult(res.data);','      setSubmitResult(res.data);\n      if (res.data?.progress) sessionStorage.setItem(WM_PROGRESS_CACHE, JSON.stringify(res.data.progress));');
s=s.replace('      console.error("Error saving improvement attempt:", err);','      setSubmissionError(true);\n      console.error("Error saving improvement attempt:", err);');
s=s.replace('    navigate(`/improvement-wm/${grade}`);\n  };','    navigate(`/improvement-wm/${grade}?level=${levelNumber}`);\n  };');
const nx=s.indexOf('  const handleNextSubCategory = () => {');s=s.slice(0,nx)+s.slice(nx).replace('  const handleNextSubCategory = () => {','  const handleNextSubCategory = () => {\n    if (score < 3 || isSubmitting || !submitResult) return;\n    if (subCategoryKey === "numbers") { setPhase("levelComplete"); return; }');
s=s.replace('    isSubmitting,\n    submitResult,','    isSubmitting,\n    submissionError,\n    handleRetrySave: () => handleCompleteQuiz(score, results),\n    handleContinueLevel: () => { if (Number(levelNumber) < 4) navigate(`/improvement-activity-wm/${grade}/${Number(levelNumber) + 1}/pattern`); else handleBackToLevels(); },\n    submitResult,');
s=s.replace('    handlePatternConfirm,','    handlePatternConfirm,\n    handlePatternAnswer: (answer) => { const q = questions[currentIdx]; if (q) evaluateAnswer(answer, evaluatePatternAnswer(q, answer)); },\n    handleUndo,\n    handleStartOver,\n    pictureMemorySeconds: 10,');
const insert=s.indexOf('  const handleDragSubmit = () => {');s=s.slice(0,insert)+`  // Snapshots include both rows, so Undo conserves the complete picture set.
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

`+s.slice(insert);
fs.writeFileSync(file,s);
