const mongoose = require("mongoose");
const Schema = mongoose.Schema;



const workoutSchema = new Schema({
    userId: {
        type: String, required: true
    },
    date: {
        type: String,
        require: true
    },
    title: {
        type: String,
        require: true
    },
    feeling: {
        type: String,
        require: true
    },
    workouts: [
        {
            _id: false,
            name: {type: String, required: true},
            imageName: {type: String, required: true},
            sets: [
                {
                    _id: false,
                    set: {type: Number, required: true},
                    weight: {type: Number, required: true},
                    reps: {type: Number, required: true}
                }
            ]
        }
    ]
});

module.exports = mongoose.model("Workout", workoutSchema)