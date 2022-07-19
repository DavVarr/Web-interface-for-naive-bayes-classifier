//function to get tweets
async function getTweets() {
    let tweets = await fetch('/tweets')
        .then(function (response) {
            return response.text()
        });
        return tweets;

}
//function to send post to learn
async function learn(text, category) {
    let data = { 'text': text, 'category': category };
    let classifierData;
    await fetch('/model/learn', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then(async response => { classifierData = await response.json() });
    return classifierData;

}
//function to send post to classify
async function classify(text, getProbabilities = false) {
    let data = { 'text': text, 'getProbabilities': getProbabilities };
    let classification;
    await fetch('/model/classify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then(async response => { classification = await response.json() });
    return classification;

}
export { getTweets, learn, classify }