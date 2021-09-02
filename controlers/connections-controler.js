const HttpError = require("../errors/HttpError");
const User = require("../models/User");
const { v4: uuidv4 } = require('uuid');

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

module.exports.getAllNotConnectedUsers = getAllNotConnectedUsers;
module.exports.getUser = getUser;
module.exports.getUsersConnections = getUsersConnections;
module.exports.requestConnection = requestConnection;
module.exports.acceptConnection = acceptConnection;