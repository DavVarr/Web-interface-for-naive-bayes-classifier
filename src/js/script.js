import { addCharts, toggleDarkMode } from './chartsLogic.js';
addCharts();
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
//getting tweets on first load
loadTweetsStartUp();
async function loadTweetsStartUp(){
    if(localStorage.getItem('tweets')=== null) await getTweets();
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
        let p = card.getElementsByTagName('p')[0];
        let a = card.getElementsByTagName('a')[0];
        p.innerText = tweets[i+(6*page)].text;
        a.setAttribute('href',tweets[i+(6*page)].url);
    
    })
}

//disable classifier buttons on load,when nothing is selected
buttons.forEach((button) => button.setAttribute('disabled', true))
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
      //activate button when selecting a card
      buttons.forEach((button) => button.removeAttribute('disabled'))
      deselectCard()
      if (card.classList.contains('uk-card-secondary')) card.classList.remove('uk-card-secondary');
      card.classList.add('uk-card-primary');
      let workP = workCard.getElementsByTagName('p')[0];
      workP.innerText = p.innerText;
      if(document.getElementById('guided-mode').checked) printProbabilities()
   })

})
//function to send post and classify
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
      alert("the classifier didn't learn anything yet!")
   }
}

//mode of use
function deleteCategoryProb(){
   for (const category of categories){
      switch (category.value){
         case '1':
            category.innerText = 'Positive'
            break;
         case '2':
            category.innerText = 'Neutral'
            break;
         case '3':
            category.innerText = 'Negative'
            break;
      }
   }
}

document.getElementById('simple-mode').addEventListener('click', () => {
   deleteCategoryProb()
   document.getElementById('learn').style.display = 'inline';
   document.getElementById('mode-instructions').innerHTML = "Choose one of the six cards on the left, then decide wether it has a positive neutral or negative meaning and submit it to the classifier so that it will learn it.";
   let disabledButton = document.getElementById('classify');
   disabledButton.style.display = 'none';
})

document.getElementById('guided-mode').addEventListener('click', async () => {
   document.getElementById('learn').style.display = 'inline';
   document.getElementById('mode-instructions').innerHTML = `The classifier will suggest the class of the selected card, showing the degree of reliability, closer to 0 is better
    (it's a probability mapped to logarithm); then you can decide to keep or change the association before submitting it for learning.`;
   let disabledButton = document.getElementById('classify');
   disabledButton.style.display = 'none';
   let selectedCard = grid.querySelector('.uk-card-primary');
   if (selectedCard) {
      await printProbabilities()
   }
})

document.getElementById('automatic-mode').addEventListener('click', () => {
   deleteCategoryProb()
   deselectCard()
   document.getElementById('classify').style.display = 'inline';
   document.getElementById('mode-instructions').innerHTML = "The classifier will automatically classify the selected card.";
   let disabledButton = document.getElementById('learn');
   disabledButton.style.display = 'none';

})
//default radio button    
document.getElementById('simple-mode').click()
//selection of tweets batch

let batches = document.getElementById('batchPage');
let batchPages = batches.getElementsByTagName('li');

for(const page of batchPages){
    page.addEventListener('click',() => {
        deselectCard()
        fillCards(parseInt(page.innerText) -1 );
        document.getElementById('page-indicator').innerText = 'Page '+ page.innerText
        
    })
}

