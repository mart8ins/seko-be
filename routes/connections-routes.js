const express = require("express");
const router = express.Router();
const { getAllUsers, sendRequestForConnection, acceptConnectionRequest, getUser, removeConnection } = require("../controlers/connections-controler");
const {AuthCheck} = require("../middleware/auth-check");

// root  - "/api/connections"

router.get("/", AuthCheck, getAllUsers); // ALL USERS
router.get("/user/:userId/profile", AuthCheck, getUser);

router.post("/sendRequest", AuthCheck, sendRequestForConnection); // send request for connection
router.post("/acceptRequest", AuthCheck, acceptConnectionRequest);
router.post("/removeConnection", AuthCheck, removeConnection);


module.exports = router;

