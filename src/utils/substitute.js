function fetchWithTimeout(url, options, timeoutMs = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
}

export async function findSubstitutionsAI(ingredients = [], pantry = []) {
  const pantryLower = pantry.map(p => (typeof p === "object" ? p.name : p).toLowerCase().trim());
  const missing = ingredients.filter(ing => !pantryLower.includes(ing.toLowerCase().trim()));
  if (!missing.length) return { missing: {} };
  const prompt = `A home cook is missing these ingredients: ${missing.join(", ")}.\nThey have: ${pantry.length ? pantry.map(p => typeof p === "object" ? p.name : p).join(", ") : "common pantry staples"}.\nFor each missing ingredient, suggest 1-2 practical substitutes.\nReply ONLY with valid JSON:\n{"missing":{"ingredient name":[{"item":"substitute","note":"short tip"}]}}`;
  try {
    const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 600, messages: [{ role: "user", content: prompt }] }),
    }, 10000);
    if (!response.ok) throw new Error(`API error ${response.status}`);
    const data = await response.json();
    const raw = data.content?.map(b => b.text || "").join("") || "";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    if (!parsed.missing || typeof parsed.missing !== "object") throw new Error("Bad shape");
    return parsed;
  } catch (err) {
    console.warn("Substitutions fallback:", err.message);
    return buildFallback(missing);
  }
}

const COMMON_SUBS = {
  "egg":         [{ item: "1 tbsp ground flaxseed + 3 tbsp water", note: "Mix and let sit 5 min" }],
  "butter":      [{ item: "Olive oil", note: "Use ¾ the amount" }],
  "milk":        [{ item: "Oat milk", note: "1:1 replacement" }],
  "flour":       [{ item: "Oat flour", note: "1:1 for most recipes" }],
  "sugar":       [{ item: "Honey", note: "Use ¾ the amount" }],
  "garlic":      [{ item: "Garlic powder", note: "⅛ tsp per clove" }],
  "onion":       [{ item: "Shallot", note: "Milder flavour" }],
  "chicken":     [{ item: "Tofu", note: "Press and cube first" }],
  "soy sauce":   [{ item: "Coconut aminos", note: "1:1, slightly sweeter" }],
  "heavy cream": [{ item: "Coconut cream", note: "1:1 replacement" }],
  "breadcrumbs": [{ item: "Crushed crackers", note: "Same amount" }],
  "sour cream":  [{ item: "Greek yogurt", note: "1:1 replacement" }],
};

function buildFallback(missingItems) {
  const result = {};
  missingItems.forEach(ing => {
    const key = ing.toLowerCase().trim();
    const match = Object.keys(COMMON_SUBS).find(k => key.includes(k) || k.includes(key));
    result[ing] = match ? COMMON_SUBS[match] : [{ item: "Check pantry for a similar ingredient", note: "AI offline" }];
  });
  return { missing: result };
}
