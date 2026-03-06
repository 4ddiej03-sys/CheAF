import { useState, useEffect } from "react";
import recipesData from "./data/recipes.json";
import NewRecipeModal from "./components/NewRecipeModal";
import RecipeList from "./components/RecipeList";
import Favorites from "./components/Favorites";
import ShoppingList from "./components/ShoppingList";
import BottomNav from "./components/BottomNav";
import Pantry from "./components/Pantry";
import CookingMode from "./components/CookingMode";
import { generateAIRecipe } from "./utils/aiRecipe";

const Storage = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set: (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) { console.warn("Storage error:", e); } },
};

export default function App() {
  const [tab, setTab] = useState("recipes");
  const [recipes, setRecipes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [shoppingList, setShoppingList] = useState([]);
  const [pantry, setPantry] = useState([]);
  const [cookingRecipe, setCookingRecipe] = useState(null);
  const [stepIndex, setStepIndex] = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [showNewRecipe, setShowNewRecipe] = useState(false);

  useEffect(() => {
    const savedRecipes   = Storage.get("recipes");
    const savedFavorites = Storage.get("favorites");
    const savedShopping  = Storage.get("shoppingList");
    const savedPantry    = Storage.get("pantry");
    setRecipes(savedRecipes?.length ? savedRecipes : recipesData);
    setFavorites(savedFavorites || []);
    setShoppingList(savedShopping || []);
    setPantry(savedPantry || []);
  }, []);

  useEffect(() => Storage.set("recipes", recipes),           [recipes]);
  useEffect(() => Storage.set("favorites", favorites),       [favorites]);
  useEffect(() => Storage.set("shoppingList", shoppingList), [shoppingList]);
  useEffect(() => Storage.set("pantry", pantry),             [pantry]);

  function normalize(item) {
    if (!item) return "";
    if (typeof item === "object") return (item.name || "").toLowerCase().trim();
    return item.toLowerCase().trim();
  }

  function notify(msg) { alert(msg); }

  function addToShoppingList(items) {
    if (!Array.isArray(items)) return;
    setShoppingList(prev => {
      const existing = prev.map(i => i.toLowerCase());
      const next = [...prev];
      items.forEach(item => {
        const name = typeof item === "object" ? item.name : item;
        if (name && !existing.includes(name.toLowerCase())) next.push(name);
      });
      return next;
    });
  }

  function consumePantryIngredients(items) {
    setPantry(prev => prev.filter(p => !items.map(normalize).includes(normalize(p))));
  }

  function handleSaveNewRecipe(recipe) {
    setRecipes(prev => [recipe, ...prev]);
    setTab("recipes");
  }

  function cookRecipe(recipe) {
    const pantryLower = pantry.map(normalize);
    const missing = (recipe.ingredients || []).filter(ing => !pantryLower.includes(normalize(ing)));
    addToShoppingList(missing);
    consumePantryIngredients(recipe.ingredients || []);
    setCookingRecipe(recipe);
    setStepIndex(0);
    setCheckedIngredients([]);
  }

  function cookBestPantryRecipe() {
    if (!pantry.length || !recipes.length) { notify("Add pantry items first 🫙"); return; }
    const scored = recipes.map(recipe => {
      const matches = (recipe.ingredients || []).filter(i => pantry.map(normalize).includes(normalize(i))).length;
      const percent = recipe.ingredients?.length ? matches / recipe.ingredients.length : 0;
      return { ...recipe, matches, percent };
    });
    const best = scored.sort((a, b) => b.percent - a.percent)[0];
    if (!best || best.matches === 0) { notify("No matching recipes found. Try AI Generate Recipe 🤖"); return; }
    notify(`🍳 Che AF found the best match: ${best.title}`);
    cookRecipe(best);
  }

  async function generateRecipeFromPantry() {
    if (!pantry.length) { notify("Your pantry is empty 🫙"); return; }
    try {
      const aiRecipe = await generateAIRecipe(pantry);
      setRecipes(prev => [{ id: crypto.randomUUID(), title: aiRecipe.title || "AI Pantry Recipe", ingredients: aiRecipe.ingredients || [], steps: aiRecipe.steps || [], generated: true }, ...prev]);
      setTab("recipes");
    } catch (err) {
      console.error(err);
      notify("AI recipe generation failed 🤖");
    }
  }

  function generateSteps(ingredients) {
    const names = ingredients.map(i => typeof i === "object" ? i.name : i);
    return [`Chop ${names.join(", ")}`, "Heat oil in a pan", `Add ${names.join(" and ")}`, "Cook until tender", "Season to taste", "Serve and enjoy 🍽️"];
  }

  function createMealFromPantry(customTitle = "") {
    if (!pantry.length) return;
    const names = pantry.map(i => typeof i === "object" ? i.name : i);
    const title = customTitle.trim() || `Pantry Meal: ${names.slice(0, 2).join(" & ")}`;
    setRecipes(prev => [{ id: crypto.randomUUID(), title, ingredients: names, steps: generateSteps(pantry), generated: true }, ...prev]);
    consumePantryIngredients(pantry);
    setTab("recipes");
  }

  function getSuggestedRecipes() {
    if (!pantry.length) return [];
    return recipes.map(recipe => {
      const matches = (recipe.ingredients || []).filter(i => pantry.map(normalize).includes(normalize(i))).length;
      const percent = recipe.ingredients?.length ? Math.round((matches / recipe.ingredients.length) * 100) : 0;
      return { ...recipe, matches, percent };
    }).sort((a, b) => b.percent - a.percent);
  }

  return (
    <div style={{ paddingBottom: 90 }}>
      <div style={{ maxWidth: 420, margin: "0 auto", padding: 16 }}>
        <h1>🍳 Che AF</h1>
        <p>Cook Like You Know</p>

        {tab === "recipes" && (
          <>
            <button type="button" onClick={() => setShowNewRecipe(true)}>➕ New Recipe</button>
            <button type="button" onClick={cookBestPantryRecipe}>🍳 Cook Best Pantry Recipe</button>
            <button type="button" onClick={generateRecipeFromPantry}>🤖 Generate Recipe From Pantry</button>
            <RecipeList recipes={recipes} favorites={favorites} pantry={pantry}
              onUpdateFavorites={setFavorites} onAddIngredients={addToShoppingList}
              onDeleteRecipe={id => setRecipes(prev => prev.filter(r => r.id !== id))}
              onCookRecipe={cookRecipe} />
          </>
        )}

        {tab === "favorites" && (
          <Favorites recipes={recipes} favorites={favorites} pantry={pantry}
            onUpdateFavorites={setFavorites} onAddIngredients={addToShoppingList}
            onCookRecipe={cookRecipe}
            onDeleteRecipe={id => setRecipes(prev => prev.filter(r => r.id !== id))} />
        )}

        {tab === "pantry" && (
          <Pantry pantry={pantry} setPantry={setPantry}
            suggestedRecipes={getSuggestedRecipes()}
            onCreateMeal={createMealFromPantry}
            onAddToShoppingList={addToShoppingList}
            onGenerateAIRecipe={generateRecipeFromPantry} />
        )}

        {tab === "shopping" && (
          <ShoppingList items={shoppingList} setItems={setShoppingList} />
        )}
      </div>

      <CookingMode recipe={cookingRecipe} stepIndex={stepIndex} setStepIndex={setStepIndex}
        checkedIngredients={checkedIngredients} setCheckedIngredients={setCheckedIngredients}
        pantry={pantry} onExit={() => setCookingRecipe(null)} />

      {showNewRecipe && (
        <NewRecipeModal onClose={() => setShowNewRecipe(false)} onSave={handleSaveNewRecipe} />
      )}

      <BottomNav tab={tab} setTab={setTab} />
    </div>
  );
}
