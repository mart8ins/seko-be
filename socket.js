const { Socket } = require("socket.io");
const User = require("./models/User");
const { v4: uuidv4 } = require('uuid');

// socket users register
const users = [];
let currentUsersOnline = 0;
let trackOfUsersOnline = 0;
let newUser;

// keep track of user rooms
let rooms = [];

const storeMessageDb = async (senderId, recieverId, message) => {
    const messageSender = await User.findOne({_id: senderId});
    const messageReciever = await User.findOne({_id: recieverId});

    // UPDATE MONGO DB
    // get existing chat room in both users messages array

    const roomInMessageSender = messageSender.messages.filter((room)=> {
        return String(room.id) === String(message.room);
    });
    const roomInMessageReciever = messageReciever.messages.filter((room)=> {
        return String(room.id) === String(message.room);
    });

    roomInMessageSender[0].messages.push({
        text: message.text,
        sent: true
    })
    roomInMessageReciever[0].messages.push({
        text: message.text,
        sent: false
    })

    await messageSender.save();
    await messageReciever.save();
}



function socketIo(){
    io.on("connection", (socket)=> {
        console.log("User connected!!! with socket id ", socket.id);
        /* ************************************************************************************************ */
        /* WHEN USER OPEN MESSAGES, STORE HIM IN USERS ARRAY WITH USERS ID AND SOCKET ID */
        socket.on("USER IS ONLINE", (user, cb)=> {
                if(user.userId) {
                    newUser = {userId: String(user.userId), socketId: String(socket.id)};
                    const userExists = users.some((user)=> user.userId === newUser.userId || user.socketId === newUser.socketId);
                    if(!userExists) {
                    users.push(newUser);
                };
                }
                cb(users);
                currentUsersOnline++;
                // console.log(currentUsersOnline, "currentUsersOnline")
            });

            // SEND UPDATE ABOUT USERS ONLINE TO ONLINE USERS COMPONENT
            setInterval(()=> {
                // console.log("Īntervāls")
                // console.log(users.length, "users.length")
                // console.log(currentUsersOnline, "currentUsersOnline")
                // console.log(trackOfUsersOnline, "trackOfUsersOnline")
                if(users.length !== 0 && currentUsersOnline !== trackOfUsersOnline) {
                    console.log("emiteeee")
                    socket.emit("SEND UPDATE ON USERS ONLINE", users);
                }
            }, 5000);
            // TO TRACK CHANGES
            socket.on("USERS ONLINE UPDATED", () => {
                trackOfUsersOnline = currentUsersOnline; 
            })


        /* REMOVE USER FROM SOCKETID ARRAY */
        socket.on("USER IS OFFLINE", (user, cb)=> {
                const userId = user.userId;
                const index = users.findIndex((user) => user.userId === userId);
                users.splice(index, 1);
                cb(users);
                currentUsersOnline--;
                if(users.length === 0) {
                    trackOfUsersOnline = 0;
                }
                console.log(currentUsersOnline, "currentUsersOnline");
            })

        /* ****************************************************************************************************** */
        // selected user on frontend, for messages and create join user in conversation room
        socket.on("ACTIVE USER", async ({loggedUser, exploredUser}, cb)=> {
            const foundUser = await User.findOne({_id: loggedUser});
            const foundExploredUser = await User.findOne({_id: exploredUser})
            let newUserConversations = foundUser.messages;

            // check if conversation exists already / conversationExists is []
            const conversationExists = newUserConversations.filter((conversation) => {
                return conversation.users.includes(loggedUser) && conversation.users.includes(exploredUser);
            })

            // if not exists then create it -  id, user [id,id], messages[]
            if(conversationExists.length === 0) {
                    const createdConversation = {
                        id: uuidv4(),
                        messages: [],
                        users: [loggedUser, exploredUser]
                    }
                    foundUser.messages.push(createdConversation);
                    foundExploredUser.messages.push(createdConversation);
                    await foundUser.save();
                    await foundExploredUser.save();
                    rooms.push(createdConversation);
                    socket.join(createdConversation.id);
                    cb(createdConversation.messages, createdConversation.id);
            } else {
                    const ex = rooms.some((conv)=> {
                        return String(conv.id) === String(conversationExists[0].id);
                    })
                    // if for some kind of reason room dosent exist in socket rooms, push it
                    // else update that room with actual/updated messages from db
                    if(!ex) {
                        rooms.push(conversationExists[0]);
                    } else {
                        let index = rooms.findIndex((room)=> {
                            return String(room.id) === String(conversationExists[0].id);
                        })
                        rooms[index].messages = conversationExists[0].messages;

                    }
                    socket.join(conversationExists[0].id);

                    // loop through rooms and return needed room, messages
                    const r = rooms.filter((room)=> {
                        return String(room.id) === String(conversationExists[0].id);
                    })
                    const mes = r[0].messages; // messages
                    const ro = r[0].id; // room
                    cb(mes, ro);
            }
        })

        socket.on("SEND MESSAGE", async ({message, room})=> {
            await storeMessageDb(message.senderId, message.recieverId, {text: message.text, room: message.room});
            socket.to(room).emit("RECIEVE MESSAGE", message);
        })

        socket.on("disconnect", (reason) => {
            if (reason === "io server disconnect") {
              // the disconnection was initiated by the server, you need to reconnect manually
              socket.connect();
            }
            // else the socket will automatically try to reconnect
          });
        /* ******************************************************************************************************** */
    })
}

module.exports = socketIo;