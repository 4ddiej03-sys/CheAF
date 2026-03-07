// utils/findSimilar.js
function fetchWithTimeout(url, options, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

export async function findSimilarRecipes(recipe, pantry = []) {
  const pantryNames = pantry.map(p => typeof p === "object" ? p.name : p).filter(Boolean);
  const ingredientList = (recipe.ingredients || []).join(", ");

  const prompt = `You are a recipe expert. Given this recipe: "${recipe.title}"
Ingredients: ${ingredientList}
User's pantry: ${pantryNames.length ? pantryNames.join(", ") : "common pantry staples"}

Suggest 6 similar recipe ideas in these 4 categories:
1. Same ingredients (uses what they already have)
2. Healthier version (lower calorie, more nutritious)
3. Easier/faster version (under 20 min, fewer steps)
4. Cuisine variation (same dish in a different cuisine style)

Reply ONLY with valid JSON (no markdown):
{
  "sameIngredients": [
    {"title":"...","why":"...","searchQuery":"..."},
    {"title":"...","why":"...","searchQuery":"..."}
  ],
  "healthier": [
    {"title":"...","why":"...","searchQuery":"..."},
    {"title":"...","why":"...","searchQuery":"..."}
  ],
  "easier": [
    {"title":"...","why":"...","searchQuery":"..."}
  ],
  "variation": [
    {"title":"...","why":"...","searchQuery":"..."}
  ]
}
"why" = 1 short sentence. "searchQuery" = Google-ready search string.`;

  try {
    const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    }, 12000);
    if (!response.ok) throw new Error(`API error ${response.status}`);
    const data = await response.json();
    const raw = data.content?.map(b => b.text || "").join("") || "";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    return parsed;
  } catch (err) {
    console.warn("findSimilar fallback:", err.message);
    return buildFallback(recipe);
  }
}

function buildFallback(recipe) {
  const title = recipe.title || "this recipe";
  return {
    sameIngredients: [
      { title: `${title} Stir Fry`, why: "Uses the same ingredients in a quicker format.", searchQuery: `${title} stir fry recipe` },
      { title: `${title} Bowl`, why: "Same flavours served as a grain bowl.", searchQuery: `${title} bowl recipe` },
    ],
    healthier: [
      { title: `Light ${title}`, why: "Lower calorie with the same great taste.", searchQuery: `healthy ${title} recipe low calorie` },
    ],
    easier: [
      { title: `15-Minute ${title}`, why: "Simplified version ready in under 20 minutes.", searchQuery: `easy quick ${title} recipe 15 minutes` },
    ],
    variation: [
      { title: `Asian-Style ${title}`, why: "A fusion twist with Asian flavours.", searchQuery: `${title} Asian style recipe` },
    ],
  };
}
