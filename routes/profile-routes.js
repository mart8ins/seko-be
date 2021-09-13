const express = require("express");
const router = express.Router();
const {AuthCheck} = require("../middleware/auth-check");
const {changeProfileData, changeProfilePassword, addProfilePhoto} = require("../controlers/profile-controler");
const fileUpload = require("../middleware/file-upload");

router.post("/profile/change/userdata", AuthCheck, changeProfileData);
router.post("/profile/change/password", AuthCheck, changeProfilePassword);
router.post("/profile/change/photo", AuthCheck, fileUpload.single("profile_photo"), addProfilePhoto);

module.exports = router;