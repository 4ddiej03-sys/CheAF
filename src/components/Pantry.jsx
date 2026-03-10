import { useState } from "react";
import PantryScanner from "./PantryScanner";

const CATEGORIES = ["Protein", "Vegetable", "Carb", "Dairy", "Spice", "Other"];

export default function Pantry({ pantry, setPantry, suggestedRecipes = [], onCreateMeal, onAddToShoppingList, onGenerateAIRecipe }) {
  const [inputValue, setInputValue] = useState("");
  const [category, setCategory] = useState("Other");
  const [editIndex, setEditIndex] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [editCategory, setEditCategory] = useState("Other");
  const [mealTitle, setMealTitle] = useState("");
  const [feedback, setFeedback] = useState("");
  const [showScanner, setShowScanner] = useState(false);

  function showFeedback(msg) { setFeedback(msg); setTimeout(() => setFeedback(""), 2500); }
  const getName = i => i.name || i;
  const getCat  = i => i.category || "Other";
  function normalize(s) { return (typeof s === "object" ? s.name : s || "").toLowerCase().trim(); }

  function addItem(e) {
    e.preventDefault();
    const val = inputValue.trim();
    if (!val) return;
    if (pantry.some(i => normalize(i) === val.toLowerCase().trim())) { showFeedback(`"${val}" already in pantry.`); return; }
    setPantry(prev => [...prev, { name: val.toLowerCase().trim(), category }]);
    setInputValue("");
    showFeedback(`"${val}" added!`);
  }

  function saveEdit(i) {
    const trimmed = editValue.trim();
    if (!trimmed) { showFeedback("Name can't be empty."); return; }
    setPantry(prev => prev.map((p, idx) => idx === i ? { name: trimmed.toLowerCase(), category: editCategory } : p));
    setEditIndex(null);
  }

  return (
    <div>
      <h2>🥫 Pantry</h2>
      <p style={{ fontSize: 12, color: "#718096", marginTop: 4 }}>{pantry.length === 0 ? "No ingredients yet." : `${pantry.length} ingredient${pantry.length !== 1 ? "s" : ""}`}</p>
      <form onSubmit={addItem} style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
        <input value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Add ingredient…" style={{ flex: 1, padding: 8, borderRadius: 8, border: "1px solid #e2e8f0", minWidth: 110, fontSize: 14 }} />
        <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: 8, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14 }}>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <button type="button" onClick={() => setShowScanner(true)}
          style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: "#c4622d", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", marginBottom: 10 }}>
          📸 Scan Fridge or Pantry
        </button>
        <button type="submit" style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: "#3182ce", color: "#fff", fontWeight: 600, cursor: "pointer" }}>+ Add</button>
      </form>
      {feedback && <p style={{ fontSize: 13, color: "#3182ce", marginBottom: 8 }}>{feedback}</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {pantry.map((item, i) => (
          <li key={i} style={{ display: "flex", gap: 6, alignItems: "center", background: "#f7fafc", borderRadius: 8, padding: "6px 8px", marginBottom: 6 }}>
            {editIndex === i ? (
              <>
                <input value={editValue} onChange={e => setEditValue(e.target.value)} autoFocus style={{ flex: 1, padding: 6, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 14 }} />
                <select value={editCategory} onChange={e => setEditCategory(e.target.value)} style={{ padding: 6, borderRadius: 6, border: "1px solid #e2e8f0", fontSize: 13 }}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <button type="button" onClick={() => saveEdit(i)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>✅</button>
                <button type="button" onClick={() => setEditIndex(null)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>✕</button>
              </>
            ) : (
              <>
                <span style={{ flex: 1, fontSize: 14 }}>{getName(item)} <small style={{ color: "#a0aec0", fontSize: 11 }}>({getCat(item)})</small></span>
                <button type="button" onClick={() => { setEditIndex(i); setEditValue(getName(item)); setEditCategory(getCat(item)); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15 }}>✏️</button>
                <button type="button" onClick={() => setPantry(prev => prev.filter((_, idx) => idx !== i))} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 15 }}>❌</button>
              </>
            )}
          </li>
        ))}
      </ul>
      {typeof onGenerateAIRecipe === "function" && (
        <button type="button" onClick={onGenerateAIRecipe} style={{ width: "100%", marginTop: 10, padding: 10, borderRadius: 8, border: "none", background: "#6b46c1", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14, boxSizing: "border-box" }}>🤖 Generate AI Recipe from Pantry</button>
      )}
      <button type="button" onClick={() => { if (!pantry.length) { showFeedback("Add ingredients first."); return; } onAddToShoppingList(pantry.map(getName)); showFeedback("Added to shopping list!"); }}
        style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14, boxSizing: "border-box" }}>
        ➕ Add pantry to shopping list
      </button>
      <input placeholder="Meal name (optional)" value={mealTitle} onChange={e => setMealTitle(e.target.value)} style={{ width: "100%", padding: 8, marginTop: 10, borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 14, boxSizing: "border-box" }} />
      <button type="button" onClick={() => { if (!pantry.length) { showFeedback("Add ingredients first."); return; } onCreateMeal(mealTitle); setMealTitle(""); }}
        style={{ width: "100%", marginTop: 8, padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14, boxSizing: "border-box" }}>
        🍳 Create Meal from Pantry
      </button>
      {suggestedRecipes.length > 0 && (
        <>
          <h3 style={{ marginTop: 18, marginBottom: 8 }}>🍽 You could make:</h3>
          {suggestedRecipes.map(r => (
            <div key={r.id} style={{ padding: "8px 12px", marginBottom: 6, borderRadius: 8, background: r.percent === 100 ? "#c6f6d5" : r.percent >= 50 ? "#fefcbf" : "#fed7d7" }}>
              <strong style={{ fontSize: 13 }}>{r.title}</strong>
              <div style={{ fontSize: 11, color: "#4a5568" }}>{r.percent}% match {r.percent === 100 && "🎉"}</div>
            </div>
          ))}
        </>
      )}
      {showScanner && (
        <PantryScanner
          onAddIngredients={items => setPantry([...pantry, ...items])}
          onClose={() => setShowScanner(false)}
  />
)}
    </div>
  );
}
