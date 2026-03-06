import { useState } from "react";

const COMMON_SUBS = {
  "egg":         [{ item: "1 tbsp flax + 3 tbsp water", note: "let sit 5 min" }],
  "butter":      [{ item: "Olive oil", note: "use ¾ the amount" }],
  "milk":        [{ item: "Oat milk", note: "1:1 replacement" }],
  "flour":       [{ item: "Oat flour", note: "1:1 for most recipes" }],
  "garlic":      [{ item: "Garlic powder", note: "⅛ tsp per clove" }],
  "onion":       [{ item: "Shallot", note: "milder flavour" }],
  "chicken":     [{ item: "Tofu", note: "press and cube first" }],
  "soy sauce":   [{ item: "Coconut aminos", note: "1:1, slightly sweeter" }],
  "heavy cream": [{ item: "Coconut cream", note: "1:1 replacement" }],
  "parmesan":    [{ item: "Pecorino Romano", note: "use a little less" }],
};

function getSubstitutions(item) {
  const key = item.toLowerCase().trim();
  const match = Object.keys(COMMON_SUBS).find(k => key.includes(k) || k.includes(key.split(" ")[0]));
  return match ? COMMON_SUBS[match] : [];
}

function normalizePantry(pantry) {
  return pantry.map(p => typeof p === "string" ? p.toLowerCase() : (p.name || "").toLowerCase());
}

export default function RecipeCard({ recipe, pantry = [], favorites = [], onUpdateFavorites = () => {}, onAddIngredients = () => {}, onDeleteRecipe = () => {}, onCookRecipe = () => {} }) {
  const [expanded, setExpanded] = useState(false);
  const [deleted, setDeleted] = useState(false);
  const ingredients = recipe.ingredients || [];
  const pantryLower = normalizePantry(pantry);
  const missing = ingredients.filter(i => !pantryLower.includes(i.toLowerCase().trim()));
  const matchPct = ingredients.length ? Math.round(((ingredients.length - missing.length) / ingredients.length) * 100) : 0;
  const isFav = favorites.includes(recipe.id);

  function handleDelete() { setDeleted(true); setTimeout(() => onDeleteRecipe(recipe.id), 280); }
  if (deleted) return null;

  return (
    <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 14, marginBottom: 12, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 15 }}>{recipe.title}</h3>
            {recipe.generated && <span style={{ fontSize: 10, background: "#e9d8fd", color: "#6b46c1", padding: "2px 6px", borderRadius: 50, fontWeight: 700 }}>🤖 AI</span>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ height: 4, width: 80, background: "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${matchPct}%`, borderRadius: 2, transition: "width 0.4s", background: matchPct === 100 ? "#38a169" : matchPct >= 50 ? "#d69e2e" : "#e53e3e" }} />
            </div>
            <span style={{ fontSize: 11, color: "#718096" }}>{matchPct}% in pantry</span>
          </div>
        </div>
        <button type="button" onClick={() => onUpdateFavorites(isFav ? favorites.filter(id => id !== recipe.id) : [...favorites, recipe.id])}
          style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: "0 4px" }}>
          {isFav ? "❤️" : "🤍"}
        </button>
      </div>

      <button type="button" onClick={() => setExpanded(v => !v)}
        style={{ background: "none", border: "none", color: "#3182ce", fontSize: 13, cursor: "pointer", padding: "6px 0" }}>
        {expanded ? "▲ Hide" : "▼ Show"} ingredients ({ingredients.length})
      </button>

      {expanded && (
        <div style={{ marginTop: 6 }}>
          <ul style={{ paddingLeft: 16, margin: "0 0 8px", fontSize: 13 }}>
            {ingredients.map((ing, i) => {
              const have = pantryLower.includes(ing.toLowerCase().trim());
              return <li key={i} style={{ color: have ? "#38a169" : "#e53e3e", marginBottom: 2 }}>{have ? "✓" : "✗"} {ing}</li>;
            })}
          </ul>
          {missing.length > 0 && (
            <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 8, padding: 10 }}>
              <strong style={{ fontSize: 12 }}>🔧 Missing — swap ideas:</strong>
              {missing.map(item => {
                const subs = getSubstitutions(item);
                return (
                  <div key={item} style={{ marginTop: 5 }}>
                    <span style={{ color: "#e53e3e", fontSize: 12 }}>❌ {item}</span>
                    {subs.map((s, i) => <div key={i} style={{ fontSize: 11, marginLeft: 10, color: "#4a5568" }}>✅ {s.item} <span style={{ color: "#a0aec0" }}>— {s.note}</span></div>)}
                    {!subs.length && <div style={{ fontSize: 11, marginLeft: 10, color: "#a0aec0" }}>No substitution on file</div>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        <button type="button" onClick={() => onCookRecipe(recipe)} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "none", background: "#c4622d", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>🍳 Cook</button>
        <button type="button" onClick={() => onAddIngredients(ingredients)} style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>🛒 Add to list</button>
        <button type="button" onClick={handleDelete} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #fed7d7", background: "#fff5f5", cursor: "pointer", fontSize: 13 }}>🗑</button>
      </div>
    </div>
  );
}
