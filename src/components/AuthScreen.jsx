import { useState } from "react";
import { signIn, signUp } from "../utils/supabase";

export default function AuthScreen({ onAuth }) {
  const [mode, setMode]         = useState("signin");
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
    <div style={{ minHeight: "100vh", background: "#000", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <img src="/icon-512.png" alt="Che AF" style={{ width: 120, height: 120, borderRadius: 24, marginBottom: 12 }} />
          <p style={{ margin: 0, fontSize: 14, color: "#718096" }}>Cook Like You Know</p>
        </div>

        {/* Card */}
        <div style={{ background: "#1a1a1a", borderRadius: 20, padding: 28, boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>

          {/* Toggle */}
          <div style={{ display: "flex", background: "#111", borderRadius: 12, padding: 4, marginBottom: 24 }}>
            {["signin","signup"].map(m => (
              <button key={m} type="button" onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                style={{ flex: 1, padding: "10px 0", borderRadius: 10, border: "none", background: mode === m ? "#c4622d" : "transparent", fontWeight: mode === m ? 700 : 500, fontSize: 14, cursor: "pointer", color: mode === m ? "#fff" : "#718096", transition: "all 0.2s" }}>
                {m === "signin" ? "Sign In" : "Create Account"}
              </button>
            ))}
          </div>

          {/* Fields */}
          <div style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 13, color: "#a0aec0", fontWeight: 600, display: "block", marginBottom: 6 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #333", fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit", background: "#111", color: "#fff" }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, color: "#a0aec0", fontWeight: 600, display: "block", marginBottom: 6 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              onKeyDown={e => e.key === "Enter" && !loading && handleSubmit()}
              style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #333", fontSize: 14, boxSizing: "border-box", outline: "none", fontFamily: "inherit", background: "#111", color: "#fff" }} />
          </div>

          {error   && <div style={{ background: "#2d0000", border: "1px solid #c53030", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}><p style={{ color: "#fc8181", fontSize: 13, margin: 0 }}>⚠️ {error}</p></div>}
          {success && <div style={{ background: "#002d0f", border: "1px solid #276749", borderRadius: 10, padding: "10px 14px", marginBottom: 14 }}><p style={{ color: "#9ae6b4", fontSize: 13, margin: 0 }}>{success}</p></div>}

          {mode === "signup" && (
  <p style={{ fontSize: 11, color: "#a0aec0", textAlign: "center", marginBottom: 8 }}>
    By signing up you agree to our{" "}
    <a href="#" onClick={e => { e.preventDefault(); window.dispatchEvent(new CustomEvent("showTerms")); }}
      style={{ color: "#c4622d" }}>Terms of Service</a>{" "}and{" "}
    <a href="#" onClick={e => { e.preventDefault(); window.dispatchEvent(new CustomEvent("showPrivacy")); }}
      style={{ color: "#c4622d" }}>Privacy Policy</a>
  </p>
)}

          <button type="button" onClick={handleSubmit} disabled={loading}
            style={{ width: "100%", padding: 14, borderRadius: 12, border: "none", background: loading ? "#744210" : "#c4622d", color: "#fff", fontWeight: 700, fontSize: 16, cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Please wait…" : mode === "signin" ? "Sign In →" : "Create Account →"}
          </button>

          <p style={{ textAlign: "center", fontSize: 12, color: "#4a5568", marginTop: 20, marginBottom: 0 }}>
            Your recipes sync across all your devices ☁️
          </p>
        </div>
      </div>
    </div>
  );
}
