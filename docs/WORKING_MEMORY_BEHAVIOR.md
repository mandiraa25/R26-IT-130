# Working Memory: behavior and API contract

Baseline reviewed on 2026-10-17. This records the behavior preserved by the folder reorganization. It describes source code and local checks; it does not claim a live database audit.

## Grades, levels and games

School Grades 2, 3 and 4 each support English (`en`) and Sinhala (`si`). Each grade has four improvement difficulty levels. A school grade and a difficulty level are different choices.

The saved activity keys and their order stay unchanged:

| Order | Saved key | Displayed game |
|---|---|---|
| 1 | `pattern` | Pattern Recognition |
| 2 | `words` | Picture Memory |
| 3 | `instructions` | Following Instructions |
| 4 | `numbers` | Number Memory / Number Recall |

Questions are JavaScript data. Image filenames, picture sprite indexes and pattern atlas coordinates provide artwork; they do not determine the answers. Question IDs, translations, answers and grade-specific content remain unchanged.

## Screening

Each real screening uses all 15 questions for the selected grade and language. A demo selects a small practice set or the question IDs requested by the existing demo URL. Demos do not save screening results.

Picture and number screening questions show a memorization phase before recall:

| School grade | Memorization time |
|---|---|
| 2 | 8 seconds |
| 3 | 7 seconds |
| 4 | 6 seconds |

Patterns can be answered immediately. Instructions use speech before recall and retain the existing manual fallback when audio cannot complete. Response timing begins when the answer phase starts, so it excludes memorization. Recorded `timeTaken` and `memorizationTimeAllocated` use milliseconds.

The answer evaluator preserves exact sequence order. Multiple-choice answers compare the selected answer with the configured answer. Screening also records an error classification, such as `wrong_order`, `partial_recall`, `skipped` or `guess`, using the existing evaluator.

The frontend calculates screening metrics. The weighted final score uses recall accuracy (25%), digit span (25%), sequence score (15%), instructions (15%), patterns (10%) and response time (10%). Final scores of at least 75 produce `Low` risk; at least 45 produce `Moderate`; lower scores produce `High`. The backend derives the total score, question count and total response time from the supplied answer records. It also attempts optional ML enrichment; an unavailable ML service does not prevent saving.

## Improvement attempts and timing

An attempt selects up to five questions from the activity's existing pool. Current banks supply five questions per activity. Selection shuffles question order for every game, including Picture Memory. A retry prefers unseen questions if a larger pool becomes available and avoids repeating the exact previous order when possible.

| Game | Current behavior before answering |
|---|---|
| Pattern Recognition | The pattern and choices appear immediately; no memorization countdown. |
| Picture Memory | Ready reveals the pictures for 10 seconds at every difficulty level. |
| Following Instructions | The child starts listening and continues to recall through the existing controls; no level countdown. |
| Number Memory / Recall | Ready reveals numbers for 12, 10, 8 or 6 seconds in Levels 1, 2, 3 or 4 respectively. |

Picture and number answers must match the configured order. Number answers normalize values to strings; backward questions already store the expected backward answer in their data. Picture answers compare item IDs, require every slot, and reject repeated IDs. Instructions and patterns compare one selected answer. The existing tap, drag, swap and Undo interactions remain intact.

Each question records one answer and then shows feedback. Next advances the question. The final Next shows the result and submits the completed attempt. Local guards prevent repeated clicks from scoring a question or submitting an activity twice. A failed progress refresh retries the read; it does not repeat a successful attempt submission.

Improvement question timing begins during question setup, before Ready and memorization, and uses milliseconds. Total attempt time starts when the activity begins, includes feedback/navigation time, and is submitted in seconds. These timing semantics differ from screening and are preserved.

## Rewards and progression

- Each correct improvement answer earns five stars. Stars accumulate on every recorded attempt, including retries and attempts below the pass mark.
- Three correct answers pass the current five-question activity. A passing attempt completes the activity and unlocks the next activity in its level.
- A failed retry keeps an earlier completion, best score and unlocked activities. The current result screen still requires a passing current attempt before continuing from that screen.
- All four activities must be completed for a level to be complete. Completing the highest unlocked level unlocks the next level and its pattern activity. Progression stops at Level 4.
- Level completion dashboards use saved progress and attempt history. Their category star totals include recorded retries.

Without any screening record, improvement reports all levels locked. Initial progress uses the student's earliest screening across grades. ML prediction takes precedence over the saved risk label:

| Stored risk / prediction | Initial maximum unlocked level |
|---|---|
| `High`, `Severe` | 1 |
| `Moderate`, `Medium` | 2 |
| `Low`, `Mild` | 3 |
| `No Risk`, `Minimal`, `Low Risk` | 4 |

If no recognized label is available, screening accuracy chooses Level 1 below 40%, Level 2 below 65%, Level 3 below 85%, and Level 4 otherwise. Every initially accessible level starts with only its pattern activity unlocked.

## Preserved API and storage

The shared API client adds `/api` to these existing endpoints. No route, model name or saved category key changes with the source moves.

| Method | Endpoint after `/api` | Contract |
|---|---|---|
| POST | `/working-memory/identification/save-result` | Receives `studentId`, `grade`, `questionResults`, `metrics`; returns the saved screening in `{ success, message, data }`. |
| GET | `/working-memory/identification/student-results/:studentId` | Returns screening history, newest first, in `{ success, data }`. |
| GET | `/working-memory/improvement/progress/:studentId` | Returns student progress in `{ success, data }`; may initialize progress from the earliest screening. |
| POST | `/working-memory/improvement/submit-attempt` | Receives `studentId`, `grade`, `language`, `levelNumber`, `subCategoryKey`, `score`, `totalQuestions`, `questionResults`, `totalTimeTaken`. |
| GET | `/working-memory/improvement/history/:studentId` | Returns attempts, newest completion first; optional `levelNumber` and `subCategoryKey` query filters. |

An improvement answer record contains `questionId`, `userAnswer`, `correctAnswer`, `isCorrect` and `timeTaken`; the schema also retains its existing optional `instruction` field. A successful attempt returns status 201 and `data` containing `isPassed`, `achievePercentage`, `attempt`, `progress`, `starsEarned`, `carrotsEarned`, `totalStars` and `totalCarrots`.

The models remain `WorkingMemoryIdentify`, `WorkingMemoryImproveProgress` and `WorkingMemoryImproveAttempt`. Progress is one document per student. Attempts separately retain grade, language, level, activity, attempt number, answers and timings. Existing `totalCarrots` / `carrotsEarned` compatibility fields remain alongside stars. Where used, reads prefer the stars field and fall back to its carrot field only when the stars field is absent.

The improvement access service caches verified profile/progress in memory for 30 seconds, bound to the login token. Screening saves clear that cache. Successful improvement saves update or clear it before later reads.

## Existing differences to keep visible

These are baseline observations, not behavior changes introduced by this reorganization:

- Progress is shared across school grades, but submitting an improvement attempt requires a screening record for that submitted grade. The map can therefore appear accessible while a submission for another unscreened grade is rejected.
- The frontend plays five questions, while the backend accepts any positive integer question count with a matching number of answer records. Its pass check is the absolute `score >= 3`, rather than a percentage.
- The improvement backend validates the score range but trusts the supplied score and correctness records; it does not recalculate answers from the frontend question banks. Its score validation also accepts finite non-integer values.
- A `Low` risk label initializes Level 3. Older browser-test comments claiming that `Low` unlocks all four levels do not match the controller.
- Refreshing progress and retrying a failed save are separate operations. The existing API has no attempt-idempotency key; the local guards do not provide a server-wide duplicate-request guarantee.

The source of truth for progression is `workingMemoryImprove.controller.js`; screening persistence is in `workingMemoryIdentify.controller.js`. The frontend answer evaluators, activity controller and question configuration define the matching presentation behavior. Structural cleanup must preserve these contracts; broader policy changes need separate work.
