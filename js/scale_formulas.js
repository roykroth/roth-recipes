'use strict';
const scaleFactor = 1000;

processPercents();
scaleIngredients(scaleFactor);

//  --- Functions needed ---

function toNumber(inString){
    let result;
    if (inString.includes('/')){
        let z = inString.split('/');
        result = z[0]/z[1];
    }
    else {
        result = +inString
    }
    return result
}

function quantityToNumber(inString){
    let valueArray = inString.split(/\s/g);
    valueArray = valueArray.map(item => toNumber(item));
    let theTotal = valueArray.reduce((a, b) => a + b);
    return theTotal
}

function extractQuantity(ingredient){
    let reMatch = ingredient.match(/^\d[/\d\s\.]*/i);
    let quantity;
    if (reMatch === null) {
        quantity = "";
    }
    else {
        quantity = reMatch[0];
    }
    return quantity
}

function processPercents(){
    let ingredients = document.querySelectorAll('td[itemprop=recipeIngredient]');
    let percentages = document.querySelectorAll('td[itemprop=formulaPercent]');
    let ingredient;
    let percent;
    let ingredientPercent;
    let ingredientBase;
    for (let i = 0; i < ingredients.length; i++) {
        ingredient = ingredients[i].firstElementChild;
        percent = percentages[i];
        // Now, run the code to modify the ingredient
        ingredientPercent = extractQuantity(ingredient.innerHTML);
        ingredientBase = ingredient.innerHTML.substring(ingredientPercent.length + 2);
        // and in the ingredient column remove the percentage
        ingredient.innerHTML = ingredientBase
        // and add it into the percents column
        percent.innerHTML = ingredientPercent
    }
}  

// function preprocessIngredients(){
//     let ingredients = document.querySelectorAll('td[itemprop=recipeIngredient]')
//     let percentArray = [];
//     let ingredientBaseArray = [];
//     let ingredientPercent;
//     let ingredientBase;
//     for (let i = 0; i < ingredients.length; i++) {
//         let ingredient = ingredients[i].firstElementChild;
//         // Now, run the code to modify the ingredient
//         ingredientPercent = extractQuantity(ingredient.innerHTML);
//         percentArray.push(ingredientPercent);
//         ingredientBase = ingredient.innerHTML.substring(ingredientPercent.length + 2);
//         ingredientBaseArray.push(ingredientBase)
//         // and in the ingredient column remove the percentage
//         ingredient.innerHTML = ingredientBase
//     }
//     // Now I need to write this array to a file in the document tree
//     let div = document.createElement('div');
//     div.id = 'ingredient-percents';
//     div.dataset.percents = percentArray.join(';')
//     document.body.appendChild(div)
//     // Now for the base ingredients
//     let div2 = document.createElement('div');
//     div2.id = 'ingredient-bases';
//     div2.dataset.ingredients = ingredientBaseArray.join(';')
//     document.body.appendChild(div2)
//     // As an additional step, I will write the percentages into the percent column
//     let percentages = document.querySelectorAll('td[itemprop=formulaPercent]')
//     for (let i = 0; i < ingredients.length; i++) {
//         let percentage = percentages[i];
//         percentage.innerHTML = percentArray[i]
//     }
// }

function scaleOneFormula(formula, total = 1000){
    let percentages = formula.querySelectorAll('td[itemprop=formulaPercent]');
    let quantities = formula.querySelectorAll('td[itemprop=formulaQuantity]');
    let percents = [];
    for (let i = 0; i < percentages.length; i++){
        percents.push(percentages[i].innerHTML)
    }
    let totalPercent = 0;
    for (let i = 0; i < quantities.length; i++) {
        totalPercent = totalPercent + toNumber(percents[i]);
    }
    let multiplier = total / totalPercent;
    let quantity;
    for (let i = 0; i < quantities.length; i++) {
        quantity = multiplier * toNumber(percents[i])
        quantities[i].innerHTML = quantity.toFixed(3);
    }
}

function scaleIngredients(total = 1000){
    // First, find all the components
    let components = document.querySelectorAll('div[itemprop=ingredients]')
    // Now, the first thing we need to do is find the final dough. For now I will just assume
    // that is the last one listed. 
    let final_dough = components[components.length - 1]
    // Now, the final dough should be scaled
    scaleOneFormula(final_dough, total)
    // Now, match the other formulas by name. I am just going to brute force
    // get the components that aren't the final dough
    let newcomponents = Array.from(components).slice(0, components.length - 1);
    // Get a list of ingredient names from the final dough and ingredient quantities
    let name;
    let component_names = [];
    for (let i = 0; i < newcomponents.length; i++){
        name = newcomponents[i].querySelector('h5').innerText.toLowerCase();
        component_names.push(name)
    }
    // Now, lets get a list of names and quantities of the ingredients in the final dough. 
    let final_ingredients = final_dough.querySelectorAll('td[itemprop=recipeIngredient]')
    let final_quantities = final_dough.querySelectorAll('td[itemprop=formulaQuantity]')
    let final_ingredients_2 = [];
    let final_quantities_2 = [];
    for (let i = 0; i < final_ingredients.length; i++){
        final_ingredients_2.push(final_ingredients[i].innerText.toLowerCase())
        final_quantities_2.push(final_quantities[i].innerText)
    }
    // Now, the plan is to cycle through the component names, find them in the final dough,
    // and pick out the quantity. 
    let quantity_scales = [];
    for (let i = 0; i < newcomponents.length; i++){
        quantity_scales.push(0) // in case I don't find a match the length isn't messed up. 
        for (let j = 0; j < final_ingredients_2.length; j++){
            if (component_names[i] == final_ingredients_2[j]){
                quantity_scales[i] = final_quantities_2[j];
                break;
            }
        }
    }
    // Now, we have the ingredients and the scales, lets just scale it up. 
    for (let i = 0; i < newcomponents.length; i++){
        scaleOneFormula(newcomponents[i], quantity_scales[i])
    }
}

function liveScaleRecipe(event){
    scaleIngredients(this.value)
}
