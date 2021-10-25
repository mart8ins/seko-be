const HttpError = require("../errors/HttpError");
const Workout = require("../models/Workout");


const saveTrainingSession = async (req, res, next) => {
    try {
        const {userId} = req.userData;
        const newTrainingDay = await new Workout({
            ...req.body,
            userId
        });
        await newTrainingDay.save();
        res.json({message: "Success on saving new training day."});
    } catch(e) {
        const error = new HttpError("Failed to save new training day", 400);
        next(error);
    }
}

const getAllUserTrainingSessions = async(req, res, next) => {
    try {
        const {userId} = req.params;
        const userTrainingSessions = await Workout.find({userId: userId});
        res.json({message: "Success on getting user training sessions!", userTrainingSessions})
    }catch(e) {
        const error = new HttpError("Failed to get user training sessions!");
        next(error);
    }
    
}

module.exports.saveTrainingSession = saveTrainingSession;
module.exports.getAllUserTrainingSessions = getAllUserTrainingSessions;
