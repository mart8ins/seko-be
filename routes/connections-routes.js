const express = require("express");
const router = express.Router();
const { getAllUsers, sendRequestForConnection, acceptConnectionRequest, getUser } = require("../controlers/connections-controler");
const {AuthCheck} = require("../middleware/auth-check");

// root  - "/api/connections"

router.get("/", AuthCheck, getAllUsers); // ALL USERS
router.get("/user/:userId/profile", AuthCheck, getUser);

router.post("/sendRequest", AuthCheck, sendRequestForConnection); // send request for connection
router.post("/acceptRequest", AuthCheck, acceptConnectionRequest);


module.exports = router;

