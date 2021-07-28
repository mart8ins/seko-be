const HttpError = require("../errors/HttpError");
const User = require("../models/User");

// return all users in db
const getAllUsers = async (req, res, next) => {
    try {
        const allUsers = await User.find({});
        const {userId} = req.userData;
        const allUserExceptLogged = allUsers.filter((user)=> user.id !== userId);
        res.json({users: allUserExceptLogged})
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

        const requestReciever = await User.findOne({_id: uid});
        const requestSender = await User.findOne({_id: userId});

        console.log(requestReciever.connections.requests.recieved, "requesta saņēmējs")
        console.log(requestSender.connections.requests.sent, "requesta nosūtītājs")

        // update request reciever
        requestReciever.connections.requests.recieved.push({
            user: userId,
            date: new Date(),
            status: "pending"
        })
        // request request sender
        requestSender.connections.requests.sent.push({
            user: uid,
            date: new Date(),
            status: "pending"
        })
        requestReciever.save();
        requestSender.save();

        res.status(201);
        res.json({message: "Request for connection sent successfully!"});
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
        loggedUser.connections.connected.push({user: uid, connectedDate: new Date()});
        userWhoSentRequest.connections.connected.push({user: id, connectedDate: new Date()});

        // **** clear users sent and recieved arrays
        // logged users recieved array 
        const updatedLoggedUserRecievedArray = loggedUser.connections.requests.recieved.filter((request)=> {
            return request.user !== uid;
        })
        loggedUser.connections.requests.recieved = updatedLoggedUserRecievedArray;
        loggedUser.save();

        // user who sent request sent array
        const updatedUserWhoSentRequestArray = userWhoSentRequest.connections.requests.sent.filter((request)=> {
            return request.user !== id;
        })
        userWhoSentRequest.connections.requests.sent = updatedUserWhoSentRequestArray;
        userWhoSentRequest.save();
        

        res.status(202);
        res.json({message: "Request for connection accepted."});
    } catch(e) {
        const error = new HttpError("Accepting user connection request failed.", 400);
        next(error);
    }
}

module.exports.getAllUsers = getAllUsers;
module.exports.getUser = getUser;
module.exports.getUsersConnections = getUsersConnections;
module.exports.requestConnection = requestConnection;
module.exports.acceptConnection = acceptConnection;