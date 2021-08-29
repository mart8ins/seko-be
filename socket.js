const User = require("./models/User");


function socketIo(){
    io.on("connection", (socket)=> {
        console.log("User connected!!!")
        socket.on("user messages", ({userId, exploredUserId})=> {
            const getMessages = async (userId, exploredUserId) => {
                const user = await User.findOne({_id: userId});
                const userConversations = user.messages;
                const conversationWith = userConversations.filter((conv) => {
                    return String(conv.user.userId) === String(exploredUserId);
                });
                const messages = conversationWith[0].messages;
                socket.emit("user messages", messages);

                
            }
            getMessages(userId, exploredUserId);
        })
    })
}

module.exports = socketIo;