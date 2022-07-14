const express = require('express')
const path = require('path')
const bayes = require('../../lib/naive_bayes.js')
const fs = require('fs')
const data = require('./get_data.js')
let classifier
if(fs.existsSync('classifier.json')){
    let cJSON = fs.readFileSync('classifier.json')
    classifier = bayes.fromJson(cJSON)
}else{
    classifier = bayes()
}
 
let modified = false
const MINUTES = 4
let bufferedWrite = MINUTES*60*1000
let app = express()

function saveBeforeExit(options,exitCode){
    fs.writeFileSync('classifier.json',classifier.toJson())
    if (options.cleanup) console.log('clean');
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) process.exit();
}

//buffering the write to file
setInterval(() => {
    if(modified){
        fs.writeFile('classifier.json',classifier.toJson(), (err)=> console.log(err))
        modified = false
    }
},bufferedWrite)


//saving file when app is closing
process.on('exit', saveBeforeExit.bind(null,{cleanup:true}))

//catches ctrl+c event
process.on('SIGINT', saveBeforeExit.bind(null,{exit:true}))

// catches "kill pid" 
process.on('SIGUSR1', saveBeforeExit.bind(null,{exit:true}))
process.on('SIGUSR2', saveBeforeExit.bind(null,{exit:true}))

//catches uncaught exceptions
process.on('uncaughtException', saveBeforeExit.bind(null,{exit:true}))

app.use('/css',express.static(path.join(__dirname,'..','css')))
app.use('/js',express.static(path.join(__dirname,'..','js')))
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname,'..','index.html'))
})

app.get('/tweets',async (req,res)=>{
    res.setHeader('Content-Type', 'application/json');
    let tweets = await data.getTweets(24)
    res.send(JSON.stringify(tweets))
})

app.get('/model/statistics', (req, res) => {
    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive'
    })
    res.flushHeaders()

    // Tell the client to retry every 10 seconds if connectivity is lost
    res.write('retry: 10000\n\n')

    let interval = setInterval(() => {
        // Emit an SSE that contains the classifier data
        if(modified) {
        let classifierData = {"docCount":classifier.get("docCount"),"totalDocuments":classifier.get("totalDocuments"),"vocabularySize":classifier.get("vocabularySize"),"wordCount":classifier.get("wordCount")}
        res.write(JSON.stringify(classifierData))
        }  
    },30000)

    // If client closes connection, stop sending events
    res.on('close', () => {
        clearInterval(interval);
        res.end();
    })
    
  })

app.use(express.json())
/*
req = {
    "category" :
    "text":
} 
*/
app.post('/model/learn', async (req,res)=>{    
    await classifier.learn(req.body.text,req.body.category)
    modified = true
    let classifierData = {"docCount":classifier.get("docCount"),"totalDocuments":classifier.get("totalDocuments"),"vocabularySize":classifier.get("vocabularySize"),"wordCount":classifier.get("wordCount")}
    res.send(JSON.stringify(classifierData),200)
    res.end() 
})
/*req = {
    "text":
    "getProbabilities:"
}
*/
app.post('/model/classify', async (req,res)=>{    
    let category = await classifier.categorize(req.body.text,req.body.getProbabilities)
    res.send(JSON.stringify(category),200)
    res.end() 
})
app.listen(3000)