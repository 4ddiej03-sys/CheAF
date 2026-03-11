// utils/callAI.js
// All AI calls go through /api/claude — API key never touches the browser

export async function callAI(prompt, maxTokens = 1500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch("/api/claude", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: maxTokens,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    clearTimeout(timer);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`API error ${response.status}: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.content?.map(b => b.text || "").join("") || "";
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") throw new Error("Timed out — please try again.");
    throw err;
  }
}

// Vision call — for fridge/pantry scanning
export async function callAIWithImage(prompt, imageBase64, mediaType = "image/jpeg") {
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
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
            { type: "text", text: prompt },
          ],
        }],
      }),
    });

    clearTimeout(timer);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(`API error ${response.status}: ${err.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const text = data.content?.map(b => b.text || "").join("") || "";
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch (err) {
    clearTimeout(timer);
    if (err.name === "AbortError") throw new Error("Timed out — please try again.");
    throw err;
  }
}
