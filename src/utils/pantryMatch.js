// src/utils/pantryMatch.js

export function matchRecipes(recipes = [], pantry = []) {
  const pantrySet = pantry.map(p => p.toLowerCase());

  return recipes
    .map(recipe => {
      const ingredients = recipe.ingredients || [];

      const matched = [];
      const missing = [];

      ingredients.forEach(ing => {
        const lower = ing.toLowerCase();
        const hasIt = pantrySet.some(p => lower.includes(p));

        if (hasIt) matched.push(ing);
        else missing.push(ing);
      });

      const score = ingredients.length
        ? matched.length / ingredients.length
        : 0;

      return {
        ...recipe,
        pantryScore: score,
        matchedIngredients: matched,
        missingIngredients: missing
      };
    })
    .filter(r => r.pantryScore > 0)
    .sort((a, b) => b.pantryScore - a.pantryScore);
}
