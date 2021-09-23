const User = require("../models/User");
const Story = require("../models/Story");
const HttpError = require("../errors/HttpError");


// POST A STORY
const postStory = async (req, res, next) => {
    const {userId, firstName, lastName} = req.userData;
    try {
        const newStory = new Story({
            title: req.body.title,
            story: req.body.story,
            image: req.file && req.file.path || undefined,
            comments_allowed: req.body.comments_allowed,
            private: req.body.private,
            author: {
                userId: userId,
                firstName: firstName,
                lastName: lastName
            },
            date: new Date()
        })
        await newStory.save();
        res.json({message: "Success on posting a story!"})
    } catch(e) {
        const error = new HttpError("Failed to post story.", 400);
        next(error);
    }
}

// GET ALL USER STORIES
const getUserStories = async (req, res ,next) => {
    try {
        const stories = await Story.find({});
        res.json({message: "Success getting all stories from db.", stories})
    }catch(e) {
        const error = new HttpError("Couldnt get stories!", 400);
        next(error);
    }
}



module.exports.postStory = postStory;
module.exports.getUserStories = getUserStories;
