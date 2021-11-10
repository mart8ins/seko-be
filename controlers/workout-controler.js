const HttpError = require("../errors/HttpError");
const Workout = require("../models/Workout");
const ContentFeed = require("../models/ContentFeed");
const getWorkoutStats = require("../helpers/stories/getWorkoutStats");


const saveTrainingSession = async (req, res, next) => {
    try {
        const {userId, firstName, lastName} = req.userData;
        const userTrainingDays = await Workout.find({userId: userId});
        
        // check if training date already exists
        const trainingDateExists = userTrainingDays.some((training)=>{
            return training.date === req.body.date;
        })

        /*  */
        let idForContentFeed; // depending on if its new training day or existing
        /*  */

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
            idForContentFeed = String(newTrainingDay._id);
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
                idForContentFeed = String(existingTrainingDate._id);
            }
        }

        const contentFeedWorkout = new ContentFeed({
            type: "workout",
            author: {
                id: userId,
                firstName,
                lastName
            },
            date: req.body.date,
            private: false,
            content: {
                workoutDayId: idForContentFeed,
                title: req.body.title,
                workouts: req.body.workouts
            }
        });
        await contentFeedWorkout.save();
        
        res.json({message: "Success on saving new training day."});
    } catch(e) {
        const error = new HttpError("Failed to save new training day", 400);
        next(error);
    }
}

const getAllTrainingDays = async(req, res, next) => {
    try {
        const trainingSessions = await Workout.find({});
        res.json({message: "Success on getting training days!", trainingSessions})
    }catch(e) {
        const error = new HttpError("Failed to get training days!");
        next(error);
    }
    
}

const getAllUserTrainingDays = async (req, res, next) => {
    try {
        const {userId} = req.params;
        const userTrainingSessions = await Workout.find({userId: userId});

        const stats = await getWorkoutStats(userTrainingSessions);

        res.json({message: "Success on getting all user training days!", userTrainingSessions, stats})
    }catch(e) {
        const error = new HttpError("Failed to get user training days!");
        next(error);
    }
}

const getTrainingDay = async (req, res, next) => {
    try {
        const {trainingDayId} = req.params;
        const day = await Workout.findOne({_id: trainingDayId});
        res.json({message: "Success on getting training day!", day})
    }catch(e) {
        const error = new HttpError("Failed to get training day!");
        next(error);
    }
}

const deleteTrainingDay = async (req, res, next) => {
    try {
        const {trainingDayId} = req.body;
        const dayToDelete = await Workout.findOneAndDelete({_id: trainingDayId});

        res.json({message: "Success on deleting training day!"});
    } catch(e) {
        const error = new HttpError("Failed to delete training day", 400);
        next(error);
    }

}

module.exports.saveTrainingSession = saveTrainingSession;
module.exports.getAllTrainingDays = getAllTrainingDays;
module.exports.getAllUserTrainingDays = getAllUserTrainingDays;
module.exports.getTrainingDay = getTrainingDay;
module.exports.deleteTrainingDay = deleteTrainingDay;
