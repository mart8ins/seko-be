const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activityFeedSchema = new Schema({
    type: {type: String, required: true},
    fromUser: {type: String, required: true},
    toUser: {type: String, required: true},
    story: {type: String, required: true},
    storyId: {type: String, required: true},
    data: {
        comment: {type: String, required: false},
        givenRate: {type: String, required: false},
        storiesAvarageRate: {type: String, required: false}
    },
    date: {type: String, required: true}
  
})

module.exports = mongoose.model("ActivityFeed", activityFeedSchema);