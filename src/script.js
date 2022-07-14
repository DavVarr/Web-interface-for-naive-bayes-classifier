//useful html nodes
const grid = document.getElementById('tweet-cards');
const cards = grid.querySelectorAll('.uk-card-body');
const divButtons = document.getElementById('classifier-buttons');
const buttons = divButtons.querySelectorAll('.uk-button');
//disable classifier buttons on load,when nothing is selected
buttons.forEach( (button) => button.setAttribute('disabled',true))
//dark mode
if(localStorage.getItem('darkMode') === null) localStorage.setItem('darkMode','false');
loadMode();

function loadMode(){
   if(localStorage.getItem('darkMode') === 'true'){
      document.getElementById('darkmode-checkbox').checked = true;
      toggleStyle();
      
   }
}

function toggleStyle(){
   var element = document.body;
   element.classList.toggle('darkmode');
   cards.forEach((card)=> {
      if(!card.classList.contains('uk-card-primary')) card.classList.toggle("uk-card-secondary");
   })

   const divCategories = document.getElementById('categories');
   const selectedCategory = divCategories.querySelector(".uk-button");

   const categories = divCategories.getElementsByTagName("option");


   for(const category of categories){
    category.classList.toggle("darkmode");
   }
  
   selectedCategory.classList.toggle("uk-button-secondary");

   
   buttons.forEach((button)=>{
      button.classList.toggle("uk-button-secondary");

   })
}
document.getElementById('darkmode-checkbox').addEventListener('click',() => {
   if(localStorage.getItem('darkMode') === 'false'){
      localStorage.setItem('darkMode','true');
   }else{
      localStorage.setItem('darkMode','false');
   }
   toggleStyle();
}) 
//cards event listener

let workCard = document.getElementById('work-card');
cards.forEach((card)=> {
   let p = card.getElementsByTagName('p')[0];
   card.addEventListener('click', () => {
      //activate button when selecting a card
      buttons.forEach((button) => button.removeAttribute('disabled'))
      selectedCard= grid.querySelector('.uk-card-primary');
      if(selectedCard) {
         
         selectedCard.classList.remove('uk-card-primary');
         if(card.classList.contains('uk-card-secondary')) selectedCard.classList.add('uk-card-secondary');
      }
      if(card.classList.contains('uk-card-secondary')) card.classList.remove('uk-card-secondary');
      card.classList.add('uk-card-primary');
      workP = workCard.getElementsByTagName('p')[0];
      workP.innerText = p.innerText;
   })

})   