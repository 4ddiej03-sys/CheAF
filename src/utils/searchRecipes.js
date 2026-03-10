// utils/searchRecipes.js
// Searches TheMealDB (free, no API key) for real recipes online
// then uses AI to rank them by pantry match + filters

const MEALDB = "https://www.themealdb.com/api/json/v1/1";

// Search by ingredient
async function searchByIngredient(ingredient) {
  try {
    const res = await fetch(`${MEALDB}/filter.php?i=${encodeURIComponent(ingredient)}`);
    const data = await res.json();
    return data.meals || [];
  } catch { return []; }
}

// Get full recipe details
async function getRecipeDetails(id) {
  try {
    const res = await fetch(`${MEALDB}/lookup.php?i=${id}`);
    const data = await res.json();
    return data.meals?.[0] || null;
  } catch { return null; }
}

// Parse MealDB recipe into our app format
function parseMeal(meal) {
  const ingredients = [];
  for (let i = 1; i <= 20; i++) {
    const ing  = meal[`strIngredient${i}`]?.trim();
    const meas = meal[`strMeasure${i}`]?.trim();
    if (ing) ingredients.push(meas ? `${meas} ${ing}` : ing);
  }
  const stepsRaw = meal.strInstructions || "";
  const steps = stepsRaw
    .split(/\r?\n/)
    .map(s => s.trim())
    .filter(s => s.length > 10)
    .slice(0, 12);

  return {
    id: `mealdb-${meal.idMeal}`,
    title: meal.strMeal,
    ingredients,
    steps: steps.length ? steps : [stepsRaw.slice(0, 300)],
    category: meal.strCategory || "",
    cuisine: meal.strArea || "",
    thumb: meal.strMealThumb || "",
    source: meal.strSource || "",
    fromOnline: true,
  };
}

// Calculate pantry match %
function calcMatch(recipe, pantry) {
  if (!recipe.ingredients.length) return 0;
  const pantryLower = pantry.map(p =>
    (typeof p === "object" ? p.name : p).toLowerCase().trim()
  );
  const matches = recipe.ingredients.filter(ing =>
    pantryLower.some(p => ing.toLowerCase().includes(p) || p.includes(ing.toLowerCase().split(" ").pop()))
  ).length;
  return Math.round((matches / recipe.ingredients.length) * 100);
}

// Main search function
export async function searchOnlineRecipes({ pantry = [], cuisine = "", diet = "", maxResults = 12 } = {}) {
  if (!pantry.length) return [];

  // Pick top 3 pantry ingredients to search with
  const pantryNames = pantry
    .map(p => typeof p === "object" ? p.name : p)
    .filter(Boolean)
    .slice(0, 3);

  // Search MealDB for each ingredient in parallel
  const searchPromises = pantryNames.map(ing => searchByIngredient(ing));
  const results = await Promise.all(searchPromises);

  // Flatten + deduplicate by meal ID
  const seen = new Set();
  const uniqueMeals = results.flat().filter(meal => {
    if (seen.has(meal.idMeal)) return false;
    seen.add(meal.idMeal);
    return true;
  });

  // Get full details for top 15 results (to avoid too many requests)
  const detailPromises = uniqueMeals.slice(0, 15).map(m => getRecipeDetails(m.idMeal));
  const detailed = (await Promise.all(detailPromises)).filter(Boolean);

  // Parse into app format
  let parsed = detailed.map(parseMeal);

  // Filter by cuisine if selected
  if (cuisine && cuisine !== "Any") {
    parsed = parsed.filter(r => r.cuisine.toLowerCase().includes(cuisine.toLowerCase()));
    // If too strict, relax it
    if (!parsed.length) parsed = detailed.map(parseMeal);
  }

  // Filter by diet keyword
  if (diet && diet !== "Any") {
    const dietLower = diet.toLowerCase();
    parsed = parsed.filter(r =>
      r.title.toLowerCase().includes(dietLower) ||
      r.category.toLowerCase().includes(dietLower) ||
      r.ingredients.some(i => i.toLowerCase().includes(dietLower))
    );
    if (!parsed.length) parsed = detailed.map(parseMeal);
  }

  // Score by pantry match and sort
  const scored = parsed
    .map(r => ({ ...r, matchPct: calcMatch(r, pantry) }))
    .sort((a, b) => b.matchPct - a.matchPct)
    .slice(0, maxResults);

  return scored;
}
