const express = require('express')
const path = require('path')
const bayes = require('../../lib/naive_bayes.js')
const fs = require('fs')
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


app.get('/model',(req,res)=>{
    res.setHeader('Content-Type', 'application/json');
    res.send(classifier.toJson())
})

app.use(express.json())
/*
req = {
    "category" :
    "text":
} 
*/
app.post('/', async (req,res)=>{
    console.log(req.body);      
    response.send(req.body);
    await classifier.learn(req.body.text,req.body.category)
    modified = true
    res.send("POST received",200)
    res.end() 
})
app.listen(3000)