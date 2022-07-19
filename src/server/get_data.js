const {TwitterApi} = require('twitter-api-v2')
require('dotenv').config()
//in your .env put BEARER_TOKEN = "your token"
const appOnlyClient = new TwitterApi(process.env.BEARER_TOKEN)

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}



async function getTweets(max_results){
    if(max_results > 100 || max_results < 10 ) throw new Error("max results can only be between 10-100")
    let jsTweets
    do {
        let oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate()-7)
        end_time = randomDate(oneWeekAgo, new Date())
        start_time = randomDate(oneWeekAgo,end_time)   
        jsTweets = await appOnlyClient.v2.search('(from:markets OR from:business) -is:retweet -is:reply',
        {'max_results':max_results,'end_time':end_time.toISOString(),'start_time':start_time.toISOString()})
    } while (jsTweets.tweets.length < max_results); 
    
    for (const tweet of jsTweets) {
        tweet.text = tweet.text.replace(/(?:https):\/\/[\n\S]+/g, '')
        tweet.url = "https://twitter.com/twitter/status/"+tweet.id
        tweet.category = "unknown"
    }
    return jsTweets.tweets
}

module.exports = {getTweets}