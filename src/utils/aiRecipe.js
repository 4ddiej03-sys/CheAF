import { callAI } from "./callAI";

export async function generateAIRecipe(pantryItems = []) {
  const names = pantryItems.map(i => typeof i === "object" ? i.name : i).filter(Boolean);
  if (!names.length) return [buildFallback(names)];

  const prompt = `You are a creative home cook. The user has these pantry ingredients: ${names.join(", ")}.

Generate 3 DIFFERENT recipe ideas that use AS MANY of these ingredients as possible.
Make them genuinely different — different cuisines, techniques, meal types.
Think creatively: soups, stews, pasta, rice dishes, salads, wraps, curries, frittatas, etc.

Rules:
- Each recipe must use at least ${Math.min(names.length, 3)} of the listed pantry ingredients
- Only suggest 1-2 common extras (salt, oil, water, basic spices)
- Include realistic measurements: "2 cloves garlic", "1 cup pasta"
- Make each recipe genuinely different in style and cuisine

Reply ONLY with a valid JSON array (no markdown):
[
  {"title":"...","description":"One enticing sentence","ingredients":["measurement ingredient"],"steps":["Clear step"],"cookTime":"X min","servings":2,"difficulty":"Easy","cuisine":"Italian","mealType":"Dinner"},
  {...},
  {...}
]`;

  try {
    const parsed = await callAI(prompt, 2000);
    const recipes = Array.isArray(parsed) ? parsed : [parsed];
    return recipes
      .filter(r => r.title && r.ingredients && r.steps)
      .map(r => ({ id: crypto.randomUUID(), ...r, generated: true }));
  } catch (err) {
    console.warn("AI fallback:", err.message);
    return [buildFallback(names)];
  }
}

function buildFallback(items) {
  const main = items[0] || "ingredients";
  const rest = items.slice(1);
  return {
    id: crypto.randomUUID(),
    title: `Quick ${main.charAt(0).toUpperCase() + main.slice(1)} Stir Fry`,
    description: "A simple satisfying stir fry using what you have.",
    ingredients: [`1 cup ${main}`, ...rest.map(i => `½ cup ${i}`), "1 tbsp olive oil", "Salt and pepper"],
    steps: [
      `Prepare: ${items.join(", ")}.`,
      "Heat 1 tbsp olive oil in a pan over medium-high heat.",
      `Cook ${main} for 3 minutes until golden.`,
      rest.length ? `Add ${rest.join(", ")} and stir fry 3 more minutes.` : "Continue cooking.",
      "Season to taste. Serve hot! 🍽️",
    ],
    cookTime: "15 min", servings: 2, difficulty: "Easy",
    cuisine: "Fusion", mealType: "Dinner", generated: true, isFallback: true,
  };
}
