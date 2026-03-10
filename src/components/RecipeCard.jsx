import { useState, useRef } from "react";
import { findSimilarRecipes } from "../utils/findSimilar";
import { ingredientInPantry, getPantryNames, getMissingIngredients } from "../utils/pantryMatch";
import { uploadRecipePhoto, supabase } from "../utils/supabase";

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
  const match = Object.keys(COMMON_SUBS).find(k => key.includes(k) || k.includes(key.split(" ").pop()));
  return match ? COMMON_SUBS[match] : [];
}

function SimilarModal({ recipe, pantry, onClose }) {
  const [results, setResults]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    setLoading(true);
    const data = await findSimilarRecipes(recipe, pantry);
    setResults(data); setLoading(false); setSearched(true);
  }

  const CATS = [
    { key: "sameIngredients", label: "🥘 Same Ingredients",   color: "#ebf8ff", border: "#bee3f8" },
    { key: "healthier",       label: "🥗 Healthier Versions", color: "#f0fff4", border: "#9ae6b4" },
    { key: "easier",          label: "⚡ Easier & Faster",    color: "#fffff0", border: "#faf089" },
    { key: "variation",       label: "🌍 Cuisine Variations", color: "#fff5f7", border: "#fed7e2" },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 500, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto", padding: 20, boxShadow: "0 -8px 32px rgba(0,0,0,0.2)" }}>
        <div style={{ width: 40, height: 4, background: "#e2e8f0", borderRadius: 2, margin: "0 auto 16px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17 }}>🔍 Find Similar Recipes</h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#718096" }}>Based on: <strong>{recipe.title}</strong></p>
          </div>
          <button type="button" onClick={onClose} style={{ background: "#f7fafc", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>
        {!searched && (
          <button type="button" onClick={handleSearch} disabled={loading}
            style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: loading ? "#9f7aea" : "#805ad5", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginBottom: 16 }}>
            {loading ? "🔍 Searching…" : "✨ Find Similar Recipes with AI"}
          </button>
        )}
        {loading && (
          <div style={{ textAlign: "center", padding: "20px 0", color: "#718096" }}>
            <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#805ad5", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
            <p style={{ fontSize: 14 }}>Finding alternatives…</p>
          </div>
        )}
        {results && !loading && CATS.map(cat => {
          const items = results[cat.key] || [];
          if (!items.length) return null;
          return (
            <div key={cat.key} style={{ marginBottom: 16 }}>
              <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#4a5568" }}>{cat.label}</h4>
              {items.map((item, i) => (
                <div key={i} style={{ background: cat.color, border: `1px solid ${cat.border}`, borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{item.title}</p>
                      <p style={{ margin: "3px 0 0", fontSize: 12, color: "#718096" }}>{item.why}</p>
                    </div>
                    <a href={`https://www.google.com/search?q=${encodeURIComponent(item.searchQuery)}`} target="_blank" rel="noopener noreferrer"
                      style={{ padding: "6px 10px", borderRadius: 8, background: "#fff", border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600, color: "#3182ce", textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0 }}>
                      🔗 Find it
                    </a>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
        {searched && !loading && (
          <button type="button" onClick={() => { setResults(null); setSearched(false); }}
            style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13, marginTop: 4 }}>
            🔄 Search Again
          </button>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function RecipeCard({
  recipe, pantry = [], favorites = [], userId = null,
  onUpdateFavorites = () => {}, onAddIngredients = () => {},
  onDeleteRecipe = () => {}, onCookRecipe = () => {}, onUpdateRecipe = () => {},
}) {
  const [expanded, setExpanded]       = useState(false);
  const [deleted, setDeleted]         = useState(false);
  const [showSimilar, setShowSimilar] = useState(false);
  const [uploading, setUploading]     = useState(false);
  const fileInputRef                  = useRef(null);

  const ingredients = recipe.ingredients || [];
  const pantryNames = getPantryNames(pantry);
  const missing     = getMissingIngredients(recipe, pantry);
  const matchPct    = ingredients.length
    ? Math.round(((ingredients.length - missing.length) / ingredients.length) * 100)
    : 0;
  const isFav = favorites.includes(recipe.id);

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    setUploading(true);
    try {
      const url = await uploadRecipePhoto(userId, recipe.id, file);
      onUpdateRecipe({ ...recipe, photo: url });
    } catch (err) {
      console.error("Photo upload failed:", err);
      alert("Photo upload failed — try again.");
    }
    setUploading(false);
  }

  function handleDelete() { setDeleted(true); setTimeout(() => onDeleteRecipe(recipe.id), 280); }
  if (deleted) return null;

  const photo = recipe.photo || recipe.thumb || null;

  return (
    <>
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, marginBottom: 12, background: "#fff", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>

        {/* Photo area */}
        {photo ? (
          <div style={{ position: "relative" }}>
            <img src={photo} alt={recipe.title}
              style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
            {/* Replace photo button */}
            <button type="button" onClick={() => fileInputRef.current?.click()}
              style={{ position: "absolute", bottom: 8, right: 8, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 8, padding: "6px 10px", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
              {uploading ? "Uploading…" : "📸 Change"}
            </button>
          </div>
        ) : (
          /* No photo — show upload prompt */
          <button type="button" onClick={() => fileInputRef.current?.click()}
            style={{ width: "100%", padding: "14px 0", background: "#f7fafc", border: "none", borderBottom: "1px solid #e2e8f0", cursor: "pointer", color: "#a0aec0", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            {uploading ? "⏳ Uploading…" : "📸 Add your photo"}
          </button>
        )}

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" accept="image/*" capture="environment"
          onChange={handlePhotoUpload} style={{ display: "none" }} />

        <div style={{ padding: 14 }}>
          {/* Title + favourite */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                <h3 style={{ margin: 0, fontSize: 15 }}>{recipe.title}</h3>
                {recipe.generated  && <span style={{ fontSize: 10, background: "#e9d8fd", color: "#6b46c1", padding: "2px 6px", borderRadius: 50, fontWeight: 700 }}>🤖 AI</span>}
                {recipe.fromOnline && <span style={{ fontSize: 10, background: "#e6fffa", color: "#2c7a7b", padding: "2px 6px", borderRadius: 50, fontWeight: 700 }}>🌐 Online</span>}
                {recipe.fromImport && <span style={{ fontSize: 10, background: "#ebf8ff", color: "#2b6cb0", padding: "2px 6px", borderRadius: 50, fontWeight: 700 }}>🔗 Imported</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ height: 4, width: 80, background: "#e2e8f0", borderRadius: 2, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${matchPct}%`, borderRadius: 2, transition: "width 0.4s", background: matchPct === 100 ? "#38a169" : matchPct >= 50 ? "#d69e2e" : "#e53e3e" }} />
                </div>
                <span style={{ fontSize: 11, color: "#718096" }}>{matchPct}% in pantry {matchPct === 100 && "🎉"}</span>
              </div>
            </div>
            <button type="button"
              onClick={() => onUpdateFavorites(isFav ? favorites.filter(id => id !== recipe.id) : [...favorites, recipe.id])}
              style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: "0 4px" }}>
              {isFav ? "❤️" : "🤍"}
            </button>
          </div>

          {/* Expand ingredients */}
          <button type="button" onClick={() => setExpanded(v => !v)}
            style={{ background: "none", border: "none", color: "#3182ce", fontSize: 13, cursor: "pointer", padding: "6px 0" }}>
            {expanded ? "▲ Hide" : "▼ Show"} ingredients ({ingredients.length})
          </button>

          {expanded && (
            <div style={{ marginTop: 6 }}>
              <ul style={{ paddingLeft: 16, margin: "0 0 8px", fontSize: 13 }}>
                {ingredients.map((ing, i) => {
                  const have = ingredientInPantry(ing, pantryNames);
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

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
            <button type="button" onClick={() => onCookRecipe(recipe)}
              style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "none", background: "#c4622d", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>🍳 Cook</button>
            <button type="button" onClick={() => onAddIngredients(missing.length ? missing : ingredients)}
              style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
              🛒 {missing.length ? `Add ${missing.length} missing` : "Add all"}
            </button>
            <button type="button" onClick={() => setShowSimilar(true)}
              style={{ flex: 1, padding: "8px 10px", borderRadius: 8, border: "none", background: "#805ad5", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>🔍 Similar</button>
            <button type="button" onClick={handleDelete}
              style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #fed7d7", background: "#fff5f5", cursor: "pointer", fontSize: 13 }}>🗑</button>
          </div>
        </div>
      </div>

      {showSimilar && <SimilarModal recipe={recipe} pantry={pantry} onClose={() => setShowSimilar(false)} />}
    </>
  );
}
