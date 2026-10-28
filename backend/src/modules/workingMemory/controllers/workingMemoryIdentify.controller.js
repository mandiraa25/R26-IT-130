/*
 * FILE PURPOSE
 * Screening save/history request handlers and optional external ML prediction integration.
 *
 * HOW IT CONNECTS
 * The identification router calls saveResult/getStudentResults. WorkingMemoryIdentify stores the
 * submitted responses and metrics. fetch posts seven features to http://127.0.0.1:8000/predict.
 * Direct source importers: ../routes/workingMemoryIdentify.routes.js.
 *
 * THINGS TO REMEMBER
 * Totals are derived from submitted correctness/time, not rescored against a server bank. A successful
 * ML response adds prediction/confidence; model failure is logged and does not block saving. No
 * Working Memory predictor implementation/training artifacts were found in this repository. History is
 * newest first; initial improvement placement uses the oldest test.
 */

const WorkingMemoryIdentify = require("../models/workingMemoryIdentify.model");

/*
 * FUNCTION: saveResult
 * Store screening responses/metrics and optionally attach an external ML prediction.
 * WHEN: POST /save-result calls this controller.
 * HOW / RESULT: Derives totals from submitted responses, tries the seven-feature predict request, then
 * saves a Mongoose document even if prediction fails.
 */
exports.saveResult = async (req, res) => {
  // VIVA: Route -> controller -> Mongoose model. The frontend sends individual
  // screening responses and calculated metrics; this handler stores the test.
  try {
    const { studentId, grade, questionResults, metrics } = req.body;

    // The frontend payload currently might not explicitly provide these, so we calculate them strictly from the results
    const totalQuestions = questionResults ? questionResults.length : 0;
    const totalScore = questionResults ? questionResults.filter(q => q.isCorrect).length : 0;
    const totalTimeTaken = questionResults ? questionResults.reduce((acc, curr) => acc + (curr.timeTaken || 0), 0) : 0;
    // VIVA: These totals are derived from submitted correctness flags/times.
    // This controller does not re-check answers against a server question bank.

    // 🔥 CALL ML MODEL
    if (metrics) {
      // VIVA: The local Python prediction service receives seven features.
      // An unavailable prediction does not stop the screening result being saved.
      try {
        const mlResponse = await fetch("http://127.0.0.1:8000/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            recallAccuracy: metrics.recallAccuracy || 0,
            digitSpan: metrics.digitSpan || 0,
            sequenceScore: metrics.sequenceScore || 0,
            instructionScore: metrics.instructionScore || 0,
            patternScore: metrics.patternScore || 0,
            avgResponseTime: metrics.avgResponseTime || 0,
            timeScore: metrics.timeScore || 0
          })
        });

        if (mlResponse.ok) {
          const mlData = await mlResponse.json();
          metrics.mlPrediction = mlData.prediction;
          metrics.mlConfidence = mlData.confidence;
        }
      } catch (mlError) {
        console.error("ML Model call failed:", mlError.message);
      }
    }

    const data = new WorkingMemoryIdentify({
      studentId,
      grade,
      totalScore,
      totalQuestions,
      totalTimeTaken,
      questionResults,
      metrics
    });

    await data.save();

    res.status(201).json({
      success: true,
      message: "Working memory results saved",
      data,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/*
 * FUNCTION: getStudentResults
 * Return saved screening history newest first.
 * WHEN: GET /student-results/:studentId calls this controller.
 * HOW / RESULT: Queries Mongoose by supplied studentId; report views consume the returned data array.
 */
exports.getStudentResults = async (req, res) => {
  // VIVA: History returns newest screening first; improvement placement uses
  // its own oldest-first lookup when initializing progress.
  try {
    const { studentId } = req.params;
    const results = await WorkingMemoryIdentify.find({ studentId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch results",
      error: error.message,
    });
  }
};
