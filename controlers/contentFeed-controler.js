const HttpError = require("../errors/HttpError");
const ContentFeed = require("../models/ContentFeed");

const getContentFeed = async (req, res, next) => {
    try {
        const content = await ContentFeed.find({});
        res.json({message: "Content feed", content})
    }catch(e){
        const error = new HttpError("Cant get content feed!", 400);
        next(error);
    }
}


module.exports.getContentFeed = getContentFeed;