import { useState, useEffect, useCallback } from "react";
import { supabase, loadUserData, saveUserData, signOut, getUser } from "./utils/supabase";
import defaultRecipes from "./data/recipes.json";
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
import AuthScreen from "./components/AuthScreen";
import { generateAIRecipe } from "./utils/aiRecipe";
import { calcMatchPct, getMissingIngredients } from "./utils/pantryMatch";

export default function App() {
  const [user, setUser]                             = useState(null);
  const [authLoading, setAuthLoading]               = useState(true);
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
  const [syncing, setSyncing]                       = useState(false);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  // ── Auth listener ───────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Load data when user logs in ─────────────────────────────────
  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const data = await loadUserData(user.id);
        if (data) {
          setRecipes(data.recipes?.length ? data.recipes : defaultRecipes);
          setFavorites(data.favorites || []);
          setShoppingList(data.shopping_list || []);
          setPantry(data.pantry || []);
        } else {
          // First time user — load defaults
          setRecipes(defaultRecipes);
          setFavorites([]);
          setShoppingList([]);
          setPantry([]);
        }
      } catch (err) {
        console.error("Load error:", err);
        setRecipes(defaultRecipes);
      }
    }
    load();
  }, [user]);

  // ── Save to Supabase whenever data changes ──────────────────────
  const syncData = useCallback(async (newRecipes, newFavorites, newShopping, newPantry) => {
    if (!user) return;
    setSyncing(true);
    try {
      await saveUserData(user.id, {
        recipes: newRecipes,
        favorites: newFavorites,
        shopping_list: newShopping,
        pantry: newPantry,
      });
    } catch (err) {
      console.error("Sync error:", err);
    }
    setSyncing(false);
  }, [user]);

  function updateRecipes(val)      { setRecipes(val);      syncData(val, favorites, shoppingList, pantry); }
  function updateFavorites(val)    { setFavorites(val);    syncData(recipes, val, shoppingList, pantry); }
  function updateShoppingList(val) { setShoppingList(val); syncData(recipes, favorites, val, pantry); }
  function updatePantry(val)       { setPantry(val);       syncData(recipes, favorites, shoppingList, val); }

  function addToShoppingList(items) {
    if (!Array.isArray(items)) return;
    const next = [...shoppingList];
    const existing = shoppingList.map(i => i.toLowerCase());
    items.forEach(item => {
      const name = typeof item === "object" ? item.name : item;
      if (name && !existing.includes(name.toLowerCase())) next.push(name);
    });
    updateShoppingList(next);
  }

  function handleSaveRecipe(recipe) {
    const next = recipes.find(r => r.id === recipe.id) ? recipes : [recipe, ...recipes];
    updateRecipes(next);
    setTab("recipes");
    showToast(`"${recipe.title}" saved! 🎉`);
  }

  function cookRecipe(recipe) {
    addToShoppingList(getMissingIngredients(recipe, pantry));
    const nextPantry = pantry.filter(p => {
      const pName = (typeof p === "object" ? p.name : p).toLowerCase();
      return !(recipe.ingredients || []).some(i =>
        i.toLowerCase().includes(pName) || pName.includes(i.toLowerCase().split(" ").pop())
      );
    });
    updatePantry(nextPantry);
    setCookingRecipe(recipe);
    setStepIndex(0);
    setCheckedIngredients([]);
  }

  function cookBestPantryRecipe() {
    if (!pantry.length || !recipes.length) { showToast("Add pantry items first 🫙"); return; }
    const best = recipes.map(r => ({ ...r, pct: calcMatchPct(r, pantry) })).sort((a, b) => b.pct - a.pct)[0];
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
      if (options.length === 1) { handleSaveRecipe(options[0]); }
      else { setAiOptions(options); }
    } catch (err) {
      console.error(err);
      showToast("AI failed — try again 🔑");
    }
    setAiLoading(false);
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
    handleSaveRecipe({ id: crypto.randomUUID(), title, ingredients: names, steps: generateSteps(pantry), generated: true });
  }

  function getSuggestedRecipes() {
    if (!pantry.length) return [];
    return recipes.map(r => ({ ...r, percent: calcMatchPct(r, pantry) })).sort((a, b) => b.percent - a.percent);
  }

  async function handleSignOut() {
    await signOut();
    setRecipes([]);
    setFavorites([]);
    setShoppingList([]);
    setPantry([]);
    setTab("recipes");
  }

  // ── Loading screen ───────────────────────────────────────────────
  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: "#faf6ef", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🍳</div>
        <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#c4622d", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  // ── Auth screen ──────────────────────────────────────────────────
  if (!user) return <AuthScreen onAuth={() => {}} />;

  // ── Main app ─────────────────────────────────────────────────────
  return (
    <div style={{ paddingBottom: 90, fontFamily: "system-ui, sans-serif", background: "#faf6ef", minHeight: "100vh" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 22 }}>🍳 Che AF</h1>
            <p style={{ margin: 0, fontSize: 12, color: "#718096" }}>
              {syncing ? "☁️ Syncing…" : `☁️ Synced · ${user.email.split("@")[0]}`}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {aiLoading && <span style={{ fontSize: 13, color: "#805ad5" }}>🤖 Thinking…</span>}
            <button type="button" onClick={handleSignOut}
              style={{ background: "#f7fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", color: "#718096", fontWeight: 600 }}>
              Sign out
            </button>
          </div>
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
              onUpdateFavorites={updateFavorites} onAddIngredients={addToShoppingList}
              onDeleteRecipe={id => updateRecipes(recipes.filter(r => r.id !== id))}
              onCookRecipe={cookRecipe} />
          </>
        )}

        {tab === "favorites" && (
          <Favorites recipes={recipes} favorites={favorites} pantry={pantry}
            onUpdateFavorites={updateFavorites} onAddIngredients={addToShoppingList}
            onCookRecipe={cookRecipe}
            onDeleteRecipe={id => updateRecipes(recipes.filter(r => r.id !== id))} />
        )}

        {tab === "pantry" && (
          <Pantry pantry={pantry} setPantry={updatePantry}
            suggestedRecipes={getSuggestedRecipes()}
            onCreateMeal={createMealFromPantry}
            onAddToShoppingList={addToShoppingList}
            onGenerateAIRecipe={generateRecipeFromPantry} />
        )}

        {tab === "shopping" && (
          <ShoppingList items={shoppingList} setItems={updateShoppingList} />
        )}
      </div>

      <CookingMode recipe={cookingRecipe} stepIndex={stepIndex} setStepIndex={setStepIndex}
        checkedIngredients={checkedIngredients} setCheckedIngredients={setCheckedIngredients}
        pantry={pantry} onExit={() => setCookingRecipe(null)} />

      {showNewRecipe  && <NewRecipeModal onClose={() => setShowNewRecipe(false)} onSave={r => { handleSaveRecipe(r); setShowNewRecipe(false); }} />}
      {showImport     && <ImportRecipeModal onClose={() => setShowImport(false)} onSave={r => { handleSaveRecipe(r); setShowImport(false); }} />}
      {showOnlineSearch && <OnlineRecipeSearch pantry={pantry} onSaveRecipe={handleSaveRecipe} onClose={() => setShowOnlineSearch(false)} />}
      {aiOptions      && <RecipePicker recipes={aiOptions} onPick={r => { setAiOptions(null); handleSaveRecipe(r); }} onClose={() => setAiOptions(null)} />}

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
