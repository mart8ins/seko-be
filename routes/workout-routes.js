const express = require("express");
const router = express.Router();
const {AuthCheck} = require("../middleware/auth-check");
const {saveTrainingSession, getAllTrainingSessions, getAllUserTrainingSessions} = require("../controlers/workout-controler");

// GET ALL TRAINING SESSIONS
router.get("/sessions", AuthCheck, getAllTrainingSessions);

// GET ALL USERS SESSIONS
router.get("/sessions/:userId", AuthCheck, getAllUserTrainingSessions);

// SAVE NEW TRAINING DAY/SESSION
router.post("/new", AuthCheck, saveTrainingSession);

module.exports = router;