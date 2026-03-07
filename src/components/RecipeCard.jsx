// components/RecipeCard.jsx
import { useState } from "react";

export default function RecipeCard({
  recipe,
  pantry       = [],
  favorites    = [],
  onUpdateFavorites = () => {},  // FIX #5: safe no-op defaults
  onAddIngredients  = () => {},
  onDeleteRecipe    = () => {},
  onCookRecipe      = () => {},
}) {
  const [expanded, setExpanded] = useState(false);
  const [deleted,  setDeleted]  = useState(false);

  // FIX #2: guard — never crash if ingredients is missing
  const ingredients = recipe.ingredients || [];

  // FIX #1: handle BOTH old string[] and new { name, category }[] pantry formats
  const pantryLower = pantry.map(p =>
    typeof p === "string" ? p.toLowerCase() : (p.name || "").toLowerCase()
  );

  const missingIngredients = ingredients.filter(
    ing => !pantryLower.includes(ing.toLowerCase().trim())
  );

  const matchCount  = ingredients.length - missingIngredients.length;
  const matchPct    = ingredients.length
    ? Math.round((matchCount / ingredients.length) * 100)
    : 0;

  const isFavorite  = favorites.includes(recipe.id);

  // FIX #3: inline common substitutions — no external file needed
  const SUBS = {
    "egg":         [{ item: "flax egg",      note: "1 tbsp flax + 3 tbsp water" }],
    "butter":      [{ item: "olive oil",     note: "use ¾ the amount" }],
    "milk":        [{ item: "oat milk",      note: "1:1 replacement" }],
    "flour":       [{ item: "oat flour",     note: "1:1 for most recipes" }],
    "sugar":       [{ item: "honey",         note: "use ¾ the amount" }],
    "garlic":      [{ item: "garlic powder", note: "⅛ tsp per clove" }],
    "onion":       [{ item: "shallot",       note: "milder flavour" }],
    "chicken":     [{ item: "tofu",          note: "press and cube first" }],
    "soy sauce":   [{ item: "coconut aminos",note: "1:1, slightly sweeter" }],
    "heavy cream": [{ item: "coconut cream", note: "1:1 replacement" }],
  };

  function getSubstitutions(item) {
    const key = item.toLowerCase().trim();
    const match = Object.keys(SUBS).find(k => key.includes(k) || k.includes(key));
    return match ? SUBS[match] : [];
  }

  // Animate out on delete
  function handleDelete() {
    setDeleted(true);
    setTimeout(() => onDeleteRecipe(recipe.id), 300);
  }

  if (deleted) return null;

  return (
    <div style={{
      ...cardStyle,
      opacity: deleted ? 0 : 1,
      transition: "opacity 0.3s ease",
    }}>

      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: "0 0 4px", fontSize: 16 }}>
            {recipe.title}
            {recipe.generated && (
              <span style={aiBadgeStyle}>🤖 AI</span>
            )}
          </h3>
          {/* Pantry match bar */}
          {ingredients.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={matchBarBgStyle}>
                <div style={{
                  ...matchBarFillStyle,
                  width: `${matchPct}%`,
                  background: matchPct === 100 ? "#38a169" : matchPct >= 50 ? "#d69e2e" : "#e53e3e",
                }} />
              </div>
              <span style={{ fontSize: 11, color: "#718096" }}>
                {matchPct}% in pantry
              </span>
            </div>
          )}
        </div>

        {/* Favourite toggle */}
        <button
          type="button"
          onClick={() =>
            onUpdateFavorites(
              isFavorite
                ? favorites.filter(id => id !== recipe.id)
                : [...favorites, recipe.id]
            )
          }
          style={iconBtnStyle}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isFavorite ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Expand / collapse ingredients */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        style={expandBtnStyle}
        aria-expanded={expanded}
      >
        {expanded ? "▲ Hide ingredients" : "▼ Show ingredients"}
        {" "}({ingredients.length})
      </button>

      {expanded && (
        <div style={{ marginTop: 8 }}>
          {/* Full ingredient list */}
          <ul style={{ paddingLeft: 16, margin: "0 0 8px", fontSize: 14 }}>
            {ingredients.map((ing, i) => {
              const have = pantryLower.includes(ing.toLowerCase().trim());
              return (
                <li key={i} style={{ color: have ? "#38a169" : "#e53e3e", marginBottom: 2 }}>
                  {have ? "✓" : "✗"} {ing}
                </li>
              );
            })}
          </ul>

          {/* Missing + substitutions */}
          {missingIngredients.length > 0 && (
            <div style={missingBoxStyle}>
              <strong style={{ fontSize: 13 }}>🔧 Missing — try these swaps:</strong>
              {missingIngredients.map(item => {
                const subs = getSubstitutions(item);
                return (
                  <div key={item} style={{ marginTop: 6 }}>
                    <span style={{ color: "#e53e3e", fontSize: 13 }}>❌ {item}</span>
                    {subs.length > 0
                      ? subs.map((s, i) => (
                          <div key={i} style={{ fontSize: 12, marginLeft: 12, color: "#4a5568" }}>
                            ✅ {s.item}
                            {s.note && <span style={{ color: "#a0aec0" }}> — {s.note}</span>}
                          </div>
                        ))
                      : <div style={{ fontSize: 12, marginLeft: 12, color: "#a0aec0" }}>
                          No substitution available
                        </div>
                    }
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      {/* FIX #4: all buttons have type="button" */}
      <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={() => onCookRecipe(recipe)}
          style={primaryBtnStyle}
          aria-label={`Cook ${recipe.title}`}
        >
          🍳 Cook
        </button>
        <button
          type="button"
          onClick={() => onAddIngredients(ingredients)}
          style={secondaryBtnStyle}
          aria-label="Add missing ingredients to shopping list"
        >
          🛒 Add to list
        </button>
        <button
          type="button"
          onClick={handleDelete}
          style={deleteBtnStyle}
          aria-label={`Delete ${recipe.title}`}
        >
          🗑
        </button>
      </div>
    </div>
  );
}

/* ── Styles ── */
const cardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 14,
  marginBottom: 12,
  background: "#fff",
  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
};
const aiBadgeStyle = {
  marginLeft: 8, fontSize: 11,
  background: "#e9d8fd", color: "#6b46c1",
  padding: "2px 7px", borderRadius: 50,
  fontWeight: 600, verticalAlign: "middle",
};
const matchBarBgStyle = {
  height: 5, width: 80,
  background: "#e2e8f0", borderRadius: 3, overflow: "hidden",
};
const matchBarFillStyle = {
  height: "100%", borderRadius: 3,
  transition: "width 0.4s ease",
};
const iconBtnStyle = {
  background: "none", border: "none",
  fontSize: 20, cursor: "pointer", padding: "0 4px",
  lineHeight: 1,
};
const expandBtnStyle = {
  background: "none", border: "none",
  color: "#3182ce", fontSize: 13,
  cursor: "pointer", padding: "6px 0",
  textAlign: "left",
};
const missingBoxStyle = {
  background: "#fff5f5",
  border: "1px solid #fed7d7",
  borderRadius: 8, padding: 10,
};
const primaryBtnStyle = {
  flex: 1, padding: "8px 10px",
  borderRadius: 8, border: "none",
  background: "#c4622d", color: "#fff",
  fontWeight: 600, cursor: "pointer", fontSize: 13,
  minWidth: 70,
};
const secondaryBtnStyle = {
  flex: 1, padding: "8px 10px",
  borderRadius: 8, border: "1px solid #e2e8f0",
  background: "#fff", fontWeight: 600,
  cursor: "pointer", fontSize: 13,
  minWidth: 70,
};
const deleteBtnStyle = {
  padding: "8px 12px",
  borderRadius: 8, border: "1px solid #fed7d7",
  background: "#fff5f5", cursor: "pointer", fontSize: 14,
};
