
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

   const grid = document.getElementById('tweet-cards');
   const cards = grid.querySelectorAll('.uk-card-body');
   cards.forEach((card)=> {
    card.classList.toggle("uk-card-secondary");

   })

   const divCategories = document.getElementById('categories');
   const selectedCategory = divCategories.querySelector(".uk-button");

   const categories = divCategories.getElementsByTagName("option");


   for(const category of categories){
    category.classList.toggle("darkmode");
   }
  


   selectedCategory.classList.toggle("uk-button-secondary");

   const divButtons = document.getElementById('classifier-buttons');
   const buttons = divButtons.querySelectorAll('.uk-button');
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
   