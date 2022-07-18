import { connectSSE, toggleDarkMode,updateCharts} from './chartsLogic.js';
connectSSE();
//useful html nodes
const grid = document.getElementById('tweet-cards');
const cards = grid.querySelectorAll('.uk-card-body');
const divButtons = document.getElementById('classifier-buttons');
const buttons = divButtons.querySelectorAll('.uk-button');
const workCard = document.getElementById('work-card');
const divCategories = document.getElementById('categories');
const selectCategory = divCategories.getElementsByTagName('select')[0];
const selectedCategoryButton = divCategories.querySelector(".uk-button");
const categories = divCategories.getElementsByTagName("option");
const classifyButton = document.getElementById('classify');
const learnButton = document.getElementById('learn');
const newTweetsButton = document.getElementById('newTweets');
const progressBar = document.getElementById('progress-bar');
//getting tweets on first load
loadTweetsStartUp();
async function loadTweetsStartUp(){
   let tweets = localStorage.getItem('tweets');
    if(tweets === null) await getTweets();
    tweets = JSON.parse(tweets);
    let completedTweets = tweets.reduce((previous,current)=>{
      if(current.category !== 'unknown') return previous + 1;
      else return previous;
    },0)
    progressBar.value = completedTweets;
    fillCards(0);
}

async function getTweets(){
    await fetch('/tweets')
    .then(function(response){
        return response.text()
    }).then(function(tweets){
        localStorage.setItem('tweets',tweets)
    });
}
function fillCards(page){
    let tweets = JSON.parse(localStorage.getItem('tweets'));
    cards.forEach((card,i)=>{
      removeBadge(card);
      let p = card.getElementsByTagName('p')[0];
      let a = card.getElementsByTagName('a')[0];
      p.innerText = tweets[i+(6*page)].text;
      a.setAttribute('href',tweets[i+(6*page)].url);
      if(tweets[i+(6*page)].category !== 'unknown') addBadge(card,tweets[i+(6*page)].category.toUpperCase()); 
    
    })
}

//disable classifier buttons on load,when nothing is selected
function disableButton(button){
   button.setAttribute('disabled',true)
}
function enableButton(button){
   button.removeAttribute('disabled')
}
buttons.forEach(disableButton)
//dark mode
if (localStorage.getItem('darkMode') === null) localStorage.setItem('darkMode', 'false');
loadMode();

function loadMode() {
   if (localStorage.getItem('darkMode') === 'true') {
      document.getElementById('darkmode-checkbox').checked = true;
      toggleStyle();

   }
}

function toggleStyle() {
   var element = document.body;
   element.classList.toggle('darkmode');
   cards.forEach((card) => {
      if (!card.classList.contains('uk-card-primary')) card.classList.toggle("uk-card-secondary");
   })

   for (const category of categories) {
      category.classList.toggle("darkmode");
   }

   selectedCategoryButton.classList.toggle("uk-button-secondary");


   buttons.forEach((button) => {
      button.classList.toggle("uk-button-secondary");

   })
   toggleDarkMode()
}
document.getElementById('darkmode-checkbox').addEventListener('click', () => {
   if (localStorage.getItem('darkMode') === 'false') {
      localStorage.setItem('darkMode', 'true');
   } else {
      localStorage.setItem('darkMode', 'false');
   }
   toggleStyle();
})
//function to deselect a card for light and dark mode
function deselectCard(){
   let selectedCard = grid.querySelector('.uk-card-primary');
   if (selectedCard) {
      buttons.forEach(disableButton)
      selectedCard.classList.remove('uk-card-primary');
      if (localStorage.getItem('darkMode') === 'true') selectedCard.classList.add('uk-card-secondary');
      workCard.getElementsByTagName('p')[0].innerText = '';
   }
}
//cards event listener


cards.forEach((card) => {
    let a = card.getElementsByTagName('a')[0];
    a.addEventListener('click',function(event){
        event.stopPropagation();
    })    
   let p = card.getElementsByTagName('p')[0];
   card.addEventListener('click', () => {
      deselectCard();
      //activate button when selecting a card
      if(card.getElementsByClassName('uk-card-badge')[0])disableButton(learnButton);
      else enableButton(learnButton);
      enableButton(classifyButton);
      removeBadge(workCard);
      if (card.classList.contains('uk-card-secondary')) card.classList.remove('uk-card-secondary');
      card.classList.add('uk-card-primary');
      let workP = workCard.getElementsByTagName('p')[0];
      workP.innerText = p.innerText;
      if(document.getElementById('guided-mode').checked) printProbabilities();
   })

})
//function to send post to learn
async function learn(text,category){
   let data = {'text': text, 'category':category};
   let classifierData;
      await fetch('/model/learn',{
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
      }).then(async response => {classifierData = await response.json()});
      return classifierData;

}
//function to send post to classify
async function classify(text,getProbabilities = false){
   let data = {'text': text, 'getProbabilities':getProbabilities};
   let classification;
      await fetch('/model/classify',{
         method: 'POST',
         headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
      }).then(async response => {classification = await response.json()});
      return classification;

}

//function to print guided mode log probabilities
async function printProbabilities(){
   let classification = await classify(workCard.getElementsByTagName('p')[0].innerText,true);
   try{
      let maxCategory = Object.keys(classification).reduce((a, b) => classification[a] > classification[b] ? a : b);
      for (const category of categories) {
         switch (category.value){
            case '1':
               category.innerText = 'Positive: '+ Math.round(classification.positive * 100)/100;
               if (maxCategory === 'positive') selectCategory.value = 1;
               break;
            case '2':
               category.innerText = 'Neutral: '+ Math.round(classification.neutral* 100)/100;
               if (maxCategory === 'neutral') selectCategory.value = 2;
               break;
            case '3':
               category.innerText = 'Negative: '+ Math.round(classification.negative *100)/100;
               if (maxCategory === 'negative') selectCategory.value = 3;
               break;
         }
      }
   }catch(error){
      alert("the classifier didn't learn anything yet!");
   }
}

//mode of use
function deleteCategoryProb(){
   for (const category of categories){
      switch (category.value){
         case '1':
            category.innerText = 'Positive';
            break;
         case '2':
            category.innerText = 'Neutral';
            break;
         case '3':
            category.innerText = 'Negative';
            break;
      }
   }
}
let simpleRadio = document.getElementById('simple-mode');
let guidedRadio = document.getElementById('guided-mode')
let automaticRadio = document.getElementById('automatic-mode');
simpleRadio.addEventListener('click', () => {
   deleteCategoryProb();
   removeBadge(workCard);
   learnButton.style.display = 'inline';
   document.getElementById('mode-instructions').innerHTML = "Choose one of the six cards on the left, then decide wether it has a positive neutral or negative meaning and submit it to the classifier so that it will learn it.";
   classifyButton.style.display = 'none';
})

guidedRadio.addEventListener('click', async () => {
   removeBadge(workCard);
   learnButton.style.display = 'inline';
   document.getElementById('mode-instructions').innerHTML = `The classifier will suggest the class of the selected card, showing the degree of reliability, closer to 0 is better
    (it's a probability mapped to logarithm); then you can decide to keep or change the association before submitting it for learning.`;
   classifyButton.style.display = 'none';
   let selectedCard = grid.querySelector('.uk-card-primary');
   if (selectedCard) {
      await printProbabilities();
   }
})

automaticRadio.addEventListener('click', () => {
   deleteCategoryProb();
   classifyButton.style.display = 'inline';
   document.getElementById('mode-instructions').innerHTML = "The classifier will automatically classify the selected card.";
   learnButton.style.display = 'none';
})
//default radio button    
simpleRadio.click();
//selection of tweets batch

let batches = document.getElementById('batchPage');
let batchPages = batches.getElementsByTagName('li');
let currentPage = 0;
for(const page of batchPages){
    page.addEventListener('click',() => {
        deselectCard();
        deleteCategoryProb();
        removeBadge(workCard);
        currentPage = parseInt(page.innerText) -1;
        fillCards(parseInt(page.innerText) -1 );
        document.getElementById('page-indicator').innerText = 'Page '+ page.innerText;
    })
}
//classify button event listener
function addBadge(card,text){
   let badge = document.createElement('div');
   badge.classList.add('uk-card-badge');
   badge.innerText = text;
   card.appendChild(badge);
}
function removeBadge(card){
   let badge = card.querySelector('.uk-card-badge');
   if (badge) card.removeChild(badge);
}
classifyButton.addEventListener('click', async ()=>{
   let category = await classify(workCard.getElementsByTagName('p')[0].innerText);
   addBadge(workCard,category);
})
//learn button event listener
learnButton.addEventListener('click',async ()=>{
   let text = workCard.getElementsByTagName('p')[0].innerText;
   let category = selectedCategoryButton.innerText.toLowerCase().trim();
   let classifierData = await learn(text,category);
   let tweets = JSON.parse(localStorage.getItem('tweets'));
   cards.forEach((card,index)=>{
      if(card.classList.contains('uk-card-primary')){
         tweets[index+(6*currentPage)].category = category;
         localStorage.setItem('tweets',JSON.stringify(tweets))
         addBadge(card,category.toUpperCase());
      }
   })
   
   disableButton(learnButton);
   progressBar.value += 1;
   updateCharts(classifierData);
})