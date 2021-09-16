const HttpError = require("../errors/HttpError");
const User = require("../models/User");
// const { v4: uuidv4 } = require('uuid');

// GET ALL USERS
const getAllUsers = async (req, res, next) => {
    try {
        const {userId} = req.userData;
        const allUsers = await User.find({_id: {$ne: userId}}).select("-password"); // returns all users except logged user

        res.status(200);
        res.json({message: "All users except logged user!", allUsers})
    } catch(e) {
        const error = new HttpError("No users found.", 404);
        next(error);
    }
}

// GET ONE USER
const getUser = async (req, res, next) => {
    try {
        const {userId} = req.params;
        const user = await User.findOne({_id: userId}).select("-password");
    
        res.status(200);
        res.json({user})
    } catch(e) {
        const error = new HttpError("Fetching user data failed.", 404);
        next(error);
    }
}

// SEND REQUEST TO USER FOR CONNECTION
const sendRequestForConnection = async (req, res, next) => {
    try {
        const {exploredUserId} = req.body;
        const {userId} = req.userData;

        const requestReciever = await User.findOne({_id: exploredUserId}); // request reciever (explored user);
        const requestSender = await User.findOne({_id: userId}); // logged user
        
        // update request reciever
        requestReciever.connections.requests.recieved.push({
            firstName: requestSender.firstName,
            lastName: requestSender.lastName,
            userId: userId,
            date: new Date()
        })
        // request request sender
        requestSender.connections.requests.sent.push({
            firstName: requestReciever.firstName,
            lastName: requestReciever.lastName,
            userId: exploredUserId,
            date: new Date()
        })
        requestReciever.save();
        requestSender.save();

        res.status(200);
        res.json({message: "Request for connection sent success!"})
    } catch(e) {
        const error = new HttpError("Request for connection failed.", 400);
        next(error);
    }
}

const acceptConnectionRequest = async (req, res, next) => {
    try {
        const {exploredUserId} = req.body;
        const {userId} = req.userData;

        const loggedUser = await User.findOne({_id: userId});
        const userWhoSentRequest = await User.findOne({_id: exploredUserId});

        // update each users connections/connected array with connection
        loggedUser.connections.connected.push({
            firstName: userWhoSentRequest.firstName,
            lastName: userWhoSentRequest.lastName, 
            userId: exploredUserId, 
            connectedDate: new Date()
        });

        userWhoSentRequest.connections.connected.push({
            firstName: loggedUser.firstName,
            lastName: loggedUser.lastName,
            userId: userId, 
            connectedDate: new Date()
        });

        // **** clear users sent and recieved arrays for logged user and user whos request is accepted
        // logged users recieved array 
        const updatedLoggedUserRecievedArray = loggedUser.connections.requests.recieved.filter((request)=> {
            return String(request.userId) !== String(exploredUserId);
        })
        loggedUser.connections.requests.recieved = updatedLoggedUserRecievedArray;
        await loggedUser.save();

        // user who sent request sent array
        const updatedUserWhoSentRequestArray = userWhoSentRequest.connections.requests.sent.filter((request)=> {
            return String(request.userId) !== String(userId);
        })
        userWhoSentRequest.connections.requests.sent = updatedUserWhoSentRequestArray;
        await userWhoSentRequest.save();

        res.status(200);
        res.json({message: "Request for connection accepted!"})
    } catch(e) {
        const error = new HttpError("Accept for connection request failed.", 400);
        next(error);
    }
}

const removeConnection = async (req, res, next) => {
    try {
        const {exploredUserId} = req.body;
        const {userId} = req.userData;

        const user = await User.findOne({_id: userId}).select("connections.connected");
        const exploredUser = await User.findOne({_id: exploredUserId}).select("connections");

        const userConnected = user.connections.connected;
        const exploredUserConnected = exploredUser.connections.connected;

        userConnected.forEach((user)=> {
            if(user.userId === exploredUserId) {
                userConnected.splice(userConnected.indexOf(user), 1);
            }
        })
        exploredUserConnected.forEach((user)=> {
            if(user.userId === userId) {
                exploredUserConnected.splice(exploredUserConnected.indexOf(user), 1);
            }
        });
        await user.save();
        await exploredUser.save();

        res.status(200);
        res.json({message: "Connection removed!"})
    } catch(e) {
        const error = new HttpError("Failed to remove user from connections!", 400);
        next(error);
    }
}


module.exports.getAllUsers = getAllUsers;
module.exports.sendRequestForConnection = sendRequestForConnection;
module.exports.acceptConnectionRequest = acceptConnectionRequest;
module.exports.getUser = getUser;
module.exports.removeConnection = removeConnection;












// get user from db
// const getUser = async (req, res, next) => {
//     try {
//         const {uid} = req.params;
//         const user = await User.findOne({_id: uid});
//         res.json({user});
//     } catch(e) {
//         const error = new HttpError("User not found.", 404);
//         next(error);
//     }
// }

// get users connections: {connected: [], requests: { recieved: [], sent: []}}
// const getUsersConnections = async (req, res, next) => {
//     try {
//         const {uid} = req.params;
//         const user = await User.findOne({_id: uid});
//         const connections = user.connections;
//         res.json({connections})
//     } catch(e){
//         const error = new HttpError("Connections for user not found.", 404);
//         next(error);
//     }
// }
