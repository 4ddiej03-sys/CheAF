import { useState } from "react";
import { searchOnlineRecipes } from "../utils/searchRecipes";

const CUISINES = ["Any","Italian","Mexican","Chinese","Japanese","Indian","Indonesian","French","American","Thai","British","Greek","Spanish","Filipino","Vietnamese","Korean"];
const DIETS    = ["Any","Vegetarian","Vegan","Chicken","Beef","Seafood","Pasta","Dessert"];

export default function OnlineRecipeSearch({ pantry = [], onSaveRecipe, onClose }) {
  const [cuisine, setCuisine]   = useState("Any");
  const [diet, setDiet]         = useState("Any");
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [searched, setSearched] = useState(false);
  const [saved, setSaved]       = useState(new Set());
  const [error, setError]       = useState("");

  async function handleSearch() {
    if (!pantry.length) { setError("Add ingredients to your pantry first!"); return; }
    setError(""); setLoading(true); setSearched(false);
    try {
      const data = await searchOnlineRecipes({ pantry, cuisine, diet });
      setResults(data);
      setSearched(true);
      if (!data.length) setError("No matches found — try different filters.");
    } catch { setError("Search failed — check your connection."); }
    setLoading(false);
  }

  function handleSave(recipe) {
    onSaveRecipe(recipe);
    setSaved(prev => new Set([...prev, recipe.id]));
  }

  const pantryNames = pantry.map(p => typeof p === "object" ? p.name : p);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 400, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, height: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 -8px 32px rgba(0,0,0,0.2)" }}>

        <div style={{ padding: "12px 20px 0", flexShrink: 0 }}>
          {/* Drag handle */}
          <div style={{ width: 40, height: 4, background: "#e2e8f0", borderRadius: 2, margin: "0 auto 14px" }} />

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18 }}>🌐 Search Recipes Online</h3>
              <p style={{ margin: "3px 0 0", fontSize: 12, color: "#718096" }}>
                Pantry: {pantryNames.slice(0, 3).join(", ")}{pantryNames.length > 3 ? ` +${pantryNames.length - 3} more` : ""}
              </p>
            </div>
            <button type="button" onClick={onClose}
              style={{ background: "#f7fafc", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 16 }}>✕</button>
          </div>

          {/* FIX: bigger, clearer filter section */}
          <div style={{ marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#4a5568", margin: "0 0 8px" }}>🎛 Filter results:</p>
            <div style={{ marginBottom: 10 }}>
              <label style={{ fontSize: 13, color: "#4a5568", display: "block", marginBottom: 5, fontWeight: 500 }}>
                🌍 Cuisine
              </label>
              {/* Scrollable pill selector instead of dropdown */}
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, WebkitOverflowScrolling: "touch" }}>
                {CUISINES.map(c => (
                  <button key={c} type="button" onClick={() => setCuisine(c)}
                    style={{
                      padding: "8px 16px", borderRadius: 50, border: "none", cursor: "pointer",
                      background: cuisine === c ? "#3182ce" : "#edf2f7",
                      color: cuisine === c ? "#fff" : "#4a5568",
                      fontWeight: cuisine === c ? 700 : 500,
                      fontSize: 13, whiteSpace: "nowrap", flexShrink: 0,
                      transition: "all 0.15s",
                    }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: "#4a5568", display: "block", marginBottom: 5, fontWeight: 500 }}>
                🍽️ Category
              </label>
              <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6, WebkitOverflowScrolling: "touch" }}>
                {DIETS.map(d => (
                  <button key={d} type="button" onClick={() => setDiet(d)}
                    style={{
                      padding: "8px 16px", borderRadius: 50, border: "none", cursor: "pointer",
                      background: diet === d ? "#c4622d" : "#edf2f7",
                      color: diet === d ? "#fff" : "#4a5568",
                      fontWeight: diet === d ? 700 : 500,
                      fontSize: 13, whiteSpace: "nowrap", flexShrink: 0,
                      transition: "all 0.15s",
                    }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Search button */}
          <button type="button" onClick={handleSearch} disabled={loading}
            style={{ width: "100%", padding: 13, borderRadius: 12, border: "none", background: loading ? "#90cdf4" : "#3182ce", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginBottom: 8 }}>
            {loading ? "🔍 Searching real recipes…" : "🔍 Search by My Pantry"}
          </button>
          {error && <p style={{ color: "#e53e3e", fontSize: 13, margin: "0 0 8px", textAlign: "center" }}>{error}</p>}
        </div>

        {/* Scrollable results */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 100px" }}>
          {loading && [1,2,3].map(i => (
            <div key={i} style={{ background: "#f7fafc", borderRadius: 12, padding: 14, marginBottom: 10, marginTop: i === 1 ? 12 : 0 }}>
              <div style={{ height: 16, background: "#e2e8f0", borderRadius: 4, marginBottom: 8, width: "70%" }} />
              <div style={{ height: 12, background: "#e2e8f0", borderRadius: 4, width: "40%" }} />
            </div>
          ))}

          {!loading && searched && (
            <>
              <p style={{ fontSize: 13, color: "#718096", margin: "12px 0 8px" }}>
                {results.length} recipe{results.length !== 1 ? "s" : ""} found matching your pantry
              </p>
              {results.map(recipe => {
                const isSaved = saved.has(recipe.id);
                const missingCount = recipe.ingredients.filter(ing => {
                  const pLower = pantryNames.map(p => p.toLowerCase());
                  return !pLower.some(p => ing.toLowerCase().includes(p) || p.includes(ing.toLowerCase().split(" ").pop()));
                }).length;

                return (
                  <div key={recipe.id} style={{ border: "1px solid #e2e8f0", borderRadius: 12, marginBottom: 12, background: "#fff", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                    {recipe.thumb && <img src={recipe.thumb} alt={recipe.title} style={{ width: "100%", height: 160, objectFit: "cover" }} />}
                    <div style={{ padding: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
                        <h4 style={{ margin: 0, fontSize: 15, flex: 1 }}>{recipe.title}</h4>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                          {recipe.cuisine && <span style={{ fontSize: 10, background: "#ebf8ff", color: "#2b6cb0", padding: "2px 7px", borderRadius: 50, fontWeight: 600 }}>{recipe.cuisine}</span>}
                          {recipe.category && <span style={{ fontSize: 10, background: "#f0fff4", color: "#276749", padding: "2px 7px", borderRadius: 50, fontWeight: 600 }}>{recipe.category}</span>}
                        </div>
                      </div>

                      {/* Match bar */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                        <div style={{ flex: 1, height: 5, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${recipe.matchPct}%`, borderRadius: 3, background: recipe.matchPct >= 70 ? "#38a169" : recipe.matchPct >= 40 ? "#d69e2e" : "#e53e3e", transition: "width 0.4s" }} />
                        </div>
                        <span style={{ fontSize: 12, color: "#718096", whiteSpace: "nowrap" }}>{recipe.matchPct}% match</span>
                      </div>

                      <p style={{ fontSize: 12, color: "#718096", margin: "0 0 10px" }}>
                        {recipe.ingredients.length} ingredients
                        {missingCount > 0
                          ? ` · need ${missingCount} more item${missingCount > 1 ? "s" : ""}`
                          : " · ✅ you have everything!"}
                      </p>

                      <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" onClick={() => handleSave(recipe)} disabled={isSaved}
                          style={{ flex: 1, padding: "9px 12px", borderRadius: 9, border: "none", background: isSaved ? "#c6f6d5" : "#3182ce", color: isSaved ? "#276749" : "#fff", fontWeight: 600, cursor: isSaved ? "default" : "pointer", fontSize: 13 }}>
                          {isSaved ? "✅ Saved!" : "💾 Save Recipe"}
                        </button>
                        {recipe.source && (
                          <a href={recipe.source} target="_blank" rel="noopener noreferrer"
                            style={{ padding: "9px 12px", borderRadius: 9, border: "1px solid #e2e8f0", background: "#fff", color: "#3182ce", fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                            🔗 Full Recipe
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
