const HttpError = require("../errors/HttpError");
const ContentFeed = require("../models/ContentFeed");
const ActivityFeed = require("../models/ActivityFeed");

const getContentFeed = async (req, res, next) => {
    try {
        const content = await ContentFeed.find({});
        res.json({message: "Content feed", content})
    }catch(e){
        const error = new HttpError("Cant get content feed!", 400);
        next(error);
    }
}

const getContentFeedActivity = async (req, res, next) => {
    try {
        const activity = await ActivityFeed.find({});
        res.json({message: "Content feed activity", activity})
    }catch(e){
        const error = new HttpError("Cant get content feed activity!", 400);
        next(error);
    }
}



module.exports.getContentFeed = getContentFeed;
module.exports.getContentFeedActivity = getContentFeedActivity;