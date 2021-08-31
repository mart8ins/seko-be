const User = require("./models/User");

// socket users
const users = [];
let newUser;
let newUserConversations = [];
let uniqueRoom = "";

function socketIo(){
    io.on("connection", (socket)=> {
        console.log("User connected!!!");

        /* WHEN USER OPEN MESSAGES, STORE HIM IN USERS ARRAY WITH USERS ID AND SOCKET ID */
        socket.on("USER IS ONLINE", (user, cb)=> {
                console.log("USER IS ONLINE")
                newUser = {userId: user.userId, socketId: socket.id};
                const userExists = users.some((user)=> user.userId === newUser.userId || user.socketId === newUser.socketId);
                if(!userExists) {
                    users.push(newUser);
                };
                cb(users);
                console.log(users)
            });
        /* REMOVE USER FROM SOCKETID ARRAY */
        socket.on("USER IS OFFLINE", (user, cb)=> {
                const userId = user.userId;
                const index = users.findIndex((user) => user.userId === userId);
                users.splice(index, 1);
                cb(users);
                console.log(users)
            })
    })
}

module.exports = socketIo;


        // socket.on("user joined messages", async ({userId, exploredUserId})=> {
        //     console.log("user joined messages")
        //     const foundUser = await User.findOne({_id: userId});
        //     newUserConversations = foundUser.messages;
        //     const conversationWith = newUserConversations.filter((conv) => {
        //         return String(conv.user.userId) === String(exploredUserId);
        //     });
        //     uniqueRoom = String(conversationWith[0].id);
        //     socket.join(uniqueRoom);
        // })


        // // get user messages feed
        // socket.on("user messages", async ({userId, exploredUserId})=> {
        //     const user = await User.findOne({_id: userId});
        //     const userConversations = user.messages;
        //     const conversationWith = userConversations.filter((conv) => {
        //         return String(conv.user.userId) === String(exploredUserId);
        //     });
        //     const messages = conversationWith[0].messages;
        //     socket.emit("user messages", messages);
        // });


        // // get conversation messages and check if there is and how much unread messages
        // // return status and count of unread messages, all messages for conversation
        // socket.on("conversation status", async ({userId, exploredUserId})=>{
        //      // get user all conversations and unread messages count,status
        //      const user = await User.findOne({_id: userId});
        //      const userConversations = user.messages;
        //      const conversationWith = userConversations.filter((conv) => {
        //          return String(conv.user.userId) === String(exploredUserId);
        //      });
        //      const messages = conversationWith[0].messages;

        //      let s = true;
        //      let c = 0;
        //      for (let msg in messages) {
        //          if (messages[msg].isRead && messages[msg].type === "recieved") {
        //              s = true;
        //              c = 0;
        //          }
        //          if (!messages[msg].isRead && messages[msg].type === "recieved") {
        //              s = false;
        //              c += 1;
        //          }
        //      }
        //      socket.emit("conversation status", {status: s, count: c})
        // })