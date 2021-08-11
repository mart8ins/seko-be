const HttpError = require("../errors/HttpError");
const User = require("../models/User");

// get all users who is not connected with logged user
const getAllNotConnectedUsers = async (req, res, next) => {
    try {
        const {userId} = req.userData;
        const allUsers = await User.find({_id: {$ne: userId}}); // returns all users except logged user
        const loggedUser = await User.findOne({_id: userId}); // returns logged user
        const loggedUserConnectedWith = loggedUser.connections.connected; // array with logged users connected users

        // filter not connected users
        const filter = [...allUsers]
        loggedUserConnectedWith.forEach((connected) => {
            filter.forEach((user)=> {
                if(connected.userId == user._id){
                    filter.splice(filter.indexOf(user), 1)
                }
            })
        })
        res.status(200);
        res.json({users: filter})
    } catch(e) {
        const error = new HttpError("No users found.", 404);
        next(error);
    }





    // try {
    //     const allUsers = await User.find({});
    //     const {userId} = req.userData;
    //     const allUserExceptLogged = allUsers.filter((user)=> user.id !== userId);
    //     res.json({users: allUserExceptLogged})
    // } catch(e) {
    //     const error = new HttpError("No users found.", 404);
    //     next(error);
    // }
}

// get user from db
const getUser = async (req, res, next) => {
    try {
        const {uid} = req.params;
        const user = await User.findOne({_id: uid});
        res.json({user});
    } catch(e) {
        const error = new HttpError("User not found.", 404);
        next(error);
    }
}

// get users connections: {connected: [], requests: { recieved: [], sent: []}}
const getUsersConnections = async (req, res, next) => {
    try {
        const {uid} = req.params;
        const user = await User.findOne({_id: uid});
        const connections = user.connections;
        res.json({connections})
    } catch(e){
        const error = new HttpError("Connections for user not found.", 404);
        next(error);
    }
}

// logged user requested connection with explored user
const requestConnection = async (req, res, next) => {
    try{
        const {uid} = req.params; // request reciever (explored user);
        const {userId} = req.userData; // logged user

        const requestReciever = await User.findOne({_id: uid}); // request reciever (explored user);
        const requestSender = await User.findOne({_id: userId}); // logged user

        // update request reciever
        requestReciever.connections.requests.recieved.push({
            firstName: requestSender.firstName,
            lastName: requestSender.lastName,
            userId: userId,
            date: new Date(),
            status: "pending"
        })
        // request request sender
        requestSender.connections.requests.sent.push({
            firstName: requestReciever.firstName,
            lastName: requestReciever.lastName,
            userId: uid,
            date: new Date(),
            status: "pending"
        })
        requestReciever.save();
        requestSender.save();

        res.status(201);
        res.json({
            message: "Request for connection sent successfully!",
            data: {updatedRequests: requestSender.connections.requests}
        });
    }catch(e){
        const error = new HttpError("Request for user connection failed", 400);
        next(error);
    }
}

// logged user accepted invitation for connection from other user
const acceptConnection = async(req,res,next)=> {
    const {uid} = req.params; // id for person whos sent invitation for connection
    const id = req.userData.userId; // logged users id
    try {
        const loggedUser = await User.findOne({_id: id});
        const userWhoSentRequest = await User.findOne({_id: uid});

        // update each users connections/connected array with connection
        loggedUser.connections.connected.push({
            firstName: userWhoSentRequest.firstName,
            lastName: userWhoSentRequest.lastName, 
            userId: uid, 
            connectedDate: new Date()
        });

        userWhoSentRequest.connections.connected.push({
            firstName: loggedUser.firstName,
            lastName: loggedUser.lastName,
            userId: id, 
            connectedDate: new Date()
        });

        // **** clear users sent and recieved arrays for logged user and user whos request is accepted
        // logged users recieved array 
        const updatedLoggedUserRecievedArray = loggedUser.connections.requests.recieved.filter((request)=> {
            return String(request.userId) !== String(uid);
        })
        loggedUser.connections.requests.recieved = updatedLoggedUserRecievedArray;
        loggedUser.save();

        // user who sent request sent array
        const updatedUserWhoSentRequestArray = userWhoSentRequest.connections.requests.sent.filter((request)=> {
            return String(request.userId) !== String(id);
        })
        userWhoSentRequest.connections.requests.sent = updatedUserWhoSentRequestArray;
        await userWhoSentRequest.save();

        // all users
        const updatedAllUsers = await User.find({_id: {$nin: id}});
        // logged users connected array
        const loggedUserConnectedWith = loggedUser.connections.connected;

        // return with response updated explored users (dosent return connected users)
        const filter = [...updatedAllUsers]
        loggedUserConnectedWith.forEach((connected) => {
            filter.forEach((user)=> {
                if(connected.userId == user._id){
                    filter.splice(filter.indexOf(user), 1)
                }
            })
        })

        res.status(202);
        res.json({message: "Request for connection accepted.", 
        data: {
            updatedConnectedWith: loggedUser.connections.connected,
            updatedExplore: filter,
            updatedRecievedRequests: loggedUser.connections.requests.recieved
        }});
    } catch(e) {
        const error = new HttpError("Accepting user connection request failed.", 400);
        next(error);
    }
}



const sendMessage = async(req,res, next)=> {
    try {
    // const {uid} = req.params; // explored user
    const id = req.userData.userId; // logged user

    // posted message body
    const messageBody = req.body.data;
    // console.log(messageBody)

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
    console.log(loggedUser, "logged user")
    const userRefactor = {
        userId: String(loggedUser._id),
        firstName: loggedUser.firstName,
        lastName: loggedUser.lastName,
        isConnected: messageBody.user.isConnected,
        photo: loggedUser.photo || "photo"
    }
    console.log(userRefactor, "user refactor")
    const messageRefactor = {
        ...message,
        type: "recieved"
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
            user,
            messages: [message]
        })
        // for explored user 
        exploredUserMessages.push({
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
        res.json({message: "Message send success!"})
    } catch(e) {
        const error = new HttpError("Failed to send user message!", 400);
        next(error);
    }
}

module.exports.getAllNotConnectedUsers = getAllNotConnectedUsers;
module.exports.getUser = getUser;
module.exports.getUsersConnections = getUsersConnections;
module.exports.requestConnection = requestConnection;
module.exports.acceptConnection = acceptConnection;
module.exports.sendMessage = sendMessage;