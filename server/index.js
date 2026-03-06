import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

console.log("🔥 Server file:", import.meta.url);
console.log("🔑 API key loaded:", !!process.env.OPENAI_API_KEY);

const app = express();
const PORT = 3001;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.send("AI server running");
});

// 🍳 AI RECIPE GENERATION
app.post("/api/recipe", async (req, res) => {
  const { ingredients } = req.body;

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ error: "No ingredients provided" });
  }

  try {
    const prompt = `
Create a simple recipe using ONLY these ingredients:
${ingredients.join(", ")}

Return JSON ONLY in this format:
{
  "title": "Recipe name",
  "ingredients": [],
  "steps": [],
  "cost": "$"
}
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });


    const raw = response.output_text;
    console.log("🧠 RAW AI RESPONSE:\n", raw);

    if (!raw) throw new Error("Empty AI response");

    // Extract JSON safely
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found in AI response");

    const recipe = JSON.parse(jsonMatch[0]);

    res.json({
      title: recipe.title || "Pantry Recipe",
      ingredients: recipe.ingredients || ingredients,
      steps: recipe.steps || ["Cook ingredients together."],
      cost: recipe.cost || "$"
    });

  } catch (err) {
    console.error("🔥 OPENAI ERROR MESSAGE:", err.message);
    console.error("🔥 OPENAI ERROR OBJECT:", err);

    res.status(500).json({
      error: "AI generation failed",
      message: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ AI server running at http://localhost:${PORT}`);
});
