import { useState } from "react";
import { importRecipeFromURL } from "../utils/importRecipe";

const EXAMPLE_SITES = ["allrecipes.com","bbcgoodfood.com","foodnetwork.com","tasty.co","seriouseats.com","any food blog!"];

export default function ImportRecipeModal({ onClose, onSave }) {
  const [url, setUrl]         = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError]     = useState("");
  const [step, setStep]       = useState("input");

  async function handleFetch() {
    if (!url.trim()) { setError("Please paste a recipe URL."); return; }
    setError(""); setLoading(true);
    try {
      const recipe = await importRecipeFromURL(url.trim());
      setPreview(recipe); setStep("preview");
    } catch (err) {
      setError(err.message || "Unknown error.");
    }
    setLoading(false);
  }

  function handleSave() { onSave(preview); onClose(); }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 460, maxHeight: "88vh", overflowY: "auto", padding: 24, boxShadow: "0 16px 48px rgba(0,0,0,0.25)" }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18 }}>🔗 Import Recipe from URL</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#718096" }}>Works on any recipe website</p>
          </div>
          <button type="button" onClick={onClose} style={{ background: "#f7fafc", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 16 }}>✕</button>
        </div>

        {step === "input" && (
          <>
            <input type="url" placeholder="https://www.allrecipes.com/recipe/..."
              value={url} onChange={e => { setUrl(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && !loading && handleFetch()}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: `1.5px solid ${error ? "#fc8181" : "#e2e8f0"}`, fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit", marginBottom: 10 }}
              autoFocus />

            {error && (
              <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 10, padding: "12px 14px", marginBottom: 12 }}>
                <p style={{ color: "#e53e3e", fontSize: 13, margin: 0, fontWeight: 600 }}>⚠️ {error}</p>
              </div>
            )}

            <button type="button" onClick={handleFetch} disabled={loading}
              style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: loading ? "#90cdf4" : "#3182ce", color: "#fff", fontWeight: 700, fontSize: 15, cursor: loading ? "not-allowed" : "pointer", marginBottom: 16 }}>
              {loading ? "🤖 Generating recipe…" : "✨ Import Recipe"}
            </button>

            {loading && (
              <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
                <div style={{ width: 36, height: 36, border: "3px solid #e2e8f0", borderTopColor: "#3182ce", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
                <p style={{ fontSize: 13, color: "#718096", margin: 0 }}>AI is reading the URL and generating your recipe…</p>
              </div>
            )}

            {!loading && (
              <div style={{ background: "#f7fafc", borderRadius: 12, padding: 14 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#4a5568", margin: "0 0 8px" }}>✅ Works with:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {EXAMPLE_SITES.map(s => <span key={s} style={{ fontSize: 12, background: "#fff", border: "1px solid #e2e8f0", padding: "4px 10px", borderRadius: 50, color: "#4a5568" }}>{s}</span>)}
                </div>
              </div>
            )}
          </>
        )}

        {step === "preview" && preview && (
          <>
            <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: 12, padding: "12px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22 }}>✅</span>
              <div>
                <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#276749" }}>Recipe found!</p>
                <p style={{ margin: 0, fontSize: 12, color: "#2f855a" }}>Review and save to your collection.</p>
              </div>
            </div>

            <h4 style={{ margin: "0 0 8px", fontSize: 17 }}>{preview.title}</h4>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {preview.cookTime   && <span style={badge("#ebf8ff","#2b6cb0")}>⏱ {preview.cookTime}</span>}
              {preview.prepTime   && <span style={badge("#f0fff4","#276749")}>🔪 {preview.prepTime}</span>}
              {preview.servings   && <span style={badge("#fffff0","#975a16")}>🍽️ Serves {preview.servings}</span>}
              {preview.cuisine    && <span style={badge("#fff5f7","#97266d")}>🌍 {preview.cuisine}</span>}
              {preview.difficulty && <span style={badge("#faf5ff","#6b46c1")}>⭐ {preview.difficulty}</span>}
            </div>

            <div style={{ background: "#f7fafc", borderRadius: 12, padding: 14, marginBottom: 12 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#4a5568", margin: "0 0 8px" }}>🥬 Ingredients ({preview.ingredients.length})</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13 }}>
                {preview.ingredients.map((ing, i) => <li key={i} style={{ marginBottom: 4, color: "#2d3748" }}>{ing}</li>)}
              </ul>
            </div>

            <div style={{ background: "#f7fafc", borderRadius: 12, padding: 14, marginBottom: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#4a5568", margin: "0 0 8px" }}>👨‍🍳 Steps ({preview.steps.length})</p>
              {preview.steps.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                  <span style={{ minWidth: 22, height: 22, background: "#c4622d", color: "#fff", borderRadius: "50%", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                  <p style={{ fontSize: 13, margin: 0, color: "#4a5568", lineHeight: 1.5 }}>{s}</p>
                </div>
              ))}
            </div>

            {preview.sourceUrl && (
              <p style={{ fontSize: 12, color: "#a0aec0", textAlign: "center", marginBottom: 14 }}>
                Source: <a href={preview.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#3182ce" }}>{preview.sourceSite || new URL(preview.sourceUrl).hostname}</a>
              </p>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={handleSave}
                style={{ flex: 2, padding: 16, borderRadius: 12, border: "none", background: "#38a169", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", boxShadow: "0 4px 12px rgba(56,161,105,0.4)" }}>
                💾 Save to My Recipes
              </button>
              <button type="button" onClick={() => { setStep("input"); setPreview(null); setUrl(""); }}
                style={{ flex: 1, padding: 16, borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                ← Retry
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function badge(bg, color) {
  return { fontSize: 11, background: bg, color, padding: "3px 8px", borderRadius: 50, fontWeight: 600 };
}
