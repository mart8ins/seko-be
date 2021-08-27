const express = require("express");
const router = express.Router();
const { getAllNotConnectedUsers,
        getUser,
        getUsersConnections,
        requestConnection,
        acceptConnection,
        sendMessage,
        getAllConversations,
        getMessageFeed,
        setAllMessagesAsRead} = require("../controlers/user-controler");
const {AuthCheck} = require("../middleware/auth-check");


router.get("/messages/feed", AuthCheck, getMessageFeed); // get message feed for conversation
router.get("/messages", AuthCheck, getAllConversations); // get all conversations for user
router.get("/:uid", AuthCheck, getUser); // user
router.get("/", AuthCheck, getAllNotConnectedUsers); // all not connected users
router.get("/:uid/connections", AuthCheck, getUsersConnections); // user connections

router.post("/:uid/connections/accept", AuthCheck, acceptConnection); // accept connection request
router.post("/:uid/connections/request", AuthCheck, requestConnection); // send connection request
router.post("/messages/new", AuthCheck, sendMessage); // send message to user
router.post("/messages", AuthCheck, setAllMessagesAsRead); // send message to user




module.exports = router;