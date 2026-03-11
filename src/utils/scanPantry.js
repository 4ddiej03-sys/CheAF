// utils/scanPantry.js
// Uses Claude vision via secure /api/claude endpoint

import { callAIWithImage } from "./callAI";

export async function scanIngredientsFromPhoto(imageFile) {
  // Convert image to base64
  const base64 = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  const mediaType = imageFile.type || "image/jpeg";

  const prompt = `You are a kitchen ingredient identifier. Look at this photo carefully.

Identify ALL food ingredients, produce, condiments, drinks and pantry items you can see.
Be specific but use simple common names (e.g. "garlic" not "allium sativum").
Include things that are partially visible or in the background.

Reply ONLY with valid JSON (no markdown):
{
  "ingredients": ["ingredient1", "ingredient2"],
  "confidence": "high/medium/low",
  "notes": "Brief description of what you see"
}

If you cannot identify any food items, return:
{"ingredients": [], "confidence": "low", "notes": "No food items visible"}`;

  const result = await callAIWithImage(prompt, base64, mediaType);
  if (!Array.isArray(result.ingredients)) throw new Error("Unexpected response format.");
  return result;
}
