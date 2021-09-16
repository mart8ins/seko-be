const express = require("express");
const router = express.Router();
const {AuthCheck} = require("../middleware/auth-check");
const {changeProfileData, changeProfilePassword, addProfilePhoto, changeAbout} = require("../controlers/profile-controler");
const fileUpload = require("../middleware/file-upload");

router.post("/change/userdata", AuthCheck, changeProfileData);
router.post("/change/password", AuthCheck, changeProfilePassword);
router.post("/change/about", AuthCheck, changeAbout);
router.post("/change/photo", AuthCheck, fileUpload.single("profile_photo"), addProfilePhoto);

module.exports = router;