const express = require("express");
const router = express.Router();

const { sendMessage,
        getAllConversations,
        getMessageFeed,
        setAllMessagesAsRead} = require("../controlers/messages-controler");
const {AuthCheck} = require("../middleware/auth-check");


router.get("/messages/feed", AuthCheck, getMessageFeed); // get message feed for conversation
router.get("/messages", AuthCheck, getAllConversations); // get all conversations for user

router.post("/messages/new", AuthCheck, sendMessage); // send message to user
router.post("/messages", AuthCheck, setAllMessagesAsRead); // set all message as read




module.exports = router;