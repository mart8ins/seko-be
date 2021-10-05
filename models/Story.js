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
            _id: false,
            date: String,
            author: {
                userId: String,
                fullName: String
            },
            comment: String
        }],
        rating: [
            {   
                _id: false,
                raterId: String,
                rate: Number
            }
        ]
});

module.exports = mongoose.model("Story", storySchema);