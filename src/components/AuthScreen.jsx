import { useState } from "react";
import { signIn, signUp } from "../utils/supabase";

export default function AuthScreen({ onAuth }) {
  const [mode, setMode]         = useState("signin"); // "signin" | "signup"
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");

  async function handleSubmit() {
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setLoading(true);
    try {
      if (mode === "signup") {
        await signUp(email, password);
        setSuccess("✅ Account created! Please check your email to confirm, then sign in.");
        setMode("signin");
      } else {
        await signIn(email, password);
        onAuth();
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#faf6ef", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#fff", borderRadius: 20, padding: 32, width: "100%", maxWidth: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.1)" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🍳</div>
          <h1 style={{ margin: 0, fontSize: 28, color: "#1a202c" }}>Che AF</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: "#718096" }}>Cook Like You Know</p>
        </div>

        {/* Toggle */}
        <div style={{ display: "flex", background: "#f7fafc", borderRadius: 12, padding: 4, marginBottom: 24 }}>
          {["signin","signup"].map(m => (
            <button key={m} type="button" onClick={() => { setMode(m); setError(""); setSuccess(""); }}
              style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: mode === m ? "#fff" : "transparent", fontWeight: mode === m ? 700 : 500, fontSize: 14, cursor: "pointer", color: mode === m ? "#1a202c" : "#718096", boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.1)" : "none", transition: "all 0.2s" }}>
              {m === "signin" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>

        {/* Fields */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13, color: "#4a5568", fontWeight: 600, display: "block", marginBottom: 6 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit" }} />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, color: "#4a5568", fontWeight: 600, display: "block", marginBottom: 6 }}>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Min. 6 characters"
            onKeyDown={e => e.key === "Enter" && !loading && handleSubmit()}
            style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit" }} />
        </div>

        {error && <div style={{ background: "#fff5f5", border: "1px solid #fed7d7", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}><p style={{ color: "#e53e3e", fontSize: 13, margin: 0 }}>⚠️ {error}</p></div>}
        {success && <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}><p style={{ color: "#276749", fontSize: 13, margin: 0 }}>{success}</p></div>}

        <button type="button" onClick={handleSubmit} disabled={loading}
          style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: loading ? "#90cdf4" : "#c4622d", color: "#fff", fontWeight: 700, fontSize: 16, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Please wait…" : mode === "signin" ? "Sign In →" : "Create Account →"}
        </button>

        <p style={{ textAlign: "center", fontSize: 12, color: "#a0aec0", marginTop: 20, marginBottom: 0 }}>
          Your recipes sync across all your devices 🔄
        </p>
      </div>
    </div>
  );
}
