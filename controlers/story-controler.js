const User = require("../models/User");
const Story = require("../models/Story");
const ContentFeed = require("../models/ContentFeed");
const ActivityFeed = require("../models/ActivityFeed");
const HttpError = require("../errors/HttpError");
const fs = require("fs");
const getStorieStats = require("../helpers/stories/getStorieStats");


// POST A STORY or edit if needed
const postStory = async (req, res, next) => {
    if(!req.body.edit_story) {
        try {
            const {userId, firstName, lastName} = req.userData;
            const user = await User.findOne({_id: userId}).select("-password");

            const userPhoto = user.photo.profile || undefined;

            const newStory = new Story({
                title: req.body.title,
                story: req.body.story,
                image: req.file && req.file.path || undefined,
                comments_allowed: req.body.comments_allowed,
                private: req.body.private,
                author: {
                    userId: userId,
                    firstName: firstName,
                    lastName: lastName,
                    photo: userPhoto
                },
                date: new Date()
            })
            await newStory.save();


            // ADD STORY TO CONTENT FEED
            const contentFeedStory = new ContentFeed({
                type: "story",
                author: {
                    id: userId,
                    firstName,
                    lastName,
                    photo: userPhoto
                },
                date: newStory.date,
                private: newStory.private,
                content: {
                    storyId: String(newStory._id),
                    title: req.body.title,
                    story: req.body.story.slice(0, 180),
                    image: req.file && req.file.path || undefined
                }
            });
            await contentFeedStory.save();


            res.json({message: "Success on posting a story!"})
        } catch(e) {
            const error = new HttpError("Failed to post story.", 400);
            next(error);
        }
    }

    if(req.body.edit_story) {
        try {
            const {userId, firstName, lastName} = req.userData;
            const storyToEdit = await Story.findOne({_id: req.body.edit_story});
            const user = await User.findOne({_id: userId}).select("-password");

            storyToEdit.title = req.body.title;
            storyToEdit.story = req.body.story;
            if(req.file && req.file.path) {
                if(req.body.image_to_delete) {
                    fs.unlinkSync(req.body.image_to_delete); // to delete old image from server if user chose new
                }
                storyToEdit.image =  req.file.path;
            }
            storyToEdit.comments_allowed = req.body.comments_allowed;
            storyToEdit.private = req.body.private;
            storyToEdit.author = {
                    userId: userId,
                    firstName: firstName,
                    lastName: lastName,
                    photo: user.photo.profile
                };
            storyToEdit.date = new Date();
            await storyToEdit.save();
            res.json({message: "Success on editing a story!"})
        } catch(e) {
            const error = new HttpError("Failed to edit story.", 400);
            next(error);
        }
    }
}

// POST A RATE FOR STORY
const rateStory = async (req, res, next) => {
    const {storyId, rate} = req.body;
    const {userId, firstName, lastName} = req.userData;
    try {
        const story = await Story.findOne({_id: storyId});
        const alreadyRated = story.rating.some((r)=> {
            return r.raterId === userId;
        })
        if(!alreadyRated) {
            story.rating.push({
                raterId: userId,
                rate: rate
            })
        }
        await story.save();

        const allAuthorStories = await Story.find({"author.userId": story.author.userId })
        const stats = getStorieStats(allAuthorStories);
        const avaragaStat = stats.filter((st)=> {
            return st.title === "Avarage rate for stories";
        })

        const newActivity = new ActivityFeed({
            type: "rate",
            fromUser: firstName + " " + lastName,
            toUser: story.author.firstName + " " + story.author.lastName,
            story: story.title,
            storyId: storyId,
            data: {
                comment: undefined,
                givenRate: rate,
                storiesAvarageRate: avaragaStat[0].stat
            },
            date: new Date()
        })
        await newActivity.save();
    
        res.json({message: "Success on rating a story!"})
    } catch(e) {
        const error = new HttpError("Failed to rate a story.", 400);
        next(error);
    }
}

// DELETE STORY
const deleteStory = async (req, res, next) => {
    const {storyId} = req.body;
    try {
        const storyToDelete = await Story.findOneAndDelete({_id: storyId});
        const imagePathToDelete = storyToDelete.image;
        // delete story background image after story is deleted
        if(imagePathToDelete) {
            fs.unlinkSync(imagePathToDelete);
        }

        // delete story from content feed
        const storyFromContentFeedToDelete = await ContentFeed.findOneAndDelete({"content.storyId": storyId});
        const storyFromActivityFeedToDelete = await ActivityFeed.deleteMany({"storyId": storyId});

        res.json({message: "Success on deleteing story"});
    } catch(e) {
        const error = new HttpError("Problem with deleteing story. Try again.", 400);
        next(error);
    }
}

// GET ALL STORIES
const getAllStories = async (req, res ,next) => {
    try {
        const stories = await Story.find({});
        res.json({message: "Success getting all stories from db.", stories})
    }catch(e) {
        const error = new HttpError("Couldnt get all stories!", 400);
        next(error);
    }
}

// GET ALL STORIES FOR USER
const getAllUserStories = async (req, res ,next) => {
    try {
        const {userId} = req.params;
        const stories = await Story.find({"author.userId": userId});

        // SET STATS FOR STORIES
        let stats = getStorieStats(stories);

        res.json({message: "Success getting all stories for user", stories, stats})
    }catch(e) {
        const error = new HttpError("Couldnt get stories for user!", 400);
        next(error);
    }
}

// GET STORY BY ID
const getUserStory = async (req, res ,next) => {
    const {userId} = req.userData;
    const {storyId} = req.params;
    try {
        const story = await Story.findOne({_id: storyId});
        if(userId !== story.author.userId) {
            if(story.viewed_times) {
                story.viewed_times = story.viewed_times + 1;
            } else {
                story.viewed_times = 1;
            }
            story.save();
        }
        res.json({message: "Success getting user story from db.", story})
    }catch(e) {
        const error = new HttpError("Couldnt get a story!", 400);
        next(error);
    }
}

// POST A COMMENT FOR STORY
const postCommentForStory = async (req, res ,next) => {
    try {
        // const {userId, firstName, lastName} = req.userData;

        const {comment, fullName, userId, commented_story} = req.body.comment;
        const story = await Story.findOne({_id: commented_story});
        story.comments.push({
            author: {
                fullName,
                userId
            },
            comment,
            date: new Date()
        });
        await story.save();

        const newActivity = new ActivityFeed({
            type: "comment",
            fromUser: fullName,
            toUser: story.author.firstName + " " + story.author.lastName,
            story: story.title,
            storyId: commented_story,
            data: {
                comment: comment,
                givenRate: undefined,
                storiesAvarageRate: undefined
            },
            date: new Date()
        })
        await newActivity.save();

        res.json({message: "Success on posting a comment for story."})
    }catch(e) {
        const error = new HttpError("Failed to post comment for story.", 400);
        next(error);
    }
}


module.exports.postStory = postStory;
module.exports.getAllStories = getAllStories;
module.exports.getUserStory = getUserStory;
module.exports.getAllUserStories = getAllUserStories;
module.exports.rateStory = rateStory;
module.exports.deleteStory = deleteStory;
module.exports.postCommentForStory = postCommentForStory;
