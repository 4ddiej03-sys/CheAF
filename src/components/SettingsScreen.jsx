// components/SettingsScreen.jsx
import { useState } from "react";
import { speak } from "../utils/useVoiceNavigation";
import { LANGUAGES, useTranslation } from "../utils/translations";

export default function SettingsScreen({ user, settings, onUpdateSettings, onSignOut, isPro, isFounder, onUpgrade }) {
  const [saved, setSaved] = useState(false);
  const translate = useTranslation(settings.language || "en");

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

  const appBg      = settings.darkMode ? "#1a1a1a" : "#fff";
  const appColor   = settings.darkMode ? "#f0f0f0" : "#1a202c";
  const cardBg     = settings.darkMode ? "#2d2d2d" : "#fff";
  const mutedColor = settings.darkMode ? "#a0aec0" : "#718096";
  const borderColor = settings.darkMode ? "#444" : "#f0f0f0";

  const sectionStyle = {
    background: cardBg,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    boxShadow: settings.darkMode ? "none" : "0 1px 4px rgba(0,0,0,0.06)",
    border: settings.darkMode ? "1px solid #444" : "none",
  };

  return (
    <div style={{ color: appColor }}>
      <h2 style={{ marginBottom: 4 }}>⚙️ {translate("settingsTitle")}</h2>
      <p style={{ fontSize: 12, color: mutedColor, marginTop: 4, marginBottom: 20 }}>{user?.email}</p>

      {/* Account badge */}
      <div style={{ ...sectionStyle, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: appColor }}>
            {isFounder ? "👑 Founder" : isPro ? "⭐ Pro" : "🆓 Free"}
          </p>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: mutedColor }}>
            {isFounder ? "Unlimited access forever" : isPro ? "Full Pro access" : "10 AI calls/month"}
          </p>
        </div>
        {!isPro && !isFounder && (
          <button type="button" onClick={onUpgrade}
            style={{ padding: "8px 16px", borderRadius: 20, border: "none", background: "#c4622d", color: "#fff", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
            Upgrade
          </button>
        )}
      </div>

      {/* Language section */}
      <div style={sectionStyle}>
        <h3 style={{ margin: "0 0 8px", fontSize: 15, color: mutedColor }}>🌍 {translate("language")}</h3>
        <p style={{ margin: "0 0 14px", fontSize: 12, color: mutedColor }}>{translate("languageDesc")}</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {LANGUAGES.map(lang => {
            const isActive = (settings.language || "en") === lang.code;
            return (
              <button key={lang.code} type="button" onClick={() => update("language", lang.code)}
                style={{ padding: "8px 14px", borderRadius: 50, border: `1px solid ${isActive ? "#c4622d" : settings.darkMode ? "#444" : "#e2e8f0"}`, background: isActive ? "rgba(196,98,45,0.15)" : "transparent", color: isActive ? "#c4622d" : mutedColor, fontWeight: isActive ? 700 : 400, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accessibility */}
      <div style={sectionStyle}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, color: mutedColor }}>♿ {translate("accessibility")}</h3>

        <SettingRow label={`🎤 ${translate("voiceNavigation")}`} desc={translate("voiceNavigationDesc")} value={settings.voiceEnabled} onChange={v => update("voiceEnabled", v)} borderColor={borderColor} mutedColor={mutedColor} appColor={appColor} />

        {settings.voiceEnabled && (
          <div style={{ background: settings.darkMode ? "#333" : "#f7fafc", borderRadius: 10, padding: 14, marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: mutedColor, margin: "0 0 8px" }}>🎤 Voice Commands:</p>
            {[["Navigate", '"Go to pantry" / "Go to recipes"'], ["Add item", '"Add garlic to pantry"'], ["Scan", '"Scan fridge"'], ["Cook", '"Cook carbonara" / "Best match"'], ["AI", '"Generate recipe"'], ["Help", '"Help"']].map(([label, example]) => (
              <div key={label} style={{ marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#c4622d" }}>{label}: </span>
                <span style={{ fontSize: 11, color: mutedColor }}>{example}</span>
              </div>
            ))}
          </div>
        )}

        <SettingRow label={`🔠 ${translate("largeText")}`} desc={translate("largeTextDesc")} value={settings.largeText} onChange={v => update("largeText", v)} borderColor={borderColor} mutedColor={mutedColor} appColor={appColor} />
        <SettingRow label={`🌓 ${translate("highContrast")}`} desc={translate("highContrastDesc")} value={settings.highContrast} onChange={v => update("highContrast", v)} borderColor="transparent" mutedColor={mutedColor} appColor={appColor} />
      </div>

      {/* App */}
      <div style={sectionStyle}>
        <h3 style={{ margin: "0 0 14px", fontSize: 15, color: mutedColor }}>🍳 App</h3>
        <SettingRow label={`🔊 ${translate("voiceCooking")}`} desc={translate("voiceCookingDesc")} value={settings.voiceCooking} onChange={v => update("voiceCooking", v)} borderColor={borderColor} mutedColor={mutedColor} appColor={appColor} />
        <SettingRow label={`🌙 ${translate("darkMode")}`} desc={translate("darkModeDesc")} value={settings.darkMode} onChange={v => update("darkMode", v)} borderColor="transparent" mutedColor={mutedColor} appColor={appColor} />
      </div>

      {saved && (
        <div style={{ background: "#f0fff4", border: "1px solid #9ae6b4", borderRadius: 10, padding: "10px 14px", marginBottom: 14, textAlign: "center" }}>
          <p style={{ color: "#276749", fontSize: 13, margin: 0, fontWeight: 600 }}>✅ {translate("settingsSaved")}</p>
        </div>
      )}

      <button type="button" onClick={onSignOut}
        style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #fed7d7", background: "#fff5f5", color: "#e53e3e", fontWeight: 700, fontSize: 15, cursor: "pointer", marginTop: 8 }}>
        🚪 {translate("signOut")}
      </button>

      <p style={{ textAlign: "center", fontSize: 11, color: mutedColor, marginTop: 20 }}>
        Che AF · {translate("cookLikeYouKnow")}
      </p>
    </div>
  );
}

function SettingRow({ label, desc, value, onChange, borderColor, mutedColor, appColor }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingBottom: 16, borderBottom: `1px solid ${borderColor}` }}>
      <div style={{ flex: 1, paddingRight: 16 }}>
        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: appColor }}>{label}</p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: mutedColor }}>{desc}</p>
      </div>
      <Toggle value={value} onChange={onChange} />
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
