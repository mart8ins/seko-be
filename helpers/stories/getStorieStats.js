module.exports = getStorieStats = (stories) => {
    const posted_stories = stories.length;
    let avarage_rate = 0;
    let stories_commented = 0;
    let stories_viewed = 0;
    let best_rated = "";
    let most_commented = "";

    let allAvarageRatesForStories = []; // ALL AVARAGES FOR STORY RATINGS, TO GET TOTAL AVARAGE FOR ALL STORIES
    let storyAvarageRate = 0; // FOR TO TRACK STORY WITH BEST AVARAGE RATING, TO HELP GET ITS TITLE
    let mostCommentedStoryTrack = 0; // FOR TO TRACK STORY WITH MOST COMMENTS

    stories.forEach((story)=> {
        /* STORIES VIEWED COUNT TOTAL */
        if(story.viewed_times) {
            stories_viewed = stories_viewed + story.viewed_times;
        }
        /* AVARAGE RATE */
        let rateCount = 0;
        let ratedTimes = 0;

        story.rating.forEach(rate => {
            rateCount = rateCount + rate.rate;
            ratedTimes++;
        });

        let rateResult = 0;
        if(rateCount > 0 && ratedTimes > 0) {
            rateResult = rateCount / ratedTimes;
            allAvarageRatesForStories.push(rateResult);
        }
        
        /* BEST RATED STORY */
        if(storyAvarageRate < rateResult) {
            storyAvarageRate = rateResult;
            best_rated = story.title;
        }

        /* STORIES COMMENTED N TIMES */
        stories_commented = stories_commented + story.comments.length;

        /* MOST COMMENTED STORY */
        if(mostCommentedStoryTrack < story.comments.length) {
            mostCommentedStoryTrack = story.comments.length;
            most_commented = story.title;
        }
    })
    /* AVARAGE RATE FINISH */
    if(allAvarageRatesForStories.length > 0) {
        avarage_rate = (allAvarageRatesForStories.reduce((prev, next)=> { return prev + next }) / allAvarageRatesForStories.length).toFixed(1);
    } 

    return {
        posted_stories,
        avarage_rate,
        stories_viewed,
        stories_commented,
        best_rated,
        most_commented
    }
}