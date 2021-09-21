const User = require("../models/User");
const HttpError = require("../errors/HttpError");


const postStory = async (req, res, next) => {
    try {
        console.log(req.body);
        console.log(req.file);
    } catch(e) {
        const error = new HttpError("Failed to post story.", 400);
        next(error);
    }
}



module.exports.postStory = postStory;
