// utils/scanPantry.js
// Uses Claude's vision API to identify ingredients from a photo
// Works for blind users and anyone who wants a quick pantry scan

export async function scanIngredientsFromPhoto(imageFile) {
  const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!API_KEY) throw new Error("No API key — check your .env file.");

  // Convert image file to base64
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  const mediaType = imageFile.type || "image/jpeg";

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  try {
    const response = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: base64,
                },
              },
              {
                type: "text",
                text: `You are a kitchen ingredient identifier. Look at this photo carefully.

Identify ALL food ingredients, produce, condiments, drinks and pantry items you can see.
Be specific but use simple common names (e.g. "garlic" not "allium sativum").
Include things that are partially visible or in the background.

Reply ONLY with valid JSON (no markdown):
{
  "ingredients": ["ingredient1", "ingredient2", "ingredient3"],
  "confidence": "high/medium/low",
  "notes": "Brief description of what you see e.g. 'fridge shelf with vegetables and condiments'"
}

If you cannot identify any food items, return:
{"ingredients": [], "confidence": "low", "notes": "No food items visible"}`,
              },
            ],
          },
        ],
      }),
    });

    clearTimeout(timer);
    if (!response.ok) throw new Error(`API error ${response.status}`);

    const data = await response.json();
    const raw = data.content?.map(b => b.text || "").join("") || "";
    const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());

    if (!Array.isArray(parsed.ingredients)) throw new Error("Unexpected response format.");
    return parsed;

  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") throw new Error("Timed out — try again.");
    throw err;
  }
}
