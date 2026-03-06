import { useState } from "react";

export default function ShoppingList({ items = [], setItems }) {
  const safeItems = Array.isArray(items) ? items : [];
  const [checked, setChecked] = useState(new Set());

  function toggleCheck(item) { setChecked(prev => { const n = new Set(prev); n.has(item) ? n.delete(item) : n.add(item); return n; }); }
  function removeItem(index) { const item = safeItems[index]; setItems(prev => prev.filter((_, i) => i !== index)); setChecked(prev => { const n = new Set(prev); n.delete(item); return n; }); }
  function clearChecked() { setItems(prev => prev.filter(i => !checked.has(i))); setChecked(new Set()); }
  function clearAll() { setItems([]); setChecked(new Set()); }

  const checkedCount = checked.size;

  if (!safeItems.length) return (
    <div>
      <h2>🛒 Shopping List</h2>
      <div style={{ textAlign: "center", padding: "40px 20px", background: "#f7fafc", borderRadius: 16, marginTop: 16, border: "1px dashed #cbd5e0" }}>
        <p style={{ fontSize: 36, margin: 0 }}>🛒</p>
        <p style={{ fontWeight: 600, fontSize: 16, margin: "8px 0 4px" }}>Your list is empty</p>
        <p style={{ color: "#718096", fontSize: 14, margin: 0 }}>Missing ingredients appear here automatically when you cook.</p>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>🛒 Shopping List</h2>
        <span style={{ fontSize: 12, color: "#718096" }}>{safeItems.length - checkedCount} left · {checkedCount} done</span>
      </div>
      <div style={{ height: 5, background: "#e2e8f0", borderRadius: 3, overflow: "hidden", marginTop: 10 }}>
        <div style={{ height: "100%", width: `${Math.round((checkedCount / safeItems.length) * 100)}%`, background: "#38a169", borderRadius: 3, transition: "width 0.4s" }} />
      </div>
      <ul style={{ listStyle: "none", padding: 0, marginTop: 12 }}>
        {safeItems.map((item, i) => {
          const isChecked = checked.has(item);
          return (
            <li key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 8px", borderBottom: "1px solid #e2e8f0", borderRadius: 6, background: isChecked ? "#f0fff4" : "#fff", transition: "background 0.2s" }}>
              <input type="checkbox" checked={isChecked} onChange={() => toggleCheck(item)} style={{ width: 18, height: 18, cursor: "pointer", accentColor: "#38a169" }} />
              <span style={{ flex: 1, fontSize: 14, textDecoration: isChecked ? "line-through" : "none", color: isChecked ? "#a0aec0" : "#2d3748" }}>{item}</span>
              <button type="button" onClick={() => removeItem(i)} style={{ background: "none", border: "none", color: "#cbd5e0", cursor: "pointer", fontSize: 14, padding: "2px 6px", borderRadius: 4 }}>✕</button>
            </li>
          );
        })}
      </ul>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        {checkedCount > 0 && <button type="button" onClick={clearChecked} style={{ flex: 1, padding: 10, borderRadius: 8, border: "none", background: "#c6f6d5", color: "#276749", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>✅ Remove bought ({checkedCount})</button>}
        <button type="button" onClick={clearAll} style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 13 }}>🧹 Clear all</button>
      </div>
    </div>
  );
}
