const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const feedSchema = new Schema({
    contentType: {
        type: String,
        enum: ['STORY', 'WOKROUT', 'EXCHANGE']
    },
    content: [

    ],
    creator: {
        userId: String
    }

});

module.exports = mongoose.model("Feed", feedSchema);