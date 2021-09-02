const HttpError = require("../errors/HttpError");
const User = require("../models/User");
const { v4: uuidv4 } = require('uuid');

// SEND MESSAGE TO USER
const sendMessage = async(req,res, next)=> {
    try {
    const conversationId = uuidv4();

    const id = req.userData.userId; // logged user
    // posted message body
    const messageBody = req.body.data;

    // both users
    const exploredUser = await User.findOne({_id: messageBody.user.userId});
    const loggedUser = await User.findOne({_id: id});

    // update message body with explored users photo
    const messageBodyUpdate = {...messageBody};
    messageBodyUpdate.user.photo = exploredUser.photo || "https://images.unsplash.com/photo-1554526735-fca5ffabeb31?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80";

    // destructing posted message body with user object and message body for storing in logged user data
    const {message, user} = messageBodyUpdate;
    const {userId} = user;

    // refactor for storing to explored users data
    const userRefactor = {
        userId: String(loggedUser._id),
        firstName: loggedUser.firstName,
        lastName: loggedUser.lastName,
        photo: loggedUser.photo || "https://images.unsplash.com/photo-1554526735-fca5ffabeb31?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=634&q=80"
    }
    const messageRefactor = {
        ...message,
        type: "recieved",
        isRead: false
    }

    // users messages array
    const exploredUserMessages = exploredUser.messages;
    const userMessages = loggedUser.messages;

    // need to loop through and see if conversation between user already exists
    const isConversationStarted = userMessages.some((user) => { 
        return user.user.userId === userId;
    })

    if(!isConversationStarted) {
        // for logged user
        userMessages.push({
            id: conversationId,
            user,
            messages: [message]
        })
        // for explored user 
        exploredUserMessages.push({
            id: conversationId,
            user: userRefactor,
            messages: [messageRefactor]
        })
    } else {
        // for logged user
        userMessages.map((userMessages) => {
            if(userMessages.user.userId === userId) {
                return userMessages.messages.push(message);
            }
        })
        // for explored user 
        exploredUserMessages.map((userMessages)=> {
            if(userMessages.user.userId === String(loggedUser._id)) {
                return userMessages.messages.push(messageRefactor);
            }
        })
    }
        await loggedUser.save();
        await exploredUser.save();
        res.json({message: "Message send success!", details: {message: message}})
    } catch(e) {
        const error = new HttpError("Failed to send user message!", 400);
        next(error);
    }
}

// RETURN ALL CONVERSATIONS BETWEEN USERS
const getAllConversations = async(req,res, next) => {
    try {
        const id = req.userData.userId; 
        const user = await User.findOne({_id: id});
        const conversations = user.messages;
        res.json({message: "Conversations retrieved!", conversations})
    } catch(e) {
        const error = new HttpError("Failed to get user conversations.", 404);
        next(error);
    }
}

// RETURN CONVERSATION FEED OF MESSAGES for logged user and explored user
const getMessageFeed = async(req,res, next) => {
    try {
        const {userId} = req.query; // explored user
        const id = req.userData.userId; // logged user
        const user = await User.findOne({_id: id});
        const userMessages = user.messages;

        const userConversation = userMessages.filter((conv) => {
             return String(conv.user.userId) === String(userId);
        })
        res.json({message: "Messages retrieved!", messages: userConversation[0].messages})
    } catch(e) {
        const error = new HttpError("Failed to get user messages.", 404);
        next(error);
    }
}

// SETS ALL UNREAD MESSAGE AS READ AND RETURN UPDATED CONVERSATION
const setAllMessagesAsRead = async(req, res, next)=> {
    try {
        const {exploredUserId} = req.body;
        const {userId} = req.userData; // logged user

        // logged user all conversations/messages
        const user = await User.findOne({_id: userId});
        const userMessages = user.messages;

        // conversation between logged user and explored user
        const userConversation = userMessages.filter((conv) => {
            return String(conv.user.userId) === String(exploredUserId);
        })
        // all messages between logged user and explored user
        const userConversationMessages = userConversation[0].messages;
        userConversationMessages.forEach((message)=> {
            return message.isRead = true;
        })
        await user.save();

        res.json({message: "Messages status set", updatedMessages: userConversationMessages})
    } catch(e) {
        const error = new HttpError("Failed to set all messages as readed", 400);
        next(error);
    }
}


module.exports.sendMessage = sendMessage;
module.exports.getAllConversations = getAllConversations;
module.exports.setAllMessagesAsRead = setAllMessagesAsRead;
module.exports.getMessageFeed = getMessageFeed;