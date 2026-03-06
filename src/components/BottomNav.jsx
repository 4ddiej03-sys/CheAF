export default function BottomNav({ tab, setTab }) {
  const tabs = [
    { id: "recipes",   label: "Recipes",   icon: "🍽️" },
    { id: "favorites", label: "Favorites", icon: "❤️" },
    { id: "pantry",    label: "Pantry",    icon: "🥫" },
    { id: "shopping",  label: "List",      icon: "🛒" },
  ];
  return (
    <nav role="navigation" aria-label="Main navigation" style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
      background: "#ffffff", borderTop: "1px solid #e2e8f0",
      display: "flex", justifyContent: "space-around", alignItems: "center",
      zIndex: 1000, boxShadow: "0 -2px 12px rgba(0,0,0,0.06)",
    }}>
      {tabs.map(t => {
        const isActive = tab === t.id;
        return (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            aria-current={isActive ? "page" : undefined} aria-label={t.label}
            style={{
              background: "none", border: "none", cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", padding: "10px 16px", minHeight: 60,
              color: isActive ? "#3182ce" : "#718096",
              WebkitTapHighlightColor: "transparent",
              position: "relative", transition: "color 0.15s",
            }}>
            <span aria-hidden="true" style={{ fontSize: 22, lineHeight: 1, transform: isActive ? "scale(1.15)" : "scale(1)", transition: "transform 0.15s", display: "block" }}>{t.icon}</span>
            <span style={{ fontSize: 11, fontWeight: isActive ? 700 : 500, marginTop: 3 }}>{t.label}</span>
            {isActive && <span aria-hidden="true" style={{ position: "absolute", top: 6, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "#3182ce" }} />}
          </button>
        );
      })}
    </nav>
  );
}
