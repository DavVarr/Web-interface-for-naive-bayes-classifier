# web-programming-project
A simple web app for my web programming exam. The app provides a simple interface to train and use a Naive Bayes Classifier for sentiment-analysis
## installing
```
git clone https://github.com/Davide0000/web-programming-project
```
then, in the cloned folder,
```
npm install
```
The software fetches some finance related tweets to display in the browser, if you do not have a twitter api key, the same tweets will be provided.
If you want to use it with the api key, put a .env file in the server folder, with BEARER_TOKEN = "your bearer token"
## usage
to run the application just run the server.js file, then open your browser and connect to localhost:3000
```
node server.js
```
