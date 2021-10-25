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

const getAllTrainingSessions = async(req, res, next) => {
    try {
        const trainingSessions = await Workout.find({});
        res.json({message: "Success on getting training sessions!", trainingSessions})
    }catch(e) {
        const error = new HttpError("Failed to get training sessions!");
        next(error);
    }
    
}

const getAllUserTrainingSessions = async (req, res, next) => {
    try {
        const {userId} = req.params;
        const userTrainingSessions = await Workout.find({userId: userId});
        res.json({message: "Success on getting all user training sessions!", userTrainingSessions})
    }catch(e) {
        const error = new HttpError("Failed to get user training sessions!");
        next(error);
    }
}

module.exports.saveTrainingSession = saveTrainingSession;
module.exports.getAllTrainingSessions = getAllTrainingSessions;
module.exports.getAllUserTrainingSessions = getAllUserTrainingSessions;
