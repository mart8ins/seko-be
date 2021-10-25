const HttpError = require("../errors/HttpError");
const Workout = require("../models/Workout");


const saveTrainingSession = async (req, res, next) => {
    try {
        const {userId} = req.userData;
        const userTrainingDays = await Workout.find({userId: userId});
        
        // check if training date already exists
        const trainingDateExists = userTrainingDays.some((training)=>{
            return training.date === req.body.date;
        })

        // if no workout exists in db or trainings date dosent exists, create new training day
        if(!userTrainingDays.length || !trainingDateExists) {
            const newTrainingDay = await new Workout({
                userId,
                date: req.body.date,
                sessions: [
                    {
                        title: req.body.title,
                        feeling: req.body.feeling,
                        workouts: req.body.workouts
                    }
                ]
            });
            await newTrainingDay.save();
        } else {
            // IF TRAINING DAY ALREADY EXISTS, ADD WORKOUT SESSION TO IT
            const existingTrainingDate = await Workout.findOne({date: req.body.date});
            if(existingTrainingDate) {
                existingTrainingDate.sessions.push({
                    title: req.body.title,
                        feeling: req.body.feeling,
                        workouts: req.body.workouts
                });
                await existingTrainingDate.save();
            }
        }
        
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
