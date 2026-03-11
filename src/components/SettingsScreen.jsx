// components/SettingsScreen.jsx
import { useState, useEffect } from "react";
import { speak } from "../utils/useVoiceNavigation";
import { signOut } from "../utils/supabase";

export default function SettingsScreen({ user, settings, onUpdateSettings, onSignOut }) {
  const [saved, setSaved] = useState(false);

  function update(key, value) {
    const next = { ...settings, [key]: value };
    onUpdateSettings(next);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    if (key === "voiceEnabled" && value) {
      speak("Voice navigation is now on. A microphone button has appeared at the bottom right of your screen. Tap it once to give a voice command. Say help to hear all available commands.");
    }
    if (key === "voiceEnabled" && !value) {
      speak("Voice navigation off.");
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 4 }}>⚙️ Settings</h2>
      <p style={{ fontSize: 12, color: "#718096", marginTop: 4, marginBottom: 20 }}>
        {user?.email}
      </p>

      {/* Accessibility section */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 18, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, color: "#4a5568" }}>♿ Accessibility</h3>

        {/* Voice Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ flex: 1, paddingRight: 16 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>🎤 Voice Navigation</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#718096" }}>
              Control the app with your voice. Say "help" for a list of commands.
            </p>
          </div>
          <Toggle value={settings.voiceEnabled} onChange={v => update("voiceEnabled", v)} />
        </div>

        {/* Voice commands reference */}
        {settings.voiceEnabled && (
          <div style={{ background: "#f7fafc", borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#4a5568", margin: "0 0 8px" }}>🎤 Voice Commands:</p>
            {[
              ["Navigate",  '"Go to pantry" / "Go to recipes" / "Shopping list" / "Favourites"'],
              ["Add item",  '"Add garlic to pantry" / "I have eggs"'],
              ["Scan",      '"Scan fridge" / "Open camera"'],
              ["Cook",      '"Cook carbonara" / "Best match" / "What can I make?"'],
              ["AI",        '"Generate recipe" / "Search online" / "Import URL"'],
              ["Help",      '"Help" / "What can I say?"'],
            ].map(([label, example]) => (
              <div key={label} style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#c4622d" }}>{label}: </span>
                <span style={{ fontSize: 11, color: "#4a5568" }}>{example}</span>
              </div>
            ))}
          </div>
        )}

        {/* Large Text */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ flex: 1, paddingRight: 16 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>🔠 Large Text</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#718096" }}>Increases text size throughout the app.</p>
          </div>
          <Toggle value={settings.largeText} onChange={v => update("largeText", v)} />
        </div>

        {/* High Contrast */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, paddingRight: 16 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>🌓 High Contrast</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#718096" }}>Stronger colours for better visibility.</p>
          </div>
          <Toggle value={settings.highContrast} onChange={v => update("highContrast", v)} />
        </div>
      </div>

      {/* App section */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 18, marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, color: "#4a5568" }}>🍳 App</h3>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ flex: 1, paddingRight: 16 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>🔊 Voice Cooking Mode</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#718096" }}>Read recipe steps aloud while cooking.</p>
          </div>
          <Toggle value={settings.voiceCooking} onChange={v => update("voiceCooking", v)} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, paddingRight: 16 }}>
            <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>🌙 Dark Mode</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#718096" }}>Easier on the eyes at night.</p>
          </div>
          <Toggle value={settings.darkMode} onChange={v => update("darkMode", v)} />
        </div>
      </div>

      {saved && (
        <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: 10, padding: "10px 14px", marginBottom: 14, textAlign: "center" }}>
          <p style={{ color: "#276749", fontSize: 13, margin: 0, fontWeight: 600 }}>✅ Settings saved!</p>
        </div>
      )}

      {/* Sign out */}
      <button type="button" onClick={onSignOut}
        style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #fed7d7", background: "#fff5f5", color: "#e53e3e", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 8 }}>
        🚪 Sign Out
      </button>

      <p style={{ textAlign: "center", fontSize: 11, color: "#a0aec0", marginTop: 20 }}>
        Che AF · Cook Like You Know
      </p>
    </div>
  );
}

function Toggle({ value, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      style={{ width: 50, height: 28, borderRadius: 50, border: "none", background: value ? "#c4622d" : "#e2e8f0", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}
      aria-checked={value} role="switch">
      <span style={{ position: "absolute", top: 3, left: value ? 24 : 3, width: 22, height: 22, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </button>
  );
}
