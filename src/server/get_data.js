const {TwitterApi} = require('twitter-api-v2')
const fs = require("fs")
//this gets runned only once to get sample data, didn't want to add .env for so little. if you want to run this just place your bearer token in a key.txt file
//keep in mind you'll get different results, as the search method fetches the tweets from the last 7 days.
const key = fs.readFileSync("key.txt")
const appOnlyClient = new TwitterApi(String(key))

async function getTweets(){
    const jsTweets = await appOnlyClient.v2.search('from:markets OR from:MarketCurrents',{'max_results':100})
    for(let i = 0; i<4;i++) await jsTweets.fetchNext();
    for (const tweet of jsTweets) {
        tweet.text = tweet.text.replace(/(?:https):\/\/[\n\S]+/g, '')
        tweet.url = "https://twitter.com/twitter/status/"+tweet.id
    }
    console.log(jsTweets.tweets.length)
    fs.writeFileSync('data.json',JSON.stringify(jsTweets.tweets))
}
getTweets()