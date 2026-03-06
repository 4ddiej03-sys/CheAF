import RecipeList from "./RecipeList";

export default function Favorites({ recipes = [], favorites = [], pantry = [], onUpdateFavorites = () => {}, onAddIngredients = () => {}, onCookRecipe = () => {}, onDeleteRecipe = () => {} }) {
  const favoriteRecipes = recipes.filter(r => favorites.includes(r.id));
  if (!favoriteRecipes.length) return (
    <div style={{ textAlign: "center", padding: "40px 20px", background: "#f7fafc", borderRadius: 16, marginTop: 16, border: "1px dashed #cbd5e0" }}>
      <p style={{ fontSize: 36, margin: 0 }}>🤍</p>
      <p style={{ fontWeight: 600, fontSize: 16, margin: "8px 0 4px" }}>No favourites yet</p>
      <p style={{ color: "#718096", fontSize: 14, margin: 0 }}>Tap ❤️ on any recipe to save it here.</p>
    </div>
  );
  return (
    <div style={{ marginTop: 16 }}>
      <p style={{ fontSize: 13, color: "#718096", marginBottom: 12 }}>{favoriteRecipes.length} saved recipe{favoriteRecipes.length !== 1 ? "s" : ""}</p>
      <RecipeList recipes={favoriteRecipes} favorites={favorites} pantry={pantry}
        onUpdateFavorites={onUpdateFavorites} onAddIngredients={onAddIngredients}
        onCookRecipe={onCookRecipe} onDeleteRecipe={onDeleteRecipe} />
    </div>
  );
}
