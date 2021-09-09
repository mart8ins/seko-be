const express = require("express");
const router = express.Router();
const {AuthCheck} = require("../middleware/auth-check");
const {changeProfileData} = require("../controlers/profile-controler");

router.post("/profile/change/userdata", AuthCheck, changeProfileData)

module.exports = router;