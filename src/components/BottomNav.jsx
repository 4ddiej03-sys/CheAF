// components/BottomNav.jsx
export default function BottomNav({ tab, setTab }) {
  const tabs = [
    { id: "recipes",   icon: "🍽️",  label: "Recipes"  },
    { id: "pantry",    icon: "🥫",  label: "Pantry"   },
    { id: "favorites", icon: "❤️",  label: "Saved"    },
    { id: "shopping",  icon: "🛒",  label: "Shop"     },
    { id: "settings",  icon: "⚙️",  label: "Settings" },
  ];

  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      background: "#fff", borderTop: "1px solid #e2e8f0",
      display: "flex", zIndex: 100,
      paddingBottom: "env(safe-area-inset-bottom)",
    }}>
      {tabs.map(t => (
        <button key={t.id} type="button" onClick={() => setTab(t.id)}
          aria-label={t.label} aria-current={tab === t.id ? "page" : undefined}
          style={{
            flex: 1, padding: "10px 0 8px", border: "none", background: "none",
            cursor: "pointer", display: "flex", flexDirection: "column",
            alignItems: "center", gap: 2,
            color: tab === t.id ? "#c4622d" : "#a0aec0",
            transition: "color 0.15s",
          }}>
          <span style={{ fontSize: 20 }}>{t.icon}</span>
          <span style={{ fontSize: 10, fontWeight: tab === t.id ? 700 : 500 }}>{t.label}</span>
          {tab === t.id && (
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#c4622d", marginTop: 1 }} />
          )}
        </button>
      ))}
    </nav>
  );
}
