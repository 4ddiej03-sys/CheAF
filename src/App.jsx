import { useState, useEffect } from "react";
import recipesData from "./data/recipes.json";
import NewRecipeModal from "./components/NewRecipeModal";
import ImportRecipeModal from "./components/ImportRecipeModal";
import RecipeList from "./components/RecipeList";
import RecipePicker from "./components/RecipePicker";
import Favorites from "./components/Favorites";
import ShoppingList from "./components/ShoppingList";
import BottomNav from "./components/BottomNav";
import Pantry from "./components/Pantry";
import CookingMode from "./components/CookingMode";
import OnlineRecipeSearch from "./components/OnlineRecipeSearch";
import { generateAIRecipe } from "./utils/aiRecipe";
import { calcMatchPct, getMissingIngredients } from "./utils/pantryMatch";

const Storage = {
  get: (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set: (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch(e) { console.warn(e); } },
};

export default function App() {
  const [tab, setTab]                               = useState("recipes");
  const [recipes, setRecipes]                       = useState([]);
  const [favorites, setFavorites]                   = useState([]);
  const [shoppingList, setShoppingList]             = useState([]);
  const [pantry, setPantry]                         = useState([]);
  const [cookingRecipe, setCookingRecipe]           = useState(null);
  const [stepIndex, setStepIndex]                   = useState(0);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [showNewRecipe, setShowNewRecipe]           = useState(false);
  const [showImport, setShowImport]                 = useState(false);
  const [showOnlineSearch, setShowOnlineSearch]     = useState(false);
  const [aiOptions, setAiOptions]                   = useState(null);
  const [aiLoading, setAiLoading]                   = useState(false);
  const [toast, setToast]                           = useState("");

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  useEffect(() => {
    setRecipes(Storage.get("recipes")?.length ? Storage.get("recipes") : recipesData);
    setFavorites(Storage.get("favorites") || []);
    setShoppingList(Storage.get("shoppingList") || []);
    setPantry(Storage.get("pantry") || []);
  }, []);

  useEffect(() => Storage.set("recipes", recipes),           [recipes]);
  useEffect(() => Storage.set("favorites", favorites),       [favorites]);
  useEffect(() => Storage.set("shoppingList", shoppingList), [shoppingList]);
  useEffect(() => Storage.set("pantry", pantry),             [pantry]);

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

  function handleSaveRecipe(recipe) {
    setRecipes(prev => prev.find(r => r.id === recipe.id) ? prev : [recipe, ...prev]);
    setTab("recipes");
    showToast(`"${recipe.title}" saved! 🎉`);
  }

  function cookRecipe(recipe) {
    addToShoppingList(getMissingIngredients(recipe, pantry));
    setPantry(prev => prev.filter(p => {
      const pName = (typeof p === "object" ? p.name : p).toLowerCase();
      return !(recipe.ingredients || []).some(i =>
        i.toLowerCase().includes(pName) || pName.includes(i.toLowerCase().split(" ").pop())
      );
    }));
    setCookingRecipe(recipe);
    setStepIndex(0);
    setCheckedIngredients([]);
  }

  function cookBestPantryRecipe() {
    if (!pantry.length || !recipes.length) { showToast("Add pantry items first 🫙"); return; }
    const best = recipes
      .map(r => ({ ...r, pct: calcMatchPct(r, pantry) }))
      .sort((a, b) => b.pct - a.pct)[0];
    if (!best || best.pct === 0) { showToast("No matches — try 🌐 Search Online!"); return; }
    showToast(`Best match: ${best.title} (${best.pct}% match) 🍳`);
    cookRecipe(best);
  }

  async function generateRecipeFromPantry() {
    if (!pantry.length) { showToast("Your pantry is empty 🫙"); return; }
    setAiLoading(true);
    showToast("🤖 Generating 3 recipe options…");
    try {
      const options = await generateAIRecipe(pantry);
      if (options.length === 1) {
        // Only one option — save directly
        handleSaveRecipe(options[0]);
      } else {
        // Show picker
        setAiOptions(options);
      }
    } catch (err) {
      console.error(err);
      showToast("AI failed — check your API key 🔑");
    }
    setAiLoading(false);
  }

  function handlePickRecipe(recipe) {
    setAiOptions(null);
    handleSaveRecipe(recipe);
  }

  function getSuggestedRecipes() {
    if (!pantry.length) return [];
    return recipes
      .map(r => ({ ...r, percent: calcMatchPct(r, pantry) }))
      .sort((a, b) => b.percent - a.percent);
  }

  function generateSteps(ingredients) {
    const names = ingredients.map(i => typeof i === "object" ? i.name : i);
    return [
      `Prepare all ingredients: ${names.join(", ")}.`,
      "Heat a pan over medium-high heat with a splash of oil.",
      `Cook ${names[0]} for 2–3 minutes until golden.`,
      names.length > 1 ? `Add ${names.slice(1).join(", ")} and stir for 3–4 more minutes.` : "Continue cooking.",
      "Season with salt and pepper to taste.",
      "Serve hot and enjoy! 🍽️",
    ];
  }

  function createMealFromPantry(customTitle = "") {
    if (!pantry.length) return;
    const names = pantry.map(i => typeof i === "object" ? i.name : i);
    const title = customTitle.trim() || `Pantry Meal: ${names.slice(0, 2).join(" & ")}`;
    setRecipes(prev => [{ id: crypto.randomUUID(), title, ingredients: names, steps: generateSteps(pantry), generated: true }, ...prev]);
    setTab("recipes");
    showToast(`"${title}" created!`);
  }

  return (
    <div style={{ paddingBottom: 90, fontFamily: "system-ui, sans-serif", background: "#faf6ef", minHeight: "100vh" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22 }}>🍳 Che AF</h1>
            <p style={{ margin: 0, fontSize: 12, color: "#718096" }}>Cook Like You Know</p>
          </div>
          {aiLoading && <span style={{ fontSize: 13, color: "#805ad5" }}>🤖 Thinking…</span>}
        </div>

        {tab === "recipes" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button type="button" onClick={() => setShowNewRecipe(true)} style={btn("#3182ce")}>➕ New Recipe</button>
              <button type="button" onClick={() => setShowImport(true)} style={btn("#2c7a7b")}>🔗 Import URL</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button type="button" onClick={generateRecipeFromPantry} disabled={aiLoading} style={btn(aiLoading ? "#9f7aea" : "#6b46c1")}>🤖 AI Generate</button>
              <button type="button" onClick={cookBestPantryRecipe} style={btn("#c4622d")}>🍳 Best Match</button>
              <button type="button" onClick={() => setShowOnlineSearch(true)} style={btn("#38a169")}>🌐 Online</button>
            </div>
            <RecipeList recipes={recipes} pantry={pantry} favorites={favorites}
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

      {showNewRecipe && <NewRecipeModal onClose={() => setShowNewRecipe(false)} onSave={r => { handleSaveRecipe(r); setShowNewRecipe(false); }} />}
      {showImport    && <ImportRecipeModal onClose={() => setShowImport(false)} onSave={r => { handleSaveRecipe(r); setShowImport(false); }} />}
      {showOnlineSearch && <OnlineRecipeSearch pantry={pantry} onSaveRecipe={handleSaveRecipe} onClose={() => setShowOnlineSearch(false)} />}
      {aiOptions && <RecipePicker recipes={aiOptions} onPick={handlePickRecipe} onClose={() => setAiOptions(null)} />}

      <BottomNav tab={tab} setTab={setTab} />

      {toast && (
        <div style={{ position: "fixed", bottom: 80, left: "50%", transform: "translateX(-50%)", background: "#1a202c", color: "#fff", padding: "10px 20px", borderRadius: 50, fontSize: 13, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", zIndex: 9998 }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function btn(bg) {
  return { flex: 1, padding: "10px 8px", borderRadius: 10, border: "none", background: bg, color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 };
}
