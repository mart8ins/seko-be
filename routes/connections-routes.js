const express = require("express");
const router = express.Router();
const { getAllUsers, sendRequestForConnection, acceptConnectionRequest } = require("../controlers/connections-controler");
const {AuthCheck} = require("../middleware/auth-check");


router.get("/", AuthCheck, getAllUsers); // ALL USERS

router.post("/sendRequest", AuthCheck, sendRequestForConnection); // send request for connection
router.post("/acceptRequest", AuthCheck, acceptConnectionRequest);


module.exports = router;

