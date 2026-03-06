// Fast offline fallback
const COMMON_SUBSTITUTIONS = {
  butter: ["olive oil", "margarine", "coconut oil"],
  milk: ["soy milk", "oat milk", "water"],
  egg: ["flax egg", "chia egg", "applesauce"],
  flour: ["oat flour", "almond flour"],
  sugar: ["honey", "maple syrup"],
  cheese: ["nutritional yeast", "tofu"],
};

export async function getIngredientSubstitutions(
  ingredient,
  pantryItems = []
) {
  const key = ingredient.toLowerCase();

  // 1️⃣ Pantry-first substitutions
  const pantryMatches =
    COMMON_SUBSTITUTIONS[key]?.filter(i =>
      pantryItems.some(p => p.toLowerCase().includes(i))
    ) || [];

  if (pantryMatches.length) {
    return pantryMatches;
  }

  // 2️⃣ Fallback substitutions
  if (COMMON_SUBSTITUTIONS[key]) {
    return COMMON_SUBSTITUTIONS[key];
  }

  // 3️⃣ AI fallback (optional, safe)
  try {
    const response = await fetch("/api/substitute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ingredient, pantryItems })
    });

    const data = await response.json();
    return data.substitutions || [];
  } catch {
    return [];
  }
}
