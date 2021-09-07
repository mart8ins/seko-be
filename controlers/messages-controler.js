const HttpError = require("../errors/HttpError");
const User = require("../models/User");
const { v4: uuidv4 } = require('uuid');

// SEND MESSAGE TO USER
const sendMessage = async(req,res, next)=> {
    try {
    const id = req.userData.userId; // logged user
    // posted message body
    const messageBody = req.body.data;
    const messageText = messageBody.message.text;
    const recieverId = messageBody.recieverId;

    // both users
    const loggedUser = await User.findOne({_id: id});
    const exploredUser = await User.findOne({_id: recieverId});

    // logged users conversations/messages in db
    const loggedUsersMessages = loggedUser.messages;
    const exploredUsersMessages = exploredUser.messages;

    // check if conversation between users exists
    const conversationsExists = loggedUsersMessages.filter((conv)=> {
        return conv.users.includes(String(id)) && conv.users.includes(String(recieverId))
    })

    // defined message object for every user
    const messagesForSender = {
                text: messageText,
                sent: true
            }
        
    const messagesForReciever = {
                text: messageText,
                sent: false
            }

    if(conversationsExists.length === 0) {
        // if there is no started conversation between users create it
        const newConversations = {
            id: uuidv4(),
            users:[id, recieverId]
        }
        loggedUsersMessages.push({...newConversations, messages: [messagesForSender]});
        exploredUsersMessages.push({...newConversations, messages: [messagesForReciever]});
        await loggedUser.save();
        await exploredUser.save();
    } else {
        // conversation already exists, so store only messages to both users 
        conversationsExists[0].messages.push(messagesForSender) // loged user

        // get explored users conversation object
        const conversationForExploredUser = exploredUsersMessages.filter((conv)=> {
            return conv.users.includes(String(id)) && conv.users.includes(String(recieverId))
        });
        conversationForExploredUser[0].messages.push(messagesForReciever);
        await loggedUser.save();
        await exploredUser.save();
    }
    res.json({message: "Message send success!"});
    } catch(e) {
        const error = new HttpError("Failed to send user message!", 400);
        next(error);
    }
}

module.exports.sendMessage = sendMessage;