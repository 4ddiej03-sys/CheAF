import { useEffect, useState } from "react";
import { speak, stopSpeaking } from "../utils/voice";
import { findSubstitutionsAI } from "../utils/substitute";

export default function CookingMode({ recipe, stepIndex, setStepIndex, checkedIngredients, setCheckedIngredients, pantry, onExit }) {
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [subs, setSubs] = useState({});
  const [subsLoading, setSubsLoading] = useState(false);

  useEffect(() => {
    async function loadSubs() {
      if (!recipe?.ingredients?.length) return;
      setSubsLoading(true);
      try {
        const data = await findSubstitutionsAI(recipe.ingredients, pantry);
        setSubs(data?.missing || {});
      } catch { setSubs({}); }
      finally { setSubsLoading(false); }
    }
    loadSubs();
  }, [recipe, pantry]);

  useEffect(() => {
    if (autoSpeak && recipe?.steps?.[stepIndex]) {
      setIsSpeaking(true);
      speak(recipe.steps[stepIndex], { onEnd: () => setIsSpeaking(false) });
    }
  }, [stepIndex, recipe, autoSpeak]);

  if (!recipe) return null;

  const steps = recipe.steps || [];
  const ingredients = recipe.ingredients || [];
  const step = steps[stepIndex] || "No steps found.";
  const progress = Math.round(((stepIndex + 1) / (steps.length || 1)) * 100);
  const pantryLower = (pantry || []).map(p => typeof p === "object" ? (p.name || "").toLowerCase() : p.toLowerCase());

  return (
    <div style={{ position: "fixed", inset: 0, background: "#111", color: "white", padding: "16px 16px 100px", zIndex: 9999, overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontSize: 17 }}>🍳 {recipe.title}</h2>
        <button type="button" onClick={() => { stopSpeaking(); onExit(); }} style={{ background: "#333", border: "none", color: "#fff", padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>✕ Exit</button>
      </div>
      <div style={{ height: 5, background: "#333", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${progress}%`, background: "#c4622d", borderRadius: 3, transition: "width 0.4s" }} />
      </div>
      <p style={{ fontSize: 12, color: "#888", margin: "6px 0 14px" }}>Step {stepIndex + 1} of {steps.length} — {progress}%</p>
      <div style={{ fontSize: 19, lineHeight: 1.65, background: "#1e1e1e", borderRadius: 12, padding: 16, borderLeft: "4px solid #c4622d" }}>
        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, background: "#c4622d", borderRadius: "50%", fontSize: 14, fontWeight: 700, marginRight: 10, verticalAlign: "middle" }}>{stepIndex + 1}</span>
        {step}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14 }}>
        <button type="button" onClick={() => { if (isSpeaking) { stopSpeaking(); setIsSpeaking(false); } else { setIsSpeaking(true); speak(step, { onEnd: () => setIsSpeaking(false) }); } }}
          style={{ padding: "8px 14px", borderRadius: 8, border: "none", background: isSpeaking ? "#2a2a2a" : "#c4622d", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
          {isSpeaking ? "⏹ Stop" : "🔊 Read Step"}
        </button>
        <label style={{ color: "#ccc", fontSize: 13, display: "flex", alignItems: "center", gap: 5 }}>
          <input type="checkbox" checked={autoSpeak} onChange={() => setAutoSpeak(v => !v)} />
          Auto-read
        </label>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button type="button" disabled={stepIndex === 0} onClick={() => { stopSpeaking(); setStepIndex(s => s - 1); }}
          style={{ flex: 1, padding: 11, borderRadius: 10, border: "none", background: "#2a2a2a", color: "#fff", fontWeight: 600, cursor: stepIndex === 0 ? "not-allowed" : "pointer", opacity: stepIndex === 0 ? 0.4 : 1, fontSize: 14 }}>⬅ Prev</button>
        <button type="button" disabled={stepIndex >= steps.length - 1} onClick={() => { stopSpeaking(); setStepIndex(s => s + 1); }}
          style={{ flex: 1, padding: 11, borderRadius: 10, border: "none", background: stepIndex >= steps.length - 1 ? "#2d6a4f" : "#c4622d", color: "#fff", fontWeight: 600, cursor: stepIndex >= steps.length - 1 ? "not-allowed" : "pointer", opacity: stepIndex >= steps.length - 1 ? 0.6 : 1, fontSize: 14 }}>
          {stepIndex >= steps.length - 1 ? "✅ Done!" : "Next ➡"}
        </button>
      </div>
      <h3 style={{ marginTop: 20, marginBottom: 8, fontSize: 15 }}>🥬 Ingredients</h3>
      <div style={{ background: "#1a1a1a", borderRadius: 10, padding: 10 }}>
        {ingredients.map((ing, i) => {
          const have = pantryLower.includes(ing.toLowerCase().trim());
          const isChecked = checkedIngredients.includes(ing);
          return (
            <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer" }}>
              <input type="checkbox" checked={isChecked} onChange={() => setCheckedIngredients(prev => prev.includes(ing) ? prev.filter(x => x !== ing) : [...prev, ing])} />
              <span style={{ fontSize: 14, textDecoration: isChecked ? "line-through" : "none", color: isChecked ? "#555" : have ? "#7ec8a0" : "#fff" }}>
                {ing}{have && !isChecked ? " ✓" : ""}
              </span>
            </label>
          );
        })}
      </div>
      {subsLoading && <p style={{ color: "#aaa", fontSize: 13, marginTop: 12 }}>🔄 Finding substitutions…</p>}
      {!subsLoading && Object.keys(subs).length > 0 && (
        <div style={{ marginTop: 16, background: "#1e1e1e", padding: 14, borderRadius: 12, border: "1px solid #333" }}>
          <h3 style={{ marginTop: 0, fontSize: 15 }}>🔁 AI Substitutions</h3>
          {Object.entries(subs).map(([missing, options]) => (
            <div key={missing} style={{ marginBottom: 12 }}>
              <p style={{ color: "#f87171", fontSize: 14, marginBottom: 4 }}>❌ Missing: <strong>{missing}</strong></p>
              {(options || []).map((o, i) => (
                <p key={i} style={{ fontSize: 13, marginLeft: 12, marginBottom: 2 }}>✅ <strong>{o.item}</strong>{o.note && <span style={{ color: "#aaa" }}> — {o.note}</span>}</p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
