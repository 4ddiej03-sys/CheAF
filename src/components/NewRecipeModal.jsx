import { useState } from "react";

export default function NewRecipeModal({ onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [cost, setCost] = useState("");
  const [aiDish, setAiDish] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [diet, setDiet] = useState("");
  const [servings, setServings] = useState(2);
  const [loading, setLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [saveError, setSaveError] = useState("");

  async function handleGenerateAI() {
    if (!aiDish.trim()) { setAiError("Please enter a dish name first."); return; }
    setAiError(""); setLoading(true);
    try {
      const prompt = `Generate a recipe for: "${aiDish}"\n${cuisine ? `Cuisine: ${cuisine}` : ""}\n${diet ? `Diet: ${diet}` : ""}\nServings: ${servings}\nReply ONLY with valid JSON (no markdown):\n{"title":"...","ingredients":["..."],"steps":["..."],"cost":"$"}`;
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1000, messages: [{ role: "user", content: prompt }] }),
      });
      const data = await res.json();
      const raw = data.content?.map(b => b.text || "").join("") || "";
      const recipe = JSON.parse(raw.replace(/```json|```/g, "").trim());
      setTitle(recipe.title || aiDish);
      setIngredients((recipe.ingredients || []).join(", "));
      setSteps((recipe.steps || []).join("\n"));
      setCost(recipe.cost || "$");
    } catch { setAiError("Generation failed — fill in manually or try again."); }
    setLoading(false);
  }

  function handleSave() {
    if (!title.trim()) { setSaveError("Please add a recipe title."); return; }
    if (!ingredients.trim()) { setSaveError("Please add ingredients."); return; }
    if (!steps.trim()) { setSaveError("Please add steps."); return; }
    setSaveError("");
    onSave({ id: crypto.randomUUID(), title: title.trim(), ingredients: ingredients.split(",").map(i => i.trim()).filter(Boolean), steps: steps.split("\n").map(s => s.trim()).filter(Boolean), cost: cost.trim() || "$" });
    onClose();
  }

  const inputStyle = { width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e2e8f0", marginBottom: 10, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box", display: "block" };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 200, padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 20, width: "100%", maxWidth: 440, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 12px 40px rgba(0,0,0,0.25)" }}>
        <h2 style={{ marginTop: 0 }}>➕ New Recipe</h2>
        <div style={{ background: "#f7f3ff", border: "1px solid #d6bcfa", padding: 14, borderRadius: 12, marginBottom: 16 }}>
          <h4 style={{ margin: "0 0 10px" }}>🧠 Generate with AI</h4>
          <input placeholder="Dish name *" value={aiDish} onChange={e => { setAiDish(e.target.value); setAiError(""); }} style={inputStyle} />
          <input placeholder="Cuisine (optional)" value={cuisine} onChange={e => setCuisine(e.target.value)} style={inputStyle} />
          <input placeholder="Diet (optional, e.g. Vegan)" value={diet} onChange={e => setDiet(e.target.value)} style={inputStyle} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <label style={{ fontSize: 13, color: "#666", whiteSpace: "nowrap" }}>Servings:</label>
            <input type="number" min="1" value={servings} onChange={e => setServings(Number(e.target.value))} style={{ ...inputStyle, marginBottom: 0, width: 70 }} />
          </div>
          {aiError && <p style={{ color: "#e53e3e", fontSize: 13, marginBottom: 8 }}>⚠️ {aiError}</p>}
          <button type="button" onClick={handleGenerateAI} disabled={loading} style={{ width: "100%", padding: 11, borderRadius: 10, border: "none", background: loading ? "#9f7aea" : "#805ad5", color: "#fff", fontWeight: 600, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.8 : 1 }}>
            {loading ? "⏳ Generating…" : "✨ Generate Recipe with AI"}
          </button>
        </div>
        <hr style={{ margin: "0 0 14px", borderColor: "#e2e8f0" }} />
        <p style={{ fontSize: 12, color: "#888", marginBottom: 8 }}>Or fill in manually:</p>
        <input placeholder="Recipe title *" value={title} onChange={e => { setTitle(e.target.value); setSaveError(""); }} style={inputStyle} />
        <textarea placeholder="Ingredients (comma separated) *" value={ingredients} onChange={e => { setIngredients(e.target.value); setSaveError(""); }} rows={3} style={inputStyle} />
        <textarea placeholder="Steps (one per line) *" value={steps} onChange={e => { setSteps(e.target.value); setSaveError(""); }} rows={4} style={inputStyle} />
        <input placeholder="Estimated cost ($, $$, $$$)" value={cost} onChange={e => setCost(e.target.value)} style={inputStyle} />
        {saveError && <p style={{ color: "#e53e3e", fontSize: 13, marginBottom: 8 }}>⚠️ {saveError}</p>}
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button type="button" onClick={handleSave} style={{ flex: 1, padding: 12, borderRadius: 12, border: "none", background: "#3182ce", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>💾 Save Recipe</button>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: 12, borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
