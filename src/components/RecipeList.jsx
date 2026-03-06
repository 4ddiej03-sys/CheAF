import { useState } from "react";
import RecipeCard from "./RecipeCard";

export default function RecipeList({ recipes = [], pantry = [], favorites = [], onUpdateFavorites, onAddIngredients, onDeleteRecipe, onCookRecipe, onApplySubstitution = () => {}, onUndoSubstitution = () => {} }) {
  const [search, setSearch] = useState("");
  const filtered = recipes.filter(r => r.title?.toLowerCase().includes(search.toLowerCase()));

  if (!recipes.length) return (
    <div style={{ textAlign: "center", padding: "40px 20px", background: "#f7fafc", borderRadius: 16, marginTop: 16, border: "1px dashed #cbd5e0" }}>
      <p style={{ fontSize: 36, margin: 0 }}>🍽️</p>
      <p style={{ fontWeight: 600, fontSize: 16, margin: "8px 0 4px" }}>No recipes yet</p>
      <p style={{ color: "#718096", fontSize: 14, margin: 0 }}>Tap ➕ New Recipe to add one, or use 🤖 Generate from Pantry.</p>
    </div>
  );

  return (
    <div>
      <input type="search" placeholder="🔍 Search recipes…" value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, marginBottom: 12, boxSizing: "border-box", outline: "none" }} />
      {filtered.length === 0 && search && (
        <div style={{ textAlign: "center", padding: "30px", background: "#f7fafc", borderRadius: 12, border: "1px dashed #cbd5e0" }}>
          <p style={{ fontSize: 28, margin: 0 }}>🔍</p>
          <p style={{ fontWeight: 600, margin: "6px 0 2px" }}>No match for "{search}"</p>
        </div>
      )}
      <div role="list" aria-label="Recipe list">
        {filtered.map((recipe, index) => (
          <RecipeCard key={recipe.id ?? `recipe-${index}`} recipe={recipe} pantry={pantry} favorites={favorites}
            onUpdateFavorites={onUpdateFavorites} onAddIngredients={onAddIngredients}
            onDeleteRecipe={onDeleteRecipe} onCookRecipe={onCookRecipe} />
        ))}
      </div>
      <p style={{ textAlign: "center", color: "#a0aec0", fontSize: 12, marginTop: 12 }}>
        {filtered.length} of {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}{search && ` matching "${search}"`}
      </p>
    </div>
  );
}
