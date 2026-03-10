import { callAI } from "./callAI";

function extractHintFromUrl(url) {
  try {
    const { hostname, pathname } = new URL(url);
    const site = hostname.replace("www.", "");
    const hint = pathname
      .replace(/\.(html|php|aspx)$/i, "")
      .replace(/\/recipes?\//i, " ")
      .replace(/[-_\/]+/g, " ")
      .replace(/\d{3,}/g, "")
      .trim().slice(0, 80);
    return { site, hint };
  } catch { return { site: "recipe site", hint: "" }; }
}

export async function importRecipeFromURL(url) {
  if (!url?.trim()) throw new Error("Please enter a URL.");
  if (!url.startsWith("http")) throw new Error("URL must start with http:// or https://");

  const { site, hint } = extractHintFromUrl(url);

  const prompt = `You are a recipe expert. Import this recipe URL: ${url}
Website: ${site}
Recipe name from URL: "${hint}"

Generate the most accurate version of this recipe.
Reply ONLY with valid JSON (no markdown):
{"title":"Recipe name","ingredients":["measurement ingredient"],"steps":["Clear step"],"cookTime":"X min","prepTime":"X min","servings":4,"difficulty":"Easy","cuisine":"Italian","sourceUrl":"${url}","sourceSite":"${site}"}

Use realistic measurements like "2 cloves garlic", "1 cup flour".`;

  const parsed = await callAI(prompt, 1500);
  if (!parsed.title || !parsed.ingredients || !parsed.steps) {
    throw new Error("Could not extract a recipe from this URL.");
  }
  return { id: crypto.randomUUID(), ...parsed, fromImport: true };
}
