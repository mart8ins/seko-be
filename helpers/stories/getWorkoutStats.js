module.exports = getWorkoutStats = (trainingDays) => {

    const training_days = trainingDays.length;
    let sessions_count = 0;
    let workout_count = 0;

    const mostUsedWorkouts = [];
    let mostPopularWorkoutName = "";
    let mostPopularWorkoutID;

    // basic count data
    trainingDays.forEach((day)=> {
        sessions_count = sessions_count + day.sessions.length;
        day.sessions.forEach((session)=> {
            workout_count = workout_count + session.workouts.length;
            session.workouts.forEach((workout)=> {

                // keep track and update array for used workouts
                let workIndex = mostUsedWorkouts.findIndex((item)=> {
                    return item.name === workout.name
                })
                if(!workIndex || workIndex === -1) {
                    mostUsedWorkouts.push({
                        name: workout.name,
                        wID: workout.wID,
                        count: 1
                    })
                } else {
                    mostUsedWorkouts[workIndex].count = mostUsedWorkouts[workIndex].count + 1
                }
            })
        })
    });

    // filter most most popular workout name
    let wTrackNumber = 0;
    mostUsedWorkouts.forEach((workout)=> {
        if(wTrackNumber < workout.count) {
            wTrackNumber = workout.count
            mostPopularWorkoutName = workout.name
            mostPopularWorkoutID = workout.wID
        }
    });
    
    
    const final = [
        {
            title: "Training days",
            stat: training_days,
            default: 0,
            asLink: false
        },
        {
            title: "Total sessions",
            stat: sessions_count,
            default: 0,
            asLink: false
        },
        {
            title: "Total workouts",
            stat: workout_count,
            default: 0,
            asLink: false
        },
        {
            title: "Most trained workout",
            stat: mostPopularWorkoutName,
            wID: mostPopularWorkoutID,
            default: "No data",
            asLink: true
        }
    ]

    return final;
}