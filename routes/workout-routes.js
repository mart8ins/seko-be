const express = require("express");
const router = express.Router();
const {AuthCheck} = require("../middleware/auth-check");
const {saveTrainingSession, getAllUserTrainingSessions} = require("../controlers/workout-controler");

router.get("/:userId/sessions", AuthCheck, getAllUserTrainingSessions);


router.post("/new", AuthCheck, saveTrainingSession);

module.exports = router;