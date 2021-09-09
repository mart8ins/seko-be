const express = require("express");
const router = express.Router();
const {AuthCheck} = require("../middleware/auth-check");
const {changeProfileData, changeProfilePassword} = require("../controlers/profile-controler");

router.post("/profile/change/userdata", AuthCheck, changeProfileData);
router.post("/profile/change/password", AuthCheck, changeProfilePassword);

module.exports = router;