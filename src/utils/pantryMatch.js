// utils/pantryMatch.js
// Fuzzy matching so "2 cloves garlic" matches pantry item "garlic"

export function getPantryNames(pantry) {
  return pantry
    .map(p => typeof p === "object" ? (p.name || "") : p)
    .map(s => s.toLowerCase().trim())
    .filter(Boolean);
}

export function ingredientInPantry(ingredient, pantryNames) {
  const ing = ingredient.toLowerCase().trim();
  return pantryNames.some(p => {
    if (!p || p.length < 2) return false;
    if (ing === p) return true;
    // "garlic" inside "2 cloves garlic"
    if (ing.includes(p)) return true;
    // last word of ingredient: "garlic" from "minced garlic"
    const lastWord = ing.split(" ").pop();
    if (lastWord === p) return true;
    // first word of pantry in ingredient
    const firstWord = p.split(" ")[0];
    if (firstWord.length > 2 && ing.includes(firstWord)) return true;
    return false;
  });
}

export function calcMatchPct(recipe, pantry) {
  const ingredients = recipe.ingredients || [];
  if (!ingredients.length) return 0;
  const names = getPantryNames(pantry);
  const matches = ingredients.filter(i => ingredientInPantry(i, names)).length;
  return Math.round((matches / ingredients.length) * 100);
}

export function getMissingIngredients(recipe, pantry) {
  const names = getPantryNames(pantry);
  return (recipe.ingredients || []).filter(i => !ingredientInPantry(i, names));
}
