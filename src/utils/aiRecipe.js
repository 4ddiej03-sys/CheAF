function fetchWithTimeout(url, options, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

export async function generateAIRecipe(pantryItems = []) {
  const names = pantryItems.map(i => typeof i === "object" ? i.name : i).filter(Boolean);
  if (!names.length) return buildFallback(names);
  const prompt = `You are a creative chef. Given these pantry ingredients: ${names.join(", ")}\nCreate ONE delicious recipe using mostly these ingredients.\nReply ONLY with valid JSON (no markdown):\n{"title":"Recipe name","ingredients":["amount + ingredient"],"steps":["Full step instruction"],"cookTime":"20 min","servings":2,"difficulty":"Easy"}`;
  try {
    const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
    }, 10000);
    if (!response.ok) throw new Error(`API error ${response.status}`);
    const data = await response.json();
    const raw = data.content?.map(b => b.text || "").join("") || "";
    const recipe = JSON.parse(raw.replace(/```json|```/g, "").trim());
    if (!recipe.title || !recipe.ingredients || !recipe.steps) throw new Error("Incomplete recipe");
    return { id: crypto.randomUUID(), ...recipe, generated: true };
  } catch (err) {
    console.warn("AI fallback:", err.name === "AbortError" ? "Timed out" : err.message);
    return buildFallback(names);
  }
}

function buildFallback(items) {
  const main = items[0] || "ingredients";
  const rest = items.slice(1);
  return {
    id: crypto.randomUUID(),
    title: `Quick ${main.charAt(0).toUpperCase() + main.slice(1)} ${rest.length ? "& " + rest[0] : ""} Stir Fry`.trim(),
    ingredients: items.map(i => `1 portion of ${i}`),
    steps: [
      `Prepare all your ingredients: ${items.join(", ")}.`,
      "Heat a pan over medium-high heat and add a splash of oil.",
      `Cook ${main} for 2-3 minutes until it starts to brown.`,
      rest.length > 0 ? `Add ${rest.join(", ")} and stir fry for 3-4 more minutes.` : "Continue cooking, stirring occasionally.",
      "Season with salt, pepper, or any sauces you have.",
      "Taste, adjust seasoning, and serve hot! 🍽️",
    ],
    cookTime: "15 min", servings: 2, difficulty: "Easy", generated: true, isFallback: true,
  };
}
