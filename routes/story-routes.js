const express = require("express");
const router = express.Router();
const {AuthCheck} = require("../middleware/auth-check");
const {postStory, getUserStories} = require("../controlers/story-controler");
const fileUpload = require("../middleware/file-upload");

router.post("/new", AuthCheck,fileUpload.single("image"), postStory); // POST A STORY
router.get("/", AuthCheck, getUserStories); // GET ALL USER STORIES

// story/new - pievienot storiju
// story/ - visi visi storiji
// story/storieId - konkrētu storiju

module.exports = router;