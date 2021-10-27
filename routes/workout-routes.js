const express = require("express");
const router = express.Router();
const {AuthCheck} = require("../middleware/auth-check");
const {saveTrainingSession, getAllTrainingDays, getAllUserTrainingDays, getTrainingDay, deleteTrainingDay} = require("../controlers/workout-controler");

// GET ALL TRAINING days
router.get("/all", AuthCheck, getAllTrainingDays);

// GET ALL USERS days
router.get("/:userId", AuthCheck, getAllUserTrainingDays);

// GET TRAINING DAY
router.get("/trainingday/:trainingDayId", AuthCheck, getTrainingDay);

router.post("/trainingday/delete", AuthCheck, deleteTrainingDay);

// SAVE NEW TRAINING SESSION
router.post("/new", AuthCheck, saveTrainingSession);

module.exports = router;