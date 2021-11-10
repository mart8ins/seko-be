const express = require("express");
const router = express.Router();
const {AuthCheck} = require("../middleware/auth-check");
const {getContentFeed} = require("../controlers/contentFeed-controler");

// "/api/contentFeed"

router.get("/", AuthCheck, getContentFeed);

module.exports = router;