function darkmode(){
   var element = document.body;
   element.classList.toggle("darkmode");

   const grid = document.getElementById('tweetcards');
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

   const divButtons = document.getElementById('classifierbuttons');
   const buttons = divButtons.querySelectorAll('.uk-button');
   buttons.forEach((button)=>{
    button.classList.toggle("uk-button-secondary");

   })
}