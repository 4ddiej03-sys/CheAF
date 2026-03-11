import { useState, useEffect, useCallback } from "react";
import { supabase, loadUserData, saveUserData, signOut } from "./utils/supabase";
import { useVoiceNavigation, speak } from "./utils/useVoiceNavigation";
import { useSubscription } from "./utils/useSubscription";
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
import SettingsScreen from "./components/SettingsScreen";
import VoiceButton from "./components/VoiceButton";
import Paywall from "./components/Paywall";
import MealPlanner from "./components/MealPlanner";
import { generateAIRecipe } from "./utils/aiRecipe";
import { calcMatchPct, getMissingIngredients } from "./utils/pantryMatch";

const DEFAULT_SETTINGS = {
  voiceEnabled: false,
  voiceCooking: false,
  largeText:    false,
  highContrast: false,
  darkMode:     false,
};

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
  const [showScanner, setShowScanner]               = useState(false);
  const [showPaywall, setShowPaywall]               = useState(false);
  const [showMealPlanner, setShowMealPlanner]       = useState(false);
  const [aiOptions, setAiOptions]                   = useState(null);
  const [aiLoading, setAiLoading]                   = useState(false);
  const [toast, setToast]                           = useState("");
  const [syncing, setSyncing]                       = useState(false);
  const [settings, setSettings]                     = useState(DEFAULT_SETTINGS);
  

  // ── Subscription ────────────────────────────────────────────────
  const { isPro, isFounder, isPioneer, memberNumber, canUseAI, callsLeft, incrementAiCalls } = useSubscription(user);

  function showToast(msg) { setToast(msg); setTimeout(() => setToast(""), 3000); }

  // ── Check for successful Stripe redirect ────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("subscribed") === "true") {
      showToast("🎉 Welcome to Pro! All features unlocked.");
      window.history.replaceState({}, "", "/");
    }
    if (params.get("cancelled") === "true") {
      showToast("No worries — you can upgrade anytime.");
      window.history.replaceState({}, "", "/");
    }
  }, []);

  // ── Apply accessibility settings ────────────────────────────────
  useEffect(() => {
    const root = document.documentElement;
    root.style.fontSize   = settings.largeText    ? "18px" : "16px";
    root.style.filter     = settings.highContrast ? "contrast(1.4)" : "";
    root.style.background = settings.darkMode     ? "#1a1a1a" : "";
  }, [settings]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cheaf_settings");
      if (saved) setSettings(JSON.parse(saved));
    } catch {}
  }, []);

  function updateSettings(next) {
    setSettings(next);
    try { localStorage.setItem("cheaf_settings", JSON.stringify(next)); } catch {}
  }

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

  // ── Load data ───────────────────────────────────────────────────
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
          setRecipes(defaultRecipes);
        }
      } catch (err) {
        console.error("Load error:", err);
        setRecipes(defaultRecipes);
      }
    }
    load();
  }, [user]);

  // ── Sync to Supabase ────────────────────────────────────────────
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
    } catch (err) { console.error("Sync error:", err); }
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
    if (settings.voiceCooking) speak(`Starting ${recipe.title}. Let's cook!`);
  }

  function cookBestPantryRecipe() {
    if (!pantry.length || !recipes.length) { showToast("Add pantry items first 🫙"); return; }
    const best = recipes.map(r => ({ ...r, pct: calcMatchPct(r, pantry) })).sort((a, b) => b.pct - a.pct)[0];
    if (!best || best.pct === 0) { showToast("No matches — try 🌐 Search Online!"); return; }
    showToast(`Best match: ${best.title} (${best.pct}% match) 🍳`);
    cookRecipe(best);
  }

  // ── AI Generate — checks subscription first ─────────────────────
  async function generateRecipeFromPantry() {
    if (!pantry.length) { showToast("Your pantry is empty 🫙"); return; }
    if (!canUseAI) { setShowPaywall(true); return; }
    setAiLoading(true);
    showToast("🤖 Generating 3 recipe options…");
    try {
      const options = await generateAIRecipe(pantry);
      await incrementAiCalls();
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
    setRecipes([]); setFavorites([]); setShoppingList([]); setPantry([]);
    setTab("recipes");
  }

  // ── Voice navigation ────────────────────────────────────────────
  const { startListening } = useVoiceNavigation({
    enabled: settings.voiceEnabled,
    onNavigate: (t) => { setTab(t); },
    onAddPantryItem: (name) => {
      updatePantry([...pantry, { name: name.toLowerCase().trim(), category: "Other" }]);
    },
    onScanFridge:     () => { setTab("pantry"); setShowScanner(true); },
    onGenerateRecipe: generateRecipeFromPantry,
    onSearchOnline:   () => setShowOnlineSearch(true),
    onCookBestMatch:  cookBestPantryRecipe,
    onImportURL:      () => setShowImport(true),
    recipes,
    onCookRecipe: cookRecipe,
  });

  const appBg    = settings.darkMode ? "#1a1a1a" : "#faf6ef";
  const appColor = settings.darkMode ? "#f0f0f0" : "#1a202c";

  // ── Loading ─────────────────────────────────────────────────────
  if (authLoading) return (
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <img src="/icon-192.png" alt="Che AF" style={{ width: 80, height: 80, borderRadius: 16, marginBottom: 16 }} />
        <div style={{ width: 36, height: 36, border: "3px solid #333", borderTopColor: "#c4622d", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );

  if (!user) return <AuthScreen onAuth={() => {}} />;

  return (
    <div style={{ paddingBottom: 90, fontFamily: "system-ui, sans-serif", background: appBg, color: appColor, minHeight: "100vh" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: 16 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <img src="/icon-192.png" alt="Che AF" style={{ width: 36, height: 36, borderRadius: 8 }} />
            <div>
              <h1 style={{ margin: 0, fontSize: 22, color: appColor }}>Che AF</h1>
              <p style={{ margin: 0, fontSize: 12, color: "#718096" }}>
                {syncing ? "☁️ Syncing…" : `Cook Like You Know · ☁️ ${user.email.split("@")[0]}`}
              </p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {aiLoading && <span style={{ fontSize: 13, color: "#805ad5" }}>🤖 Thinking…</span>}
            {/* Pro / Founder badge */}
            {isFounder && <span style={{ fontSize: 11, background: "#000", color: "#c4622d", padding: "3px 8px", borderRadius: 50, fontWeight: 700 }}>👑 Founder</span>}
            {isPioneer && <span style={{ fontSize: 11, background: "#744210", color: "#fefcbf", padding: "3px 8px", borderRadius: 50, fontWeight: 700 }}>🌟 Pioneer #{memberNumber}</span>}
            {isPro && !isFounder && !isPioneer && <span style={{ fontSize: 11, background: "#c4622d", color: "#fff", padding: "3px 8px", borderRadius: 50, fontWeight: 700 }}>⭐ Pro</span>}
            {!isPro && !isFounder && !isPioneer && (
              <button type="button" onClick={() => setShowPaywall(true)}
                style={{ fontSize: 11, background: "#f7fafc", border: "1px solid #e2e8f0", color: "#718096", padding: "4px 10px", borderRadius: 50, cursor: "pointer", fontWeight: 600 }}>
                {callsLeft} AI left · Upgrade
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        {tab === "recipes" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              <button type="button" onClick={() => setShowNewRecipe(true)} style={btn("#3182ce")}>➕ New</button>
              <button type="button" onClick={() => setShowImport(true)} style={btn("#2c7a7b")}>🔗 Import</button>
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <button type="button" onClick={generateRecipeFromPantry} disabled={aiLoading} style={btn(aiLoading ? "#9f7aea" : "#6b46c1")}>🤖 AI</button>
              <button type="button" onClick={cookBestPantryRecipe} style={btn("#c4622d")}>🍳 Best Match</button>
              <button type="button" onClick={() => setShowOnlineSearch(true)} style={btn("#38a169")}>🌐 Online</button>
              <button type="button" onClick={() => setShowMealPlanner(true)} style={btn("#e67e22")}>📅 Plan</button>
            </div>
            <RecipeList recipes={recipes} pantry={pantry} favorites={favorites}
              userId={user?.id}
              onUpdateFavorites={updateFavorites} onAddIngredients={addToShoppingList}
              onDeleteRecipe={id => updateRecipes(recipes.filter(r => r.id !== id))}
              onCookRecipe={cookRecipe}
              onUpdateRecipe={r => updateRecipes(recipes.map(x => x.id === r.id ? r : x))} />
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
            onGenerateAIRecipe={generateRecipeFromPantry}
            externalShowScanner={showScanner}
            onScannerClose={() => setShowScanner(false)} />
        )}

        {tab === "shopping" && (
          <ShoppingList items={shoppingList} setItems={updateShoppingList} />
        )}

        {tab === "settings" && (
          <SettingsScreen
            user={user}
            settings={settings}
            onUpdateSettings={updateSettings}
            onSignOut={handleSignOut}
            isPro={isPro}
            isFounder={isFounder}
            onUpgrade={() => setShowPaywall(true)} />
        )}
      </div>

      <CookingMode recipe={cookingRecipe} stepIndex={stepIndex} setStepIndex={setStepIndex}
        checkedIngredients={checkedIngredients} setCheckedIngredients={setCheckedIngredients}
        pantry={pantry} onExit={() => setCookingRecipe(null)}
        voiceCooking={settings.voiceCooking} />

      {showNewRecipe    && <NewRecipeModal onClose={() => setShowNewRecipe(false)} onSave={r => { handleSaveRecipe(r); setShowNewRecipe(false); }} />}
      {showImport       && <ImportRecipeModal onClose={() => setShowImport(false)} onSave={r => { handleSaveRecipe(r); setShowImport(false); }} />}
      {showOnlineSearch && <OnlineRecipeSearch pantry={pantry} onSaveRecipe={handleSaveRecipe} onClose={() => setShowOnlineSearch(false)} />}
      {aiOptions        && <RecipePicker recipes={aiOptions} onPick={r => { setAiOptions(null); handleSaveRecipe(r); }} onClose={() => setAiOptions(null)} />}
      {showMealPlanner  && <MealPlanner recipes={recipes} pantry={pantry} onAddToShoppingList={addToShoppingList} onClose={() => setShowMealPlanner(false)} />}
      {showPaywall      && <Paywall user={user} onClose={() => setShowPaywall(false)} onSuccess={() => { setShowPaywall(false); showToast("🎉 Welcome to Pro!"); }} />}

      <BottomNav tab={tab} setTab={setTab} />
      <VoiceButton enabled={settings.voiceEnabled} onPress={startListening} />

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
