const express = require("express");
const router = express.Router();
const {AuthCheck} = require("../middleware/auth-check");
const {postStory} = require("../controlers/create-controler");
const fileUpload = require("../middleware/file-upload");

router.post("/new_story", AuthCheck,fileUpload.single("image"), postStory);


module.exports = router;