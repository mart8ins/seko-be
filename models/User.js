const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    photo: {
        type: String
    },
    connections: {
        connected: [
            {
                _id: false,
                firstName: {type: String},
                lastName: {type: String},
                userId: {type: String},
                connectedDate: {type: String}
            }
        ],
        requests: {
            recieved: [
                {
                    _id: false,
                    firstName: {type: String},
                    lastName: {type: String},
                    userId: {type: String},
                    date: {type: String},
                    status: {type: String}
                }
            ],
            sent: [
                {
                    _id: false,
                    firstName: {type: String},
                    lastName: {type: String},
                    userId: {type: String},
                    date: {type: String},
                    status: {type: String} // pending / ...
                }
            ]
        }
    },
    messages: [
        {
            _id: false,
            id: {type: String},
            users: [],
            messages: []
        }
    ]
})

module.exports = mongoose.model("User", userSchema)