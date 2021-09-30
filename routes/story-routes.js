const express = require("express");
const router = express.Router();
const {AuthCheck} = require("../middleware/auth-check");
const {postStory, getAllStories, getUserStory, getAllUserStories, rateStory, deleteStory} = require("../controlers/story-controler");
const fileUpload = require("../middleware/file-upload");



router.get("/", AuthCheck, getAllStories); // GET ALL STORIES
router.get("/user/:userId", AuthCheck, getAllUserStories); // GET ALL STORIES FOR USER
router.get("/:storyId", AuthCheck, getUserStory); // GET SPECIFIC STORY

router.post("/new", AuthCheck,fileUpload.single("image"), postStory); // POST A STORY
router.post("/rate", AuthCheck, rateStory) // RATE A STORY
router.post("/delete", AuthCheck, deleteStory) // delete story

// story/new - pievienot storiju
// story/ - visi visi storiji
// story/storieId - konkrētu storiju
// story/user/userId - visus usera storijus
// story/rate - novērtēt storiju

module.exports = router;