// components/RecipePicker.jsx
// Shows 3 AI-generated recipe options — user picks one to save

export default function RecipePicker({ recipes, onPick, onClose }) {
  if (!recipes?.length) return null;

  const DIFFICULTY_COLOR = {
    "Easy":   { bg: "#f0fff4", color: "#276749" },
    "Medium": { bg: "#fffff0", color: "#975a16" },
    "Hard":   { bg: "#fff5f5", color: "#c53030" },
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 460, maxHeight: "88vh", overflowY: "auto", padding: 24, boxShadow: "0 16px 48px rgba(0,0,0,0.25)" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18 }}>🤖 Pick a Recipe</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#718096" }}>AI generated {recipes.length} options from your pantry</p>
          </div>
          <button type="button" onClick={onClose}
            style={{ background: "#f7fafc", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 16, flexShrink: 0 }}>✕</button>
        </div>

        <p style={{ fontSize: 13, color: "#718096", marginBottom: 16 }}>Tap a recipe to save it and start cooking!</p>

        {recipes.map((recipe, idx) => {
          const diff = DIFFICULTY_COLOR[recipe.difficulty] || DIFFICULTY_COLOR["Easy"];
          return (
            <div key={recipe.id || idx}
              onClick={() => onPick(recipe)}
              style={{
                border: "1.5px solid #e2e8f0", borderRadius: 14, padding: 16,
                marginBottom: 12, cursor: "pointer", background: "#fff",
                transition: "all 0.15s", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#c4622d"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#e2e8f0"}
            >
              {/* Option number + title */}
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
                <span style={{ minWidth: 26, height: 26, background: "#c4622d", color: "#fff", borderRadius: "50%", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {idx + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: 15, color: "#1a202c" }}>{recipe.title}</h4>
                  {recipe.description && (
                    <p style={{ margin: "3px 0 0", fontSize: 12, color: "#718096", lineHeight: 1.4 }}>{recipe.description}</p>
                  )}
                </div>
              </div>

              {/* Badges */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 10 }}>
                {recipe.cookTime  && <span style={badge("#ebf8ff","#2b6cb0")}>⏱ {recipe.cookTime}</span>}
                {recipe.servings  && <span style={badge("#fffff0","#975a16")}>🍽️ {recipe.servings} servings</span>}
                {recipe.cuisine   && <span style={badge("#fff5f7","#97266d")}>🌍 {recipe.cuisine}</span>}
                {recipe.mealType  && <span style={badge("#f0fff4","#276749")}>🍴 {recipe.mealType}</span>}
                {recipe.difficulty && <span style={badge(diff.bg, diff.color)}>⭐ {recipe.difficulty}</span>}
              </div>

              {/* Ingredient preview */}
              <div style={{ background: "#fafafa", borderRadius: 8, padding: "8px 10px" }}>
                <p style={{ fontSize: 11, color: "#a0aec0", margin: "0 0 4px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Ingredients ({recipe.ingredients?.length || 0})
                </p>
                <p style={{ fontSize: 12, color: "#4a5568", margin: 0, lineHeight: 1.5 }}>
                  {recipe.ingredients?.slice(0, 4).join(" · ")}
                  {recipe.ingredients?.length > 4 ? ` · +${recipe.ingredients.length - 4} more` : ""}
                </p>
              </div>

              {/* Tap to select CTA */}
              <div style={{ marginTop: 10, textAlign: "right" }}>
                <span style={{ fontSize: 12, color: "#c4622d", fontWeight: 600 }}>Tap to save & cook →</span>
              </div>
            </div>
          );
        })}

        <button type="button" onClick={onClose}
          style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 600, fontSize: 14, cursor: "pointer", marginTop: 4, color: "#718096" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

function badge(bg, color) {
  return { fontSize: 11, background: bg, color, padding: "3px 8px", borderRadius: 50, fontWeight: 600 };
}
