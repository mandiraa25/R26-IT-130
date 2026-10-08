const PhonologicalIdentify = require("../models/phonologicalIdentify.model");
const axios = require("axios");

exports.saveQuizResult = async (req, res) => {
  try {
    const { studentId, grade, totalScore, totalQuestions, questionResults, totalTimeTaken, metrics } = req.body;

    // Prepare features for ML model
    // Times are converted from milliseconds to seconds
    const mlInputFeatures = {
      pa_score: metrics.categoryScores["Phonological Awareness"] || 0,
      pa_time: (metrics.categoryTimes["Phonological Awareness"] || 0) / 1000,
      vp_score: metrics.categoryScores["Visual Processing"] || 0,
      vp_time: (metrics.categoryTimes["Visual Processing"] || 0) / 1000,
      ls_score: metrics.categoryScores["Literacy Skills"] || 0,
      ls_time: (metrics.categoryTimes["Literacy Skills"] || 0) / 1000,
      total_time: totalTimeTaken / 1000,
    };

    let mlPrediction = null;

    try {
      // Call ML model API
      const mlResponse = await axios.post("http://127.0.0.1:8000/predict", mlInputFeatures, {
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
        },
      });

      if (mlResponse.data) {
        mlPrediction = {
          predicted_risk_level_encoded: mlResponse.data.predicted_risk_level_encoded,
          predicted_risk_level: mlResponse.data.predicted_risk_level,
          input_features: mlResponse.data.input_features,
        };
      }
    } catch (mlError) {
      console.error("Error getting ML prediction:", mlError.message);
      // We don't throw here to ensure the quiz result is still saved even if ML model is down
    }

    const newResult = new PhonologicalIdentify({
      studentId,
      grade,
      totalScore,
      totalQuestions,
      questionResults,
      totalTimeTaken,
      metrics,
      mlPrediction, // Save prediction results if available
    });

    await newResult.save();

    res.status(201).json({
      success: true,
      message: "Quiz results saved successfully",
      data: newResult,
    });
  } catch (error) {
    console.error("Error saving quiz result:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save quiz results",
      error: error.message,
    });
  }
};

exports.getStudentResults = async (req, res) => {
  try {
    const { studentId } = req.params;
    const results = await PhonologicalIdentify.find({ studentId }).sort({ createdAt: -1 });

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
