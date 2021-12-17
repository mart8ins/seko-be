const express = require("express");
const router = express.Router();
const {AuthCheck} = require("../middleware/auth-check");
const {getContentFeed, getContentFeedActivity} = require("../controlers/contentFeed-controler");

// "/api/contentFeed"

router.get("/", AuthCheck, getContentFeed);
router.get("/activity", AuthCheck, getContentFeedActivity);

module.exports = router;