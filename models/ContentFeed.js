const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const contentFeedSchema = new Schema({
    type: {type: String, required: true},
    author: {
        id: {type: String, required: true},
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
        photo: {type: String}
    },
    date: {type: String, required: true},
    private: {type: Boolean, required: true},
    content: {type: Object}
  
})

module.exports = mongoose.model("ContentFeed", contentFeedSchema);