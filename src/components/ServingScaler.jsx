// components/ServingScaler.jsx
// Compact serving size control — drop into any recipe card or cooking mode

export default function ServingScaler({ servings, onChange, min = 1, max = 20 }) {
  if (!servings) return null;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 12, color: "#718096", fontWeight: 600 }}>Serves</span>
      <div style={{ display: "flex", alignItems: "center", gap: 0, background: "#f7fafc", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, servings - 1))}
          disabled={servings <= min}
          aria-label="Reduce servings"
          style={{ width: 30, height: 30, border: "none", background: "transparent", cursor: servings <= min ? "not-allowed" : "pointer", fontSize: 16, color: servings <= min ? "#cbd5e0" : "#c4622d", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
          −
        </button>
        <span style={{ minWidth: 24, textAlign: "center", fontSize: 14, fontWeight: 700, color: "#1a202c" }}>
          {servings}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, servings + 1))}
          disabled={servings >= max}
          aria-label="Increase servings"
          style={{ width: 30, height: 30, border: "none", background: "transparent", cursor: servings >= max ? "not-allowed" : "pointer", fontSize: 16, color: servings >= max ? "#cbd5e0" : "#c4622d", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
          +
        </button>
      </div>
    </div>
  );
}
