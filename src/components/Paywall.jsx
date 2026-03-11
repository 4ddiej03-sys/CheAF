// components/Paywall.jsx
import { useState } from "react";

const FEATURES = [
  { icon: "🤖", text: "Unlimited AI recipe generation" },
  { icon: "📸", text: "Fridge & pantry photo scan" },
  { icon: "🔗", text: "Import recipes from any URL" },
  { icon: "📅", text: "Weekly meal planner" },
  { icon: "☁️", text: "Cloud sync across all devices" },
  { icon: "🔍", text: "Find similar recipes with AI" },
  { icon: "🎤", text: "Voice navigation" },
];

export default function Paywall({ user, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  async function handleUpgrade() {
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/stripe-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, email: user.email }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Could not start checkout.");
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: "#fff", borderRadius: 24, width: "100%", maxWidth: 420, padding: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.3)" }}>

        {/* Logo + heading */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <img src="/icon-192.png" alt="Che AF" style={{ width: 64, height: 64, borderRadius: 14, marginBottom: 10 }} />
          <h2 style={{ margin: 0, fontSize: 22 }}>Upgrade to Pro</h2>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#718096" }}>Cook Like You Know — unlocked</p>
        </div>

        {/* Price */}
        <div style={{ background: "#000", borderRadius: 16, padding: "16px 20px", marginBottom: 20, textAlign: "center" }}>
          <span style={{ fontSize: 36, fontWeight: 800, color: "#fff" }}>$2.99</span>
          <span style={{ fontSize: 14, color: "#a0aec0", marginLeft: 6 }}>NZD / month</span>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: "#718096" }}>Cancel anytime · No lock-in</p>
        </div>

        {/* Features */}
        <div style={{ marginBottom: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 20, minWidth: 28 }}>{f.icon}</span>
              <span style={{ fontSize: 14, color: "#2d3748" }}>{f.text}</span>
            </div>
          ))}
        </div>

        {error && (
          <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}>
            <p style={{ color: "#e53e3e", fontSize: 13, margin: 0 }}>⚠️ {error}</p>
          </div>
        )}

        {/* CTA */}
        <button type="button" onClick={handleUpgrade} disabled={loading}
          style={{ width: "100%", padding: 16, borderRadius: 14, border: "none", background: loading ? "#718096" : "#c4622d", color: "#fff", fontWeight: 800, fontSize: 17, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 16px rgba(196,98,45,0.4)", marginBottom: 10 }}>
          {loading ? "Redirecting to checkout…" : "🚀 Start Pro — $2.99/mo"}
        </button>

        <button type="button" onClick={onClose}
          style={{ width: "100%", padding: 12, borderRadius: 12, border: "none", background: "none", color: "#a0aec0", fontSize: 14, cursor: "pointer" }}>
          Maybe later
        </button>

        <p style={{ textAlign: "center", fontSize: 11, color: "#a0aec0", marginTop: 8 }}>
          🔒 Secured by Stripe · Cancel anytime in Settings
        </p>
      </div>
    </div>
  );
}
