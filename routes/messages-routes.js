const express = require("express");
const router = express.Router();

const { sendMessage } = require("../controlers/messages-controler");
const {AuthCheck} = require("../middleware/auth-check");


router.post("/messages/new", AuthCheck, sendMessage); // send message to user




module.exports = router;