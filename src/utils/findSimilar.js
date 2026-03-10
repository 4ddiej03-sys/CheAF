import { callAI } from "./callAI";

export async function findSimilarRecipes(recipe, pantry = []) {
  const pantryNames = pantry.map(p => typeof p === "object" ? p.name : p).filter(Boolean);
  const ingredientList = (recipe.ingredients || []).join(", ");

  const prompt = `You are a recipe expert. Given this recipe: "${recipe.title}"
Ingredients: ${ingredientList}
User's pantry: ${pantryNames.length ? pantryNames.join(", ") : "common pantry staples"}

Suggest 6 similar recipe ideas in 4 categories.
Reply ONLY with valid JSON (no markdown):
{
  "sameIngredients":[{"title":"...","why":"...","searchQuery":"..."},{"title":"...","why":"...","searchQuery":"..."}],
  "healthier":[{"title":"...","why":"...","searchQuery":"..."},{"title":"...","why":"...","searchQuery":"..."}],
  "easier":[{"title":"...","why":"...","searchQuery":"..."}],
  "variation":[{"title":"...","why":"...","searchQuery":"..."}]
}`;

  try {
    return await callAI(prompt, 1000);
  } catch (err) {
    console.warn("findSimilar fallback:", err.message);
    const title = recipe.title || "this recipe";
    return {
      sameIngredients: [
        { title: `${title} Stir Fry`, why: "Same ingredients, quicker format.", searchQuery: `${title} stir fry recipe` },
        { title: `${title} Bowl`, why: "Same flavours as a grain bowl.", searchQuery: `${title} bowl recipe` },
      ],
      healthier: [{ title: `Light ${title}`, why: "Lower calorie, same taste.", searchQuery: `healthy ${title} recipe` }],
      easier: [{ title: `15-Minute ${title}`, why: "Ready in under 20 minutes.", searchQuery: `easy quick ${title} recipe` }],
      variation: [{ title: `Asian-Style ${title}`, why: "A fusion twist.", searchQuery: `${title} Asian style recipe` }],
    };
  }
}
