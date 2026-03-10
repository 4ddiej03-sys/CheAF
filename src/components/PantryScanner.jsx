// components/PantryScanner.jsx
import { useState, useRef } from "react";
import { scanIngredientsFromPhoto } from "../utils/scanPantry";

export default function PantryScanner({ onAddIngredients, onClose }) {
  const [loading, setLoading]   = useState(false);
  const [preview, setPreview]   = useState(null);
  const [results, setResults]   = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [error, setError]       = useState("");
  const fileInputRef            = useRef(null);
  const cameraInputRef          = useRef(null);

  async function handleImage(file) {
    if (!file) return;
    setError(""); setResults(null); setSelected(new Set());
    setPreview(URL.createObjectURL(file));
    setLoading(true);
    try {
      const result = await scanIngredientsFromPhoto(file);
      setResults(result);
      setSelected(new Set(result.ingredients));
    } catch (err) {
      setError(err.message || "Could not scan photo — try again.");
    }
    setLoading(false);
  }

  function toggleIngredient(ing) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(ing) ? next.delete(ing) : next.add(ing);
      return next;
    });
  }

  function handleAddSelected() {
    const items = [...selected];
    if (!items.length) return;
    onAddIngredients(items);
    onClose();
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 20, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", padding: 24, boxShadow: "0 16px 48px rgba(0,0,0,0.25)" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 18 }}>📸 Scan Fridge or Pantry</h3>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#718096" }}>AI identifies ingredients automatically</p>
          </div>
          <button type="button" onClick={onClose}
            style={{ background: "#f7fafc", border: "none", borderRadius: "50%", width: 34, height: 34, cursor: "pointer", fontSize: 16, flexShrink: 0 }}>✕</button>
        </div>

        {/* Step 1 — No photo yet */}
        {!preview && !loading && (
          <>
            <button type="button" onClick={() => cameraInputRef.current?.click()}
              style={{ width: "100%", padding: 18, borderRadius: 14, border: "none", background: "#c4622d", color: "#fff", fontWeight: 700, fontSize: 16, cursor: "pointer", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              📷 Take Photo
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()}
              style={{ width: "100%", padding: 16, borderRadius: 14, border: "2px dashed #e2e8f0", background: "#f7fafc", color: "#4a5568", fontWeight: 600, fontSize: 15, cursor: "pointer", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              🖼️ Upload from Library
            </button>
            <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: 12, padding: 14 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#276749", margin: "0 0 8px" }}>📋 Tips for best results:</p>
              <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: "#2f855a", lineHeight: 1.8 }}>
                <li>Open your fridge door wide and take the photo</li>
                <li>Make sure there's good lighting</li>
                <li>Include the whole shelf in one shot</li>
                <li>Works on pantry shelves and countertops too</li>
              </ul>
            </div>
            <div style={{ background: "#ebf8ff", border: "1px solid #bee3f8", borderRadius: 12, padding: 14, marginTop: 10 }}>
              <p style={{ fontSize: 13, color: "#2b6cb0", margin: 0 }}>
                ♿ <strong>For blind users:</strong> Use your phone's built-in camera. The AI will read all ingredients aloud if you have VoiceOver (iPhone) or TalkBack (Android) enabled.
              </p>
            </div>
          </>
        )}

        {/* Step 2 — Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            {preview && <img src={preview} alt="Scanning" style={{ width: "100%", height: 200, objectFit: "cover", borderRadius: 12, marginBottom: 16 }} />}
            <div style={{ width: 44, height: 44, border: "4px solid #e2e8f0", borderTopColor: "#c4622d", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
            <p style={{ fontSize: 15, fontWeight: 600, color: "#1a202c", margin: "0 0 6px" }}>🤖 Scanning your fridge…</p>
            <p style={{ fontSize: 13, color: "#718096", margin: 0 }}>AI is identifying all ingredients</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 12, padding: 14, marginBottom: 14 }}>
            <p style={{ color: "#e53e3e", fontSize: 13, margin: "0 0 10px", fontWeight: 600 }}>⚠️ {error}</p>
            <button type="button" onClick={() => { setPreview(null); setError(""); }}
              style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: "#e53e3e", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>
              Try Again
            </button>
          </div>
        )}

        {/* Step 3 — Results */}
        {results && !loading && (
          <>
            {preview && <img src={preview} alt="Scanned" style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 12, marginBottom: 14 }} />}
            {results.notes && (
              <div style={{ background: "#f7fafc", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
                <p style={{ fontSize: 13, color: "#4a5568", margin: 0 }}>👁️ <em>{results.notes}</em></p>
              </div>
            )}
            {results.ingredients.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <p style={{ fontSize: 32, margin: "0 0 8px" }}>🤔</p>
                <p style={{ fontSize: 14, color: "#718096" }}>No ingredients found — try a clearer photo with better lighting.</p>
                <button type="button" onClick={() => { setPreview(null); setResults(null); }}
                  style={{ marginTop: 12, padding: "10px 20px", borderRadius: 10, border: "none", background: "#c4622d", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
                  Try Again
                </button>
              </div>
            ) : (
              <>
                <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: 12, padding: "12px 14px", marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 24 }}>✅</span>
                  <div>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#276749" }}>Found {results.ingredients.length} ingredients!</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#2f855a" }}>Tap to deselect any you don't want to add.</p>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                  {results.ingredients.map(ing => {
                    const isSelected = selected.has(ing);
                    return (
                      <button key={ing} type="button" onClick={() => toggleIngredient(ing)}
                        style={{ padding: "8px 14px", borderRadius: 50, cursor: "pointer", background: isSelected ? "#c4622d" : "#f7fafc", color: isSelected ? "#fff" : "#4a5568", fontWeight: isSelected ? 600 : 500, fontSize: 13, border: isSelected ? "none" : "1px solid #e2e8f0", transition: "all 0.15s" }}>
                        {isSelected ? "✓ " : ""}{ing}
                      </button>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="button" onClick={handleAddSelected} disabled={selected.size === 0}
                    style={{ flex: 2, padding: 14, borderRadius: 12, border: "none", background: selected.size === 0 ? "#e2e8f0" : "#38a169", color: selected.size === 0 ? "#a0aec0" : "#fff", fontWeight: 700, fontSize: 15, cursor: selected.size === 0 ? "not-allowed" : "pointer" }}>
                    ✅ Add {selected.size} to Pantry
                  </button>
                  <button type="button" onClick={() => { setPreview(null); setResults(null); setSelected(new Set()); }}
                    style={{ flex: 1, padding: 14, borderRadius: 12, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                    📸 Rescan
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* Hidden file inputs */}
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment"
          onChange={e => handleImage(e.target.files?.[0])} style={{ display: "none" }} />
        <input ref={fileInputRef} type="file" accept="image/*"
          onChange={e => handleImage(e.target.files?.[0])} style={{ display: "none" }} />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
