// components/MealPlanner.jsx
import { useState } from "react";
import { getMissingIngredients } from "../utils/pantryMatch";

const DAY_NAMES = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
const MEAL_TYPES = ["Breakfast","Lunch","Dinner","Snack"];
const COLORS = {
  Breakfast: { bg: "#fffff0", border: "#faf089", color: "#975a16" },
  Lunch:     { bg: "#e6fffa", border: "#81e6d9", color: "#234e52" },
  Dinner:    { bg: "#ebf8ff", border: "#90cdf4", color: "#2a4365" },
  Snack:     { bg: "#fff5f7", border: "#fed7e2", color: "#702459" },
};

function RecipePicker({ recipes, onPick, onClose }) {
  const [search, setSearch] = useState("");
  const filtered = recipes.filter(r => r.title.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 600, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div style={{ background: "#fff", borderRadius: "20px 20px 0 0", width: "100%", maxWidth: 480, maxHeight: "75vh", display: "flex", flexDirection: "column", padding: 20 }}>
        <div style={{ width: 40, height: 4, background: "#e2e8f0", borderRadius: 2, margin: "0 auto 16px" }} />
        <h3 style={{ margin: "0 0 12px", fontSize: 17 }}>Pick a Recipe</h3>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search recipes…" autoFocus
          style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, marginBottom: 12, outline: "none", fontFamily: "inherit" }} />
        <div style={{ overflowY: "auto", flex: 1 }}>
          {filtered.length === 0 && <p style={{ color: "#a0aec0", fontSize: 14, textAlign: "center", padding: 20 }}>No recipes found</p>}
          {filtered.map(r => (
            <button key={r.id} type="button" onClick={() => onPick(r)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", textAlign: "left", marginBottom: 8, fontFamily: "inherit" }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{r.title}</p>
              {r.cuisine && <p style={{ margin: "2px 0 0", fontSize: 12, color: "#718096" }}>{r.cuisine} · {r.cookTime || "?"}</p>}
            </button>
          ))}
        </div>
        <button type="button" onClick={onClose}
          style={{ marginTop: 12, padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function MealPlanner({ recipes = [], pantry = [], onAddToShoppingList, onClose }) {
  const [numDays, setNumDays]       = useState(7);
  const [mealSlots, setMealSlots]   = useState(["Breakfast", "Lunch", "Dinner"]);
  const [plan, setPlan]             = useState({});
  const [picking, setPicking]       = useState(null); // { day, meal }
  const [generated, setGenerated]   = useState(false);
  const [saved, setSaved]           = useState(false);

  const days = DAY_NAMES.slice(0, numDays);

  function toggleMealSlot(meal) {
    setMealSlots(prev =>
      prev.includes(meal) ? prev.filter(m => m !== meal) : [...prev, meal]
    );
  }

  function assignRecipe(recipe) {
    if (!picking) return;
    const key = `${picking.day}-${picking.meal}`;
    setPlan(prev => ({ ...prev, [key]: recipe }));
    setPicking(null);
  }

  function removeRecipe(day, meal) {
    const key = `${day}-${meal}`;
    setPlan(prev => { const next = { ...prev }; delete next[key]; return next; });
  }

  function autoFillPlan() {
    if (!recipes.length) return;
    const newPlan = {};
    days.forEach(day => {
      mealSlots.forEach(meal => {
        const key = `${day}-${meal}`;
        if (!plan[key]) {
          const random = recipes[Math.floor(Math.random() * recipes.length)];
          newPlan[key] = random;
        }
      });
    });
    setPlan(prev => ({ ...prev, ...newPlan }));
    setGenerated(true);
  }

  function generateShoppingList() {
    const allMissing = [];
    Object.values(plan).forEach(recipe => {
      if (!recipe) return;
      const missing = getMissingIngredients(recipe, pantry);
      missing.forEach(item => {
        if (!allMissing.includes(item)) allMissing.push(item);
      });
    });
    if (allMissing.length) {
      onAddToShoppingList(allMissing);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  const totalMeals    = days.length * mealSlots.length;
  const assignedMeals = Object.keys(plan).filter(k => {
    const [day, meal] = k.split("-");
    return days.includes(day) && mealSlots.includes(meal);
  }).length;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 480, maxHeight: "92vh", overflowY: "auto", padding: 20, boxShadow: "0 16px 48px rgba(0,0,0,0.25)" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18 }}>📅 Meal Planner</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#718096" }}>{assignedMeals} of {totalMeals} meals planned</p>
          </div>
          <button type="button" onClick={onClose}
            style={{ background: "#f7fafc", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        {/* Settings row */}
        <div style={{ background: "#f7fafc", borderRadius: 12, padding: 14, marginBottom: 16 }}>

          {/* Number of days */}
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#4a5568", margin: "0 0 8px" }}>📆 Number of days</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button type="button" onClick={() => setNumDays(d => Math.max(1, d - 1))}
                style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#c4622d" }}>−</button>
              <span style={{ fontSize: 18, fontWeight: 700, minWidth: 30, textAlign: "center" }}>{numDays}</span>
              <button type="button" onClick={() => setNumDays(d => Math.min(7, d + 1))}
                style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid #e2e8f0", background: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 700, color: "#c4622d" }}>+</button>
              <span style={{ fontSize: 12, color: "#718096" }}>{days[0]} → {days[days.length - 1]}</span>
            </div>
          </div>

          {/* Meal slots */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#4a5568", margin: "0 0 8px" }}>🍽️ Meal slots</p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {MEAL_TYPES.map(meal => {
                const active = mealSlots.includes(meal);
                const c = COLORS[meal];
                return (
                  <button key={meal} type="button" onClick={() => toggleMealSlot(meal)}
                    style={{ padding: "6px 12px", borderRadius: 50, border: `1px solid ${active ? c.border : "#e2e8f0"}`, background: active ? c.bg : "#fff", color: active ? c.color : "#a0aec0", fontWeight: active ? 600 : 500, fontSize: 13, cursor: "pointer" }}>
                    {active ? "✓ " : ""}{meal}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Auto-fill button */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button type="button" onClick={autoFillPlan}
            style={{ flex: 1, padding: 12, borderRadius: 10, border: "none", background: "#6b46c1", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
            🎲 Auto-fill Plan
          </button>
          <button type="button" onClick={() => setPlan({})}
            style={{ padding: 12, borderRadius: 10, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer", color: "#718096" }}>
            🗑 Clear
          </button>
        </div>

        {/* Day cards */}
        {days.map(day => (
          <div key={day} style={{ marginBottom: 14 }}>
            <h4 style={{ margin: "0 0 8px", fontSize: 14, color: "#4a5568", fontWeight: 700 }}>{day}</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {mealSlots.map(meal => {
                const key   = `${day}-${meal}`;
                const recipe = plan[key];
                const c      = COLORS[meal];
                return (
                  <div key={meal} style={{ display: "flex", alignItems: "center", gap: 8, background: recipe ? c.bg : "#f7fafc", border: `1px solid ${recipe ? c.border : "#e2e8f0"}`, borderRadius: 10, padding: "10px 12px" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: recipe ? c.color : "#a0aec0", minWidth: 62 }}>{meal}</span>
                    {recipe ? (
                      <>
                        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#1a202c" }}>{recipe.title}</span>
                        <button type="button" onClick={() => removeRecipe(day, meal)}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#a0aec0", padding: "0 4px" }}>✕</button>
                      </>
                    ) : (
                      <button type="button" onClick={() => setPicking({ day, meal })}
                        style={{ flex: 1, background: "none", border: "none", cursor: "pointer", textAlign: "left", fontSize: 13, color: "#a0aec0", padding: 0, fontFamily: "inherit" }}>
                        + Add recipe…
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Save buttons */}
        {assignedMeals > 0 && (
          <div style={{ marginTop: 8 }}>
            {saved && (
              <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: 10, padding: "10px 14px", marginBottom: 10, textAlign: "center" }}>
                <p style={{ color: "#276749", fontSize: 13, margin: 0, fontWeight: 600 }}>✅ Missing ingredients added to shopping list!</p>
              </div>
            )}
            <button type="button" onClick={generateShoppingList}
              style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: "#38a169", color: "#fff", fontWeight: 700, fontSize: 15, cursor: "pointer", boxShadow: "0 4px 12px rgba(56,161,105,0.3)" }}>
              🛒 Generate Shopping List
            </button>
            <p style={{ fontSize: 12, color: "#a0aec0", textAlign: "center", marginTop: 8 }}>
              Adds all missing ingredients to your shopping list
            </p>
          </div>
        )}
      </div>

      {picking && (
        <RecipePicker
          recipes={recipes}
          onPick={assignRecipe}
          onClose={() => setPicking(null)}
        />
      )}
    </div>
  );
}
