export async function generateSimilarRecipes(pantryItems = []) {
  // 🚫 Disable AI calls in production
  if (import.meta.env.PROD) {
    return [];
  }

  const response = await fetch("http://localhost:3001/api/similar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pantryItems })
  });

  if (!response.ok) {
    throw new Error("Similar recipes failed");
  }

  return response.json();
}
