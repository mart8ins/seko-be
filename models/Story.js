const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const storySchema = new Schema({
        title: String,
        story: String,
        image: String,
        comments_allowed: Boolean,
        private: Boolean,
        date: String,
        author: {
            userId: String,
            firstName: String,
            lastName: String,
            photo: String
        },
        comments: [{
            date: String,
            author: {
                userId: String,
                firstName: String,
                lastName: String
            },
            comment: String
        }],
        rating: [
            {
                raterId: String,
                rate: Number
            }
        ]
});

module.exports = mongoose.model("Story", storySchema);