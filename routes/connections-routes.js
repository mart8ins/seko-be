const express = require("express");
const router = express.Router();
const { getAllNotConnectedUsers,
        getUser,
        getUsersConnections,
        requestConnection,
        acceptConnection } = require("../controlers/connections-controler");
const {AuthCheck} = require("../middleware/auth-check");


router.get("/:uid", AuthCheck, getUser); // user
router.get("/", AuthCheck, getAllNotConnectedUsers); // all not connected users
router.get("/:uid/connections", AuthCheck, getUsersConnections); // user connections

router.post("/:uid/connections/accept", AuthCheck, acceptConnection); // accept connection request
router.post("/:uid/connections/request", AuthCheck, requestConnection); // send connection request


module.exports = router;