import { addCharts, toggleDarkMode } from './chartsLogic.js';
addCharts();
//useful html nodes
const grid = document.getElementById('tweet-cards');
const cards = grid.querySelectorAll('.uk-card-body');
const divButtons = document.getElementById('classifier-buttons');
const buttons = divButtons.querySelectorAll('.uk-button');
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

   const divCategories = document.getElementById('categories');
   const selectedCategory = divCategories.querySelector(".uk-button");

   const categories = divCategories.getElementsByTagName("option");


   for (const category of categories) {
      category.classList.toggle("darkmode");
   }

   selectedCategory.classList.toggle("uk-button-secondary");


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
//cards event listener

let workCard = document.getElementById('work-card');
cards.forEach((card) => {
    let a = card.getElementsByTagName('a')[0];
    a.addEventListener('click',function(event){
        event.stopPropagation();
    })    
   let p = card.getElementsByTagName('p')[0];
   card.addEventListener('click', () => {
      //activate button when selecting a card
      buttons.forEach((button) => button.removeAttribute('disabled'))
      let selectedCard = grid.querySelector('.uk-card-primary');
      if (selectedCard) {

         selectedCard.classList.remove('uk-card-primary');
         if (card.classList.contains('uk-card-secondary')) selectedCard.classList.add('uk-card-secondary');
      }
      if (card.classList.contains('uk-card-secondary')) card.classList.remove('uk-card-secondary');
      card.classList.add('uk-card-primary');
      let workP = workCard.getElementsByTagName('p')[0];
      workP.innerText = p.innerText;
   })

})
//mode of use

document.getElementById('simple-mode').addEventListener('click', () => {
   document.getElementById('learn').style.display = 'inline';
   document.getElementById('mode-instructions').innerHTML = "Choose one of the six following cards, then decide wether it has a positive neutral or negative meaning and submit it to the classifier so that it will learn it.";
   disabledButton = document.getElementById('classify');
   disabledButton.style.display = 'none';
})

document.getElementById('guided-mode').addEventListener('click', () => {
   document.getElementById('learn').style.display = 'inline';
   document.getElementById('mode-instructions').innerHTML = "The classifier will suggest the meaning of one of the cards, highlighting the percentages of correctness; then it's up to you to decide if it's right or modify if it isn't before submitting the result which will be learnt."
   disabledButton = document.getElementById('classify');
   disabledButton.style.display = 'none';
})

document.getElementById('automatic-mode').addEventListener('click', () => {
   document.getElementById('classify').style.display = 'inline';
   document.getElementById('mode-instructions').innerHTML = "The classifier will automatically classify the six cards, highlighting the percentages of correctness of each one of them."
   disabledButton = document.getElementById('learn');
   disabledButton.style.display = 'none';

})    

//selection of tweets batch

let batches = document.getElementById('batchPage');
let batchPages = batches.getElementsByTagName('li');

for(const page of batchPages){
    page.addEventListener('click',() => {
        let selectedCard = grid.querySelector('.uk-card-primary');
        if (selectedCard) {
  
           selectedCard.classList.remove('uk-card-primary');
           if (localStorage.getItem('darkMode') === 'true') selectedCard.classList.add('uk-card-secondary');
        }
        workCard.getElementsByTagName('p')[0].innerText = '';

        fillCards(parseInt(page.innerText) -1 );
        document.getElementById('page-indicator').innerText = 'Page '+ page.innerText
        
    })
}

