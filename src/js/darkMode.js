import { toggleDarkMode } from "./chartsLogic.js";
import { categories, cards, selectedCategoryButton, buttons, } from './htmlNodes.js';
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