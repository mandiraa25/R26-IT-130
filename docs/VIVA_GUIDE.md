LexiLand viva preparation — follow the screen into the code
=========================================================

This guide follows the current source code. New teaching comments start with **VIVA:** so you can find them with VS Code global search. The edits for this guide add documentation and comments; they preserve existing executable logic. Existing user changes to the Sinhala instruction bank and its test are separate.

The highest-priority demonstration is: **login → home → Working Memory screening → saved results → improvement map → game → saved progress → achievements → admin**.

**Use your two hours in this order.**

| Minutes | Open and practise | What you should be able to explain |
| --- | --- | --- |
| 0–15 | App.jsx, common/Dashboard.jsx, ActivitySelectionModal.jsx | Find a visible button, its image, its click handler and destination |
| 15–30 | Login.jsx, Register.jsx, Profile.jsx, auth API/controller | Form → validation → request → database/token → navigation |
| 30–55 | ScreeningPage.jsx, ScreeningQuestions.jsx, scoring.js, identify controller | Question source, phases, answer checking, metrics, saving |
| 55–85 | LevelSelection.jsx, ImprovementPage.jsx, four game files, improve controller | Locks, five-question attempts, timers, answers, rewards, next game |
| 85–100 | ReportsDashboard.jsx, two WM reports, admin Dashboard.jsx/controller | Saved achievements, student records and admin permissions |
| 100–120 | Rehearse the demonstration and examiner questions below | Find the relevant function without scrolling through whole files |

Do not spend these two hours memorizing every import or every question. Practise finding the controlling file, explaining the input and state change, and tracing one complete request.

**Your VS Code navigation routine.**

1. Read the URL: App.jsx maps URLs to components.
2. Press Ctrl+P and enter the filename from the reference table.
3. Press Ctrl+F and search the function or class shown in the table.
4. Follow the button's onClick or the form's onSubmit.
5. Follow the called function to its state setter or API service.
6. Follow the service endpoint to app.js → route → controller → model.
7. Return to the component's return statement and explain which state changes the rendered JSX.

Ctrl+Shift+F searches the whole project. Useful terms: VIVA:, handleSubmit, saveWorkingMemoryResult, evaluateAnswer, normalizedScore >= 3, isUnlocked, totalStars. F12 on an imported function usually opens its definition. Use Alt+Left to return.

For code questions, give this answer pattern: **“This component renders the element. This handler runs on interaction. It updates this state or calls this endpoint. This condition then displays the next screen.”**

**Where the application lives.**

| Responsibility | Actual location |
| --- | --- |
| Browser HTML and JavaScript entry | [frontend/index.html](../frontend/index.html), [frontend/src/main.jsx](../frontend/src/main.jsx) |
| All top-level page routes | [frontend/src/App.jsx](../frontend/src/App.jsx) |
| Student login, registration, home and profile | frontend/src/pages/common/ |
| Working Memory active implementation | frontend/src/features/workingMemory/ |
| Reusable navigation, avatar and activity popup | frontend/src/components/common/ |
| Achievements/report screens | frontend/src/pages/common/reports/ |
| Admin screens, sidebar and dialogs | frontend/src/pages/admin/, frontend/src/components/admin/ |
| Shared student HTTP client | [frontend/src/services/api.js](../frontend/src/services/api.js) |
| Student/auth HTTP wrappers | frontend/src/services/student/api.js, frontend/src/services/auth/api.js |
| Translations | frontend/src/i18n.js and frontend/src/locales/en/, si/ |
| Browser assets | frontend/public/images/, fonts/, audio/, vedios/ |
| API startup and URL prefixes | backend/src/server.js, backend/src/app.js |
| Authentication and profile | backend/src/modules/common/ |
| WM routes, controllers and database schemas | backend/src/modules/workingMemory/ |
| Admin routes, controllers and schemas | backend/src/modules/admin/ |
| Token/role checks | backend/src/middleware/auth.middleware.js |
| Existing checks | frontend/tests/unit/, frontend/tests/e2e/, backend/src/modules/*/tests/ |

Files in frontend/public are served without the word public in their URL. For example, frontend/public/images/auth/signin-bg.webp is requested as /images/auth/signin-bg.webp. Import paths load JavaScript/CSS modules; public asset URLs load images/media.

The visible student home is **/dashboard**. The root **/** displays Login. The old frontend/src/modules/workingMemory/sample.jsx does not control the active Working Memory routes.

**Keep this screen-to-file reference beside your demonstration.**

Paths in the links are exact. “Find” is the Ctrl+F search term. Asset and shared-component details follow the table.

| Visible screen/element | Open this file | Component/function and Find term | What to say |
| --- | --- | --- | --- |
| Which page opens for a URL | [frontend/src/App.jsx](../frontend/src/App.jsx) | App; search the URL | “React Router chooses the component and passes URL parameters.” |
| Home animal/module cards | [frontend/src/pages/common/Dashboard.jsx](../frontend/src/pages/common/Dashboard.jsx) | Dashboard; cards.map; handleCategoryClick | “A data array generates the illustrated buttons; clicking selects a category and opens the popup.” |
| Home layout/animal placement | [frontend/src/pages/common/dashboard.css](../frontend/src/pages/common/dashboard.css) | .dashboard-cards; .learning-card__text | “A responsive grid places the card images; live labels overlay the artwork.” |
| Screening/improvement popup | [frontend/src/components/common/ActivitySelectionModal.jsx](../frontend/src/components/common/ActivitySelectionModal.jsx) | designs; regionStyle; onSelect | “The parent supplies module data and callbacks; the popup reports the activity choice.” |
| Home music button | [frontend/src/pages/common/Dashboard.jsx](../frontend/src/pages/common/Dashboard.jsx) | setBackgroundMusic | “State updates the icon and a DOM ref mutes/unmutes the background video.” |
| Sign In | [frontend/src/pages/common/Login.jsx](../frontend/src/pages/common/Login.jsx) | handleChange; handleSubmit | “Inputs update form data, validation runs, then login saves a JWT and navigates home.” |
| Sign Up | [frontend/src/pages/common/Register.jsx](../frontend/src/pages/common/Register.jsx) | handleSubmit; FieldError | “Registration validates fields and confirmation, creates the account, then returns to sign-in.” |
| Form rules | [frontend/src/utils/authValidation.js](../frontend/src/utils/authValidation.js) | validateRegistrationForm; validateLoginForm | “Reusable validators return field messages; the backend repeats validation.” |
| My Profile/photo/logout | [frontend/src/pages/common/Profile.jsx](../frontend/src/pages/common/Profile.jsx) | fetchProfile; handleFileChange; handleSubmit; handleLogout | “The profile loads student data, edits allowed fields and saves through the student service.” |
| Password recovery | [frontend/src/pages/common/PasswordReset.jsx](../frontend/src/pages/common/PasswordReset.jsx) | ForgotPassword; ResetPassword; submit | “A recovery request sends a link; the reset screen submits its token with the new password.” |
| Screening welcome/rules | [frontend/src/features/workingMemory/identification/ScreeningIntro.jsx](../frontend/src/features/workingMemory/identification/ScreeningIntro.jsx) | WelcomeScreen; BriefingScreen | “Presentational screens invoke the screening controller's start/back/listen callbacks.” |
| Screening stage/next question | [frontend/src/features/workingMemory/identification/ScreeningPage.jsx](../frontend/src/features/workingMemory/identification/ScreeningPage.jsx) | entryPhase; handleSubmit; saveResults | “This controller selects questions, controls phases, records answers and saves the completed test.” |
| Screening question UI | [frontend/src/features/workingMemory/identification/ScreeningQuestions.jsx](../frontend/src/features/workingMemory/identification/ScreeningQuestions.jsx) | ScreeningQuestionScreen; canAnswer; answer | “Category and phase select the display; an option click calls the parent's answer handler.” |
| Screening question source | [frontend/src/features/workingMemory/identification/data/index.js](../frontend/src/features/workingMemory/identification/data/index.js) | QUIZ_DATA | “Questions and expected answers are local grade/language arrays.” |
| Check an answer | [frontend/src/features/workingMemory/logic/answerChecking.js](../frontend/src/features/workingMemory/logic/answerChecking.js) | evaluateIdentifyAnswer; evaluateDragAnswer; evaluatePatternAnswer | “Pure helpers compare the submitted value or sequence with the question's expected answer.” |
| Screening score/risk | [frontend/src/features/workingMemory/logic/scoring.js](../frontend/src/features/workingMemory/logic/scoring.js) | calculateWorkingMemoryMetrics; finalScore; getRiskLevel | “The browser calculates weighted metrics and applies fixed risk thresholds.” |
| Immediate screening results | [frontend/src/features/workingMemory/shared/ScreeningResults.jsx](../frontend/src/features/workingMemory/shared/ScreeningResults.jsx) | ScreeningResults; RecommendedPractice | “The screen shows the weighted score and mistake-based practice suggestions while tracking save status.” |
| Improvement level map | [frontend/src/features/workingMemory/improvement/LevelSelection.jsx](../frontend/src/features/workingMemory/improvement/LevelSelection.jsx) | choose; maxUnlockedLevel; setSearch | “The map loads saved access and uses ?level= to open an accessible level popup.” |
| Illustrated level card | [frontend/src/features/workingMemory/improvement/LevelMapCard.jsx](../frontend/src/features/workingMemory/improvement/LevelMapCard.jsx) | LevelMapCard | “PNG artwork surrounds live level, completion and lock labels.” |
| Four-game popup | [frontend/src/features/workingMemory/improvement/GameMenu.jsx](../frontend/src/features/workingMemory/improvement/GameMenu.jsx) | LevelMenu; isUnlocked; onSelect | “Each button reads its saved unlock flag before navigating.” |
| All game phases and handlers | [frontend/src/features/workingMemory/improvement/ImprovementPage.jsx](../frontend/src/features/workingMemory/improvement/ImprovementPage.jsx) | startQuiz; setupQuestion; evaluateAnswer; handleCompleteQuiz | “One controller owns attempts, answers, timers, rewards and persistence for four games.” |
| Which game/result is displayed | [frontend/src/features/workingMemory/improvement/ActivityScreen.jsx](../frontend/src/features/workingMemory/improvement/ActivityScreen.jsx) | const Game; phase; ActivityResults | “This component selects a game and renders the view for the current phase.” |
| Pattern Memory | [frontend/src/features/workingMemory/improvement/games/PatternGame.jsx](../frontend/src/features/workingMemory/improvement/games/PatternGame.jsx) | PatternQuestion; checkAnswer | “Select a symbol and press Check; the controller compares missingAnswer.” |
| Picture Memory | [frontend/src/features/workingMemory/improvement/games/PictureMemoryGame.jsx](../frontend/src/features/workingMemory/improvement/games/PictureMemoryGame.jsx) | startWordsMemory; handleDropOnSlot; handleDragSubmit | “Remember the order, then reconstruct it using tappable or draggable pictures.” |
| Following Instructions | [frontend/src/features/workingMemory/improvement/games/InstructionsGame.jsx](../frontend/src/features/workingMemory/improvement/games/InstructionsGame.jsx) | listen; status; handleInstructionAnswer | “Listen, reveal the question, then select one text answer.” |
| Number Memory | [frontend/src/features/workingMemory/improvement/games/NumberMemoryGame.jsx](../frontend/src/features/workingMemory/improvement/games/NumberMemoryGame.jsx) | ready; recalling; handleTileClick | “Ready reveals the sequence; a keypad fills ordered recall slots.” |
| Correct/incorrect feedback | [frontend/src/features/workingMemory/shared/Feedback.jsx](../frontend/src/features/workingMemory/shared/Feedback.jsx) | FeedbackMessage; lastStarReward | “The shared component displays the controller's correctness and reward.” |
| One-game result dashboard | [frontend/src/features/workingMemory/shared/ActivityResults.jsx](../frontend/src/features/workingMemory/shared/ActivityResults.jsx) | canContinueAttempt; handleRetrySave | “Score and saved status control retry and continuation.” |
| Completed-level summary | [frontend/src/features/workingMemory/shared/LevelCompletion.jsx](../frontend/src/features/workingMemory/shared/LevelCompletion.jsx) | completedCount; isNextLevelUnlocked | “Saved completion flags and history determine the level summary.” |
| Backend lock/reward rules | [backend/src/modules/workingMemory/controllers/workingMemoryImprove.controller.js](../backend/src/modules/workingMemory/controllers/workingMemoryImprove.controller.js) | determineLevelFromIdentification; normalizedScore >= 3; allSubCatsCompleted | “The server records attempts, grants rewards and advances stored access.” |
| Achievements module list | [frontend/src/pages/common/reports/ReportsDashboard.jsx](../frontend/src/pages/common/reports/ReportsDashboard.jsx) | REPORT_MODULES.map | “Achievements opens report navigation for each module.” |
| Assessment/practice report choice | [frontend/src/pages/common/reports/ComponentReportSelect.jsx](../frontend/src/pages/common/reports/ComponentReportSelect.jsx) | types; ReportActionLink | “Module metadata supplies the two report destinations.” |
| Screening history/chart | [frontend/src/pages/common/reports/IdentifyWorkingMemoryReport.jsx](../frontend/src/pages/common/reports/IdentifyWorkingMemoryReport.jsx) | fetchResults; chartData | “Saved screenings are fetched and transformed into chart/list data.” |
| Improvement history/chart | [frontend/src/pages/common/reports/ImproveWorkingMemoryReport.jsx](../frontend/src/pages/common/reports/ImproveWorkingMemoryReport.jsx) | fetchReportData; chartData | “Progress and attempts populate completion details and history.” |
| Admin login | [frontend/src/pages/admin/AdminLogin.jsx](../frontend/src/pages/admin/AdminLogin.jsx) | handleSubmit | “A separate admin endpoint returns an admin token and role-bearing user data.” |
| Admin sidebar and routing | [frontend/src/pages/admin/Dashboard.jsx](../frontend/src/pages/admin/Dashboard.jsx), [AdminLayout.jsx](../frontend/src/components/admin/AdminLayout.jsx) | Routes; menuSections; handleLogout | “Nested routes select the panel while a shared layout provides role-aware links.” |
| Admin student records | [frontend/src/pages/admin/components/StudentProfiles.jsx](../frontend/src/pages/admin/components/StudentProfiles.jsx) | fetchStudents; handleUpdate; handleDelete | “The server supplies students; filters are local and permitted edits refresh the list.” |
| Admin account management | [frontend/src/pages/admin/components/UserManagement.jsx](../frontend/src/pages/admin/components/UserManagement.jsx) | fetchData; handleRegisterSubmit; handleToggleStatus | “Super admins manage account creation, details, passwords and active status.” |
| Admin schools | [frontend/src/pages/admin/components/SchoolManagement.jsx](../frontend/src/pages/admin/components/SchoolManagement.jsx) | calculateCost; handleSubmit | “The form previews cost and the server independently calculates and stores it.” |
| Admin WM screening analytics | [frontend/src/pages/admin/components/WMIdentifyResults.jsx](../frontend/src/pages/admin/components/WMIdentifyResults.jsx) | axios.get; filteredGrouped; downloadData | “Saved attempts are filtered/grouped for display and exported.” |

**Understand the home screen first: you already have Dashboard.jsx open.**

Important imports are React hooks, useNavigate, useTranslation, student API functions, the cached profile helper, ActivitySelectionModal, LanguageSwitcher and WoodenNavControls. dashboard.css supplies positioning. Images are public URLs, so no JavaScript image import is needed.

On first render, profile starts from getCachedProfile(), summary is null, and showModal is false. The effect refreshes the profile and learning summary. A successful state setter triggers another render with the returned data. Its cancelled flag prevents late replies updating a page that has been left.

The cards array stores id/title/description/image. The JSX loops with cards.map. The image is under /images/dashboard/category-cards/, while the text uses card.title from t("working_memory"), t("speech_processing"), and the other translation keys. The current visible labels are module names; the animal art represents those modules.

Click one card → handleCategoryClick(card) → setSelectedCategory(card) and setShowModal(true) → React renders ActivitySelectionModal. The popup calls onSelect("identification") or onSelect("improvement"), which is Dashboard.handleActivitySelect. That function checks selectedCategory.id and the student grade before navigating.

For Working Memory, the routes are /working-memory/3 and /improvement-wm/3 for a Grade 3 profile. PA routes are /identificationActivities-pa/:grade and /improvement-pa/:grade. Speech routes are /speech-processing/leo-identification and /speech-processing/leo-training. Reading currently shows Coming soon and its activity buttons are disabled.

The popup's designs maps wm→bunny, rp→zebra, pa→parrot and sp→lion. regionStyle converts measured artwork coordinates into percentages. activitySelectionModal.css places those absolute regions over the board.

**The selected setBackgroundMusic function, line by line.**

    const setBackgroundMusic = async (enabled) => {
      setMusicEnabled(enabled);
      const video = backgroundVideoRef.current;
      if (!video) return;
      video.muted = !enabled;
      if (enabled) {
        try {
          await video.play();
        } catch {
          setMusicEnabled(false);
          video.muted = true;
        }
      }
    };

| Expression | What it does |
| --- | --- |
| async (enabled) | Receives the desired on/off value and can await video playback |
| setMusicEnabled(enabled) | Updates React state used by the music control and video muted prop |
| backgroundVideoRef.current | Gets the actual video element because JSX attaches ref={backgroundVideoRef} |
| if (!video) return | Stops safely if the element is unavailable |
| video.muted = !enabled | On means unmuted; off means muted |
| await video.play() | Requests playback and waits for success/rejection |
| catch | If playback fails, restores muted state and the matching UI |

The wooden music button calls setBackgroundMusic(!musicEnabled). Muting does not pause the animation; it switches off the video's sound. This home-video control is separate from Working Memory's music helper.

**Locate artwork and styles quickly.**

| Visible artwork/style | Source and search |
| --- | --- |
| Home animated scenery | frontend/public/vedios/bgvedio.mp4; search student-home__video |
| Home fallback/poster | frontend/public/images/bg.webp; Dashboard video poster |
| Home animal module cards | frontend/public/images/dashboard/category-cards/; search learning-card__image |
| Home live names and badges | Dashboard.jsx; learning-card__title; badge-wm.png etc. |
| Popup board and mascots | frontend/public/images/dashboard/activity-popup/; ActivitySelectionModal designs |
| Login background and board | frontend/public/images/auth/signin-bg.webp, signin-vine-board.webp |
| Registration background | frontend/public/images/auth/register-bg.webp |
| Profile scene/board | frontend/public/images/profile/profile-bg.jpeg, profile-sidebar-board.png |
| WM level-card illustrations | frontend/public/images/workingMemory/level-map/cards/level-1.png through level-4.png |
| WM level-card labels | LevelMapCard.jsx and styles/levelMapCards.css |
| WM scene/board/bunny/buttons | frontend/public/images/workingMemory/shared/ and shared/GameLayout.jsx |
| Pattern art mapping | shared/artwork/patternSymbols.js and PatternArtwork.jsx |
| Picture PNG fitting | shared/artwork/PictureArtwork.jsx |
| Achievement journal | frontend/public/images/reports/journal/; reports/components/ReportShell.jsx |
| Fonts | frontend/public/fonts/workingMemory/fonts.css, loaded in frontend/index.html |
| General Tailwind utilities | frontend/src/index.css imports tailwindcss |
| English/Sinhala strings | frontend/src/locales/en/common.json, wm.json and matching si files |

Home .dashboard-cards uses four CSS grid columns on wide screens and two on narrower aspect ratios. .learning-card is relative; .learning-card__text and __badge are positioned over its image. The tiger/giraffe scenery belongs to the background video, not separate animal-button JSX.

WM gameplay uses a 1600×900 design stage. MemoryStage uses useLayoutEffect and the smaller of viewport-width/1600 and viewport-height/900 to scale it. memoryUI.css provides the foundation; gameLevels.css/improvementLayout.css arrange active game content. popupMap.css designs the map popup; patternReference.css designs pattern/result content; patternArtwork.css sizes symbols. :lang(si) adjusts Sinhala presentation.

**Login, registration and profile: trace one form.**

Login.handleChange uses the input name to update the matching form property:

    setForm({ ...form, [e.target.name]: e.target.value });

The spread retains the other fields; the computed key selects email or password. handleSubmit prevents the browser's ordinary form navigation, calls validateLoginForm(form), displays errors, and only then calls login(...).

The service path is frontend/src/services/auth/api.js → POST /api/auth/login → backend/src/modules/common/routes/auth.routes.js → auth.controller.login. The server looks up the user, checks active status, and uses bcrypt.compare against the stored password hash. A successful student login returns a JWT, role and userId.

Login saves token, role and studentId in localStorage, starts a profile-cache refresh and navigates /dashboard. The shared Axios request interceptor adds the bearer token to subsequent requests. App.ProtectedRoute checks token presence; backend verifyToken verifies the signature/expiry and sets req.user.

Register holds fullName, age, email, password, confirmPassword and grade. validateRegistrationForm checks fields; its backend counterpart is studentValidation.validateRegistration. Registration normalizes name/email and converts age to a number. confirmPassword is removed before sending. Passwords are salted bcrypt hashes in MongoDB. Registration returns to / and requires sign-in, even though the backend reply includes a token.

Profile obtains the cached profile first, then fetches current data. handleChange edits fields; handleFileChange rejects files above 5 MB and reads the selected file as a data URL; handleSubmit validates the form and calls updateStudentProfile. The route GET/PUT /api/students/profile uses verifyToken and req.user.id. student.controller.updateProfile permits fullName, grade, profilePhoto, gender and school. handleLogout clears stored authentication/profile data and navigates to login.

The Student schema is backend/src/modules/common/models/student.model.js. It holds identity/profile fields, hashed password, grade, active status, stars and password-reset metadata. Database connection configuration is read from environment variables by server.js.

The frontend's authValidation.js and backend's studentValidation.js cover name/email/age/grade/password and relevant profile rules. Age must be an integer from 6–9 inclusive, grade is 2–4, and new-account/new-password rules require 8–64 characters including a letter and a number. Login accepts an existing nonempty password rather than applying a new-password strength requirement. Login inputs record values through onChange but do not bind a value prop; Register and Profile use controlled inputs.

Password recovery uses PasswordReset.jsx → auth API → forgotPassword/resetPassword. The backend generates a random reset token, stores its SHA-256 hash with expiry, sends a link through services/mailer.js, validates the returned token, hashes the new password and clears reset metadata.

**React execution in your own files.**

Imports make hooks/components/helpers available. The component reads route values and initializes state. Its return describes the initial screen. Effects run after rendering and may fetch data or set timers. A click calls an event handler; a setter schedules another render; React reevaluates the conditions in return.

State changes within a page do not require navigation. ScreeningPage switches welcome/briefing/questions/results using conditions. navigate(...) changes the URL so React Router selects another page.

Props travel from parent to child. In ScreeningPage, onAnswer={handleSubmit} passes a function. ScreeningQuestionScreen calls onAnswer(option), so the parent receives the selected answer. In ImprovementPage, sharedProps groups values/handlers; ActivityScreen receives them and passes them into the chosen game. Spreading props is equivalent to passing those properties individually.

useRef keeps a mutable value without rendering. Answer/submission refs block rapid duplicate clicks; DOM refs access video or focus targets. useEffect dependencies specify when setup reruns; cleanup cancels timers/audio/listeners or ignores stale replies. A key such as question.id creates a fresh child instance for a new question.

**Screening: demonstrate the real sequence.**

ScreeningPage imports QUIZ_DATA, evaluateIdentifyAnswer, calculateWorkingMemoryMetrics, saveWorkingMemoryResult, intro/question/results components and the shared stopAllAudio utility.

1. useParams reads grade and useTranslation supplies language.
2. entryPhase starts welcome. startBriefing displays rules; startRealQuiz resets the attempt and enters quiz.
3. buildQuizSet chooses QUIZ_DATA[grade].en or .si.
4. All complete banks contain 15 option-based questions: 4 Pattern, 3 Picture, 4 Instruction, 4 Number.
5. current is the zero-based index; results accumulates submitted responses.
6. Pattern starts answer immediately. Picture/Number begin memorize, then answers appear after 8/7/6 seconds for grades 2/3/4.
7. Instruction uses browser speech, then answer; an unavailable-audio Continue option supports fallback.
8. ScreeningQuestionScreen selects its JSX from category/phase. Clicking an option immediately calls handleSubmit, with no separate Check/Next step.
9. evaluateIdentifyAnswer compares the option to q.correct and returns isCorrect/errorType.
10. handleSubmit appends a record and advances current, or sets finished and calls saveResults.

Response timing starts when the answers become available, excluding study/listening. timeTaken and memorizationTimeAllocated are milliseconds. There is no answer deadline. Default demo is first Pattern + first Picture and is unsaved.

The source is identification/data/grade2.js, grade3.js, grade4.js. Each provides en/si questions with id, category, type, instruction, stimulus, options and correct. Number/Picture screening asks the child to choose a complete sequence option; improvement reconstructs individual items.

The frontend save payload is studentId, grade, questionResults and metrics. identifyApi.saveWorkingMemoryResult posts /working-memory/identification/save-result. The backend counts submitted correctness flags, optionally calls the prediction service, and saves a WorkingMemoryIdentify document.

Scoring is in logic/scoring.js:

    finalScore =
      0.25 * recallAccuracy +
      0.25 * digitSpanScore +
      0.15 * sequenceScore +
      0.15 * instructionScore +
      0.10 * patternScore +
      0.10 * timeScore;

recallAccuracy is all-question correctness percentage. digitSpan is the longest correct number sequence; digitSpanScore divides it by the largest tested span. sequenceScore averages error weights for number questions; current option-based numbers use correct/incorrect. Instruction and Pattern use their category accuracies. timeScore starts at 100 through 15 seconds average response and falls five per started overtime second, minimum five.

Risk is Low at 75+, Moderate at 45–<75, High below 45. Each relevant submetric below 50 adds its weak-area label. Raw totalScore (correct count) and weighted finalScore (0–100) are distinct.

ScreeningResults displays rounded finalScore, risk and at most two suggestions from getPracticeRecommendations(results). Suggestions rank mistakes, while dashboard focus chips use saved weakAreas. Saving/error state disables improvement navigation until saving succeeds. The ?recommended= link currently is not consumed by LevelSelection, so do not claim it bypasses locks or auto-opens a game.

The optional backend call to http://127.0.0.1:8000/predict sends recallAccuracy, digitSpan, sequenceScore, instructionScore, patternScore, avgResponseTime and timeScore. It stores prediction/confidence when available and still saves if the call fails. This repository does not include the WM model's algorithm/training/inference implementation; do not claim an algorithm or accuracy from these files.

**Improvement: understand initialization before the map.**

getWorkingMemoryAccess first fetches an authenticated profile, then GET /working-memory/improvement/progress/:studentId. Its token-bound cache lasts 30 seconds. sessionStorage caches are display helpers; persisted progress lives in MongoDB.

The backend finds existing progress. If absent, it uses the earliest screening across the student's grades. If no screening exists, identification is false, maximum level is zero and all activities are locked. With a screening, determineLevelFromIdentification prefers mlPrediction over riskLevel.

| Selected prediction/risk | Initial highest unlocked level |
| --- | --- |
| High/Severe | 1 |
| Moderate/Medium | 2 |
| Low/Mild | 3 |
| No Risk/Minimal/Low Risk | 4 |

An unrecognized selected label falls back to raw accuracy bands <40/<65/<85/otherwise. Confidence is not used. A truthy unknown ML label takes precedence over rule-based risk before this fallback.

Initial Level 3 means levels 1–3 are accessible, each with Pattern initially available; earlier levels are not automatically completed. Existing progress is reused after later screenings. Home focus areas use the latest screening, but initial allocation uses the earliest.

LevelSelection loads profile/progress and reads ?level=. choose(n) checks identification and maxUnlockedLevel. setSearch opens the popup; GameMenu reads each activity's isUnlocked and passes the chosen key into navigation.

Direct game routes also check server progress in ImprovementPage. Its accessState distinguishes checking, allowed, denied_identification, denied_locked and connection error.

**The shared improvement controller in practical terms.**

The route supplies grade, levelNumber and subCategoryKey. getSubCategoryData loads local metadata/questions. Pattern and picture arrays come from their questions.js overrides; instruction/number arrays come from bank.js. Valid keys remain pattern, words, instructions, numbers; words is Picture Memory's stored API/database key.

State: phase chooses the view; questions/currentIdx identify the current question; slots/dragPool hold answer arrangement; score/results track the attempt; timers manage exposure; earnedStars/totalStars display rewards; savedProgress/submitResult and error flags track persistence.

startQuiz resets the attempt, selects five shuffled questions and calls setupQuestion. selectAttemptQuestions prefers items outside the preceding attempt and changes an identical order. Most pools have five questions; Pattern Level 4 has six and selects five.

Active phases are video → show/answer → feedback → result → levelComplete. ActivityScreen maps the game key to its component and chooses tutorial, gameplay or shared result UI. Its variable levelOne currently covers all valid levels 1–4.

| Game | Actual interaction | Check and timing |
| --- | --- | --- |
| PatternGame | View pattern, select an option, press Check | evaluatePatternAnswer compares missingAnswer; no memorization timer |
| PictureMemoryGame | Ready, view pictures, reconstruct order by taps/drags, Submit | Fixed 10-second exposure; evaluateDragAnswer compares stable IDs in order and rejects duplicates |
| InstructionsGame | Listen/Listen again, Show question, tap text option | Recording by supported question ID or TTS fallback; selectedOption === q.correct |
| NumberMemoryGame | Ready, study whole sequence, use 0–9 keypad, Submit | 12/10/8/6 seconds by level; string-normalized ordered comparison; backwards expected order is already in correct |

Picture dragging uses handleDragStart, handleDragOver and handleDropOnSlot. A pool drop fills/replaces a slot; a slot-to-slot drop swaps. handleSlotClick supports tap swaps/removal. rememberArrangement stores both slots and pool so handleUndo restores the complete arrangement. Numbers Undo clears the final filled slot.

Picture sequence lengths by grade/levels are 2:[2,3,3,4], 3:[3,4,4,5], 4:[3,4,4,5]. Number lengths are 2:[2,3,3,3], 3:[3,4,3,4], 4:[4,5,4,5]. Numbers levels 3/4 include backward questions. Recall is untimed.

InstructionsGame owns idle/playing/done audio status and cleanup refs. getInstructionAudioUrl recognizes supported g3 question IDs and locates grade3 en/si recordings. All grades currently reuse Grade 3 Sinhala instruction questions/IDs; English remains grade-specific. The current picture controller uses only the correct sequence as its pool even though picture data also defines distractors.

evaluateAnswer records one answer, plays feedback, sets feedback phase, increments score by one and adds five displayed stars for each correct response. Feedback.jsx displays correctness/reward; handleNextQuestion moves on or opens results and saves after question five.

Per-question improvement timeTaken is milliseconds since setup, including Ready/study/listening. totalTimeTaken is full attempt seconds including feedback pauses. This differs from screening's answer-only milliseconds.

handleCompleteQuiz posts studentId, grade, language, levelNumber, subCategoryKey, score, totalQuestions, questionResults and totalTimeTaken. After success, it reconciles progress/stars and refreshes progress/history independently. A failed refresh retries its GET, not the saved POST.

The backend pass condition is normalizedScore >= 3. In the normal five-question interface, three correct earns 15 stars and passes. Each saved attempt earns score*5, including failures/repeats. bestScore is the maximum. A later failed attempt preserves earlier completion and unlocks.

Passed Pattern unlocks Pictures, then Instructions, then Numbers. All four completion flags complete a level. Completing the current highest accessible level unlocks the next level's Pattern. Level 4 has no fifth level.

ActivityResults shows one attempt and requires score >= 3 plus a saved result for normal continuation. LevelCompletion shows saved progress/history for all four games; its recorded stars include repeated attempts. Shared GameLayout provides MemoryStage/Nav/Board/Button/Tracker/Picture/Heading/Timer/Bunny.

**Achievements, stars and stored data.**

The home My Achievements button opens /reports. ReportsDashboard maps REPORT_MODULES into illustrated rows. ComponentReportSelect chooses assessment/practice destination. ReportShell supplies journal artwork, Home/Profile links, avatar and module bookmarks. useReportProfile displays cache then refreshes.

IdentifyWorkingMemoryReport.fetchResults retrieves screening history and builds chartData. ImproveWorkingMemoryReport.fetchReportData retrieves profile, saved progress and attempts; it displays level/game status and historical scores. Recharts draws stored-data graphs.

| Persistent model | Why it exists |
| --- | --- |
| WorkingMemoryIdentify | One screening with responses, totals, metrics/risk and optional ML output |
| WorkingMemoryImproveProgress | One unique per-student current progress tree with access/completion/best scores/stars |
| WorkingMemoryImproveAttempt | One practice attempt with grade/language/answers/score/rewards/times |
| Student | Identity, password hash, editable profile and WM totalStars counter |
| Admin / School | Administrative accounts and entered school/package details |

student.controller.getProfile combines module stars for home/profile. Working Memory uses the appropriate maximum of its student/progress counters, rather than adding duplicate copies. totalCarrots/carrotsEarned are legacy compatibility names for stars.

getLearningSummary reports first unlocked incomplete level, games completed and latest WM weakAreas. initialIdentifiedLevel, maxUnlockedLevel and dashboard currentLevel can differ.

The improvement report's historical PASSED badge currently checks score >= 2, whereas actual backend progression requires >= 3. Explain the backend rule and identify the display inconsistency if asked. The achievements hub is report navigation; it does not award an additional badge/reward itself.

**Admin: demonstrate implemented panels.**

AdminLogin.handleSubmit posts /api/admin/login, stores adminToken/adminUser and navigates /admin. AdminRegister posts /api/admin/register and returns to login. The admin JWT includes id, role, type:"admin" and a one-day expiry. verifyToken validates it, isAdmin checks the admin type, and isSuperAdmin additionally requires the super admin role.

Admin Dashboard wraps nested Routes in AdminLayout. /admin redirects to /admin/students. Sidebar hiding uses stored role for presentation; backend middleware enforces protected endpoint access.

| Panel | Component and key functions | Actual data/actions |
| --- | --- | --- |
| /admin/students | StudentProfiles: fetchStudents, handleUpdate, handleDelete | GET students; local name/grade/school filtering; super-admin update/delete |
| /admin/users | UserManagement: fetchData, handleRegisterSubmit, handlePasswordReset, handleEditSubmit, handleToggleStatus | Super-admin account creation/edit, direct password replacement and deactivation/reactivation |
| /admin/schools | SchoolManagement: fetchSchools, calculateCost, handleSubmit | School list/create; entered studentCount and package pricing |
| /admin/wm-identify | WMIdentifyResults: load effect, filters/grouping, downloadData(format) | Saved screening analytics, student grouping, attempt details and CSV/XLSX exports |
| /admin/speech-identify and speech-improve | SpeechIdentifyResults / SpeechImproveResults | Stored speech session/attempt summaries |
| /admin/pa-identify | PAIdentifyResults | Stored PA identification records |
| /admin/wm-improve, pa-improve, reading-identify, reading-improve | Corresponding results components | Placeholder panels; no active data-fetch implementation |

Admin components currently call Axios directly at localhost:5000. frontend/src/services/admin/api.js is empty. The backend implementation is backend/src/modules/admin/controllers/admin.controller.js; permissions are visible in routes/admin.routes.js.

GET /api/admin/students and /results/working-memory/identify require admin JWT. Student update/delete, admin listing/management, creation and account reset/status routes require super admin. Schools can be read by admins and created by super admins.

Admin statistics come from downloaded arrays. WM cards count matching attempts, unique matching students and average saved finalScore across matching attempts. School totals sum saved form values; studentCount is not recomputed from Student records. School price is count*500 monthly or count*4800 annual; frontend previews, backend calculates again.

WM export groups the full collection and exports each student's latest record; current display filters do not narrow that export. Student deletion removes the student document without cascading learning records. Current list/result endpoints do not school-filter school-admin queries.

**Endpoints you can trace on demand.**

The student client uses baseURL http://localhost:5000/api. app.js mounts feature prefixes; route files select controller functions; controllers call Mongoose models. req.body holds a JSON payload, req.params holds path parameters, req.query holds filters, and res.json sends the reply.

| Request | Caller/implementation |
| --- | --- |
| POST /api/auth/register/student | registerStudent service → auth.controller.registerStudent |
| POST /api/auth/login | login service → auth.controller.login |
| GET/PUT /api/students/profile | student service → student.controller.getProfile/updateProfile |
| GET /api/students/learning-summary | Dashboard → student.controller.getLearningSummary |
| POST /api/working-memory/identification/save-result | identifyApi → workingMemoryIdentify.controller.saveResult |
| GET /api/working-memory/identification/student-results/:studentId | screening report → getStudentResults |
| GET /api/working-memory/improvement/progress/:studentId | improveApi → getStudentProgress; can initialize persistent progress |
| POST /api/working-memory/improvement/submit-attempt | improveApi → submitSubCategoryAttempt |
| GET /api/working-memory/improvement/history/:studentId | reports/controller history refresh → getAttemptHistory |
| POST /api/admin/login | AdminLogin → admin.controller.loginAdmin |
| GET /api/admin/results/working-memory/identify | WMIdentifyResults → admin.controller.getWMIdentifyResults |

Identification wrappers return an Axios response, so records are res.data.data. Improvement wrappers return response.data (the API body), which itself contains data. These different wrapper shapes explain otherwise similar-looking access expressions.

**Be accurate about current limitations.**

The Working Memory routers currently do not install verifyToken/ownership checks, although frontend pages are protected and the client attaches tokens. Student profile and admin APIs do use middleware. WM accepts supplied correctness/metrics/score rather than independently grading against a server bank. The frontend uses five questions, but the backend accepts other matching positive counts and uses an absolute score >= 3.

Attempt, student stars and progress are separate writes without a transaction/idempotency key. In-page refs prevent routine double clicks but do not guarantee deduplication of arbitrary network requests. Existing progress is shared across grades/languages, while submission requires a screening for the submitted grade.

Public admin registration currently permits both allowed roles, including super admin. Token middleware does not refetch active status on every request. These are existing limitations, not features to claim have been fixed.

**Other module entry points, if the panel points to their home cards.**

| Module | Actual routed screen files |
| --- | --- |
| Phonological Awareness | frontend/src/pages/phonologicalAwareness/identificationActivities.jsx, ImprovementLevels.jsx, ImprovementActivityPA.jsx |
| Speech Processing | frontend/src/pages/speechProcessing/LeoIdentificationGame.jsx, LeoTrainingSafari.jsx |
| Reading Processing | frontend/src/pages/readingProcessing/sample.jsx; home popup marks it Coming soon |

This guide examines Working Memory internals in depth and the shared app/auth/admin/report paths. The table above locates other modules; it does not certify every PA/speech algorithm. Use their registered route and onClick/API chain when a deeper question arises.

**Practise these examiner questions with the files open.**

| Likely question | Open / point to | Simple answer and related file |
| --- | --- | --- |
| Where is this home animal button? | Dashboard.jsx: cards and cards.map | “The data entry supplies its image/title and map creates the button. dashboard.css places it.” |
| Where does its name come from? | Dashboard.jsx: t("working_memory"); locales/en/common.json | “The translation key supplies the live module label; it is not baked into the image.” |
| What runs after this click? | handleCategoryClick → ActivitySelectionModal → handleActivitySelect | “State opens the popup; the popup calls a parent callback; the parent navigates.” |
| How are animals positioned? | dashboard.css: .dashboard-cards; popup regionStyle | “Home uses a grid; popup uses measured percentage regions over a board.” |
| What is a ref here? | Dashboard: backgroundVideoRef | “It points to the mounted video element so the handler can call its media methods.” |
| Why async/await? | Login.handleSubmit or handleCompleteQuiz | “The request finishes later; await lets success/error handling use its completed result.” |
| How do you stop a form reload? | handleSubmit: e.preventDefault() | “React handles validation and the API request instead of ordinary browser form navigation.” |
| Why validate twice? | authValidation.js and studentValidation.js | “Browser validation gives immediate feedback; server validation checks submitted data independently.” |
| Is the password stored directly? | auth.controller: bcrypt.hash / bcrypt.compare | “MongoDB stores a salted hash; login compares the supplied password against it.” |
| How does login persist? | Login: localStorage.setItem; services/api.js interceptor | “The token is stored and attached to later requests; backend verifies it where middleware is installed.” |
| Where do questions come from? | identification/data/index.js; improvement/data/index.js | “Local grade/language banks supply questions and expected answers.” |
| Which state selects this screen? | ScreeningPage.entryPhase/phase; ImprovementPage.phase | “Conditional JSX returns the screen for the current state.” |
| What ends memorization? | ScreeningPage question effect; ImprovementPage countdown effect | “A timer changes phase to answer; answering itself is untimed.” |
| Where is screening scoring? | scoring.js: calculateWorkingMemoryMetrics and finalScore | “Category/span/time metrics contribute to the weighted score; thresholds give risk labels.” |
| What does the model do? | workingMemoryIdentify.controller: fetch /predict | “An optional external service receives seven metrics and returns prediction/confidence. Its trained implementation is outside this repo.” |
| How is this game answer checked? | answerChecking.js plus game handler | “Pattern compares a token, pictures compare stable ordered IDs, numbers compare normalized sequences, instructions compare selected text.” |
| How does dragging work? | ImprovementPage.handleDragStart/handleDropOnSlot | “The handler tracks source/value, copies slots/pool, moves or swaps, then state redraws both rows.” |
| Why create shared components? | GameLayout.MemoryBoard/MemoryButton; ActivityScreen | “The same visuals and accessibility behavior are reused while parent props supply content/actions.” |
| Where are levels unlocked? | improve controller: isPassed, allSubCatsCompleted | “A saved passing attempt completes a game and unlocks its next activity; all four complete a level.” |
| Score versus stars? | evaluateAnswer; backend STARS_PER_CORRECT | “Score counts correct questions; reward is five stars per correct answer in each saved attempt.” |
| Where is progress stored? | workingMemoryImprove.model.js | “A per-student progress document stores current access; attempt documents preserve history.” |
| What if saving fails? | submissionError/handleRetrySave; progressError/handleRetryProgress | “Save retry and read-refresh retry are separate so refreshing does not repeat a saved attempt.” |
| What if I remove this button? | Its JSX onClick/onSubmit, then handler and references | “Remove its rendering, inspect whether the handler is reused and preserve needed navigation/accessibility; deleting JSX alone does not delete database behavior.” |
| What if I change the pass condition? | Backend normalizedScore >= 3 and frontend score >= 3 | “Both progression and UI continuation depend on it, so changing only one creates inconsistent behavior.” |
| Where does admin data come from? | Admin panel axios call → admin.routes → controller | “Protected API handlers retrieve stored records; role checks are enforced by middleware.” |
| Are all admin panels complete? | WMImproveResults.jsx and the other placeholder components | “Those specific panels are placeholders; student WM gameplay and its student report are implemented separately.” |
| How do achievements update? | report API loads; student.controller.getProfile/getLearningSummary | “They read saved attempts/progress and computed totals when opened.” |

**Rehearse one short demonstration.**

1. Open App.jsx and identify /dashboard and the three WM routes.
2. Sign in with an existing demo account. Open Dashboard.jsx and point to cards.map and handleCategoryClick.
3. Open the WM popup and explain the parent callback. Show a demo first if you need to avoid saving a screening.
4. Show a real screening question and point to its grade bank, phase effect and evaluateIdentifyAnswer. Explain the scoring formula without waiting to replay every question during code explanation.
5. Open the map with an already screened demo student. Show locked/unlocked flags and the backend pass condition.
6. Demonstrate Pattern select→Check, Picture Ready→reorder, Instructions Listen→question and Numbers Ready→keypad. Explain that the shared controller records each answer.
7. Show saved results/achievements and identify progress versus attempt history.
8. Open admin with an appropriate demo account. Show student lists and WM screening analytics, while identifying placeholder panels accurately.
9. Finish by tracing one API: visible handler → service URL → backend route → controller → Mongoose model.

If a demonstration request fails, first inspect the browser Network request's URL/status and response, then the related controller. A spinner/error alone does not prove a score, screening state or unlock condition. Explain the actual observed behavior rather than inventing a successful service response.
