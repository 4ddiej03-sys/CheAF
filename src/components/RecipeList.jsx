// components/RecipeList.jsx
import { useState } from "react";
import RecipeCard from "./RecipeCard";

export default function RecipeList({
  recipes = [], pantry = [], favorites = [], userId = null,
  onUpdateFavorites = () => {}, onAddIngredients = () => {},
  onDeleteRecipe = () => {}, onCookRecipe = () => {}, onUpdateRecipe = () => {},
}) {
  const [search, setSearch] = useState("");

  const filtered = recipes.filter(r =>
    r.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Search bar */}
      <input
        type="text"
        placeholder="🔍 Search recipes…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, marginBottom: 12, boxSizing: "border-box", outline: "none", fontFamily: "inherit", background: "#fff" }}
      />

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: "#a0aec0" }}>
          <p style={{ fontSize: 32, margin: "0 0 8px" }}>🍽️</p>
          <p style={{ fontSize: 15, margin: 0 }}>{search ? "No recipes match your search" : "No recipes yet — add one above!"}</p>
        </div>
      ) : (
        filtered.map(recipe => (
          <RecipeCard
            key={recipe.id}
            recipe={recipe}
            pantry={pantry}
            favorites={favorites}
            userId={userId}
            onUpdateFavorites={onUpdateFavorites}
            onAddIngredients={onAddIngredients}
            onDeleteRecipe={onDeleteRecipe}
            onCookRecipe={onCookRecipe}
            onUpdateRecipe={onUpdateRecipe}
          />
        ))
      )}

      {filtered.length > 0 && (
        <p style={{ textAlign: "center", fontSize: 12, color: "#a0aec0", marginTop: 8 }}>
          {filtered.length} recipe{filtered.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
