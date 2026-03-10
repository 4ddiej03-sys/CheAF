// components/VoiceButton.jsx
// Floating microphone button — always visible when voice is enabled

import { useState } from "react";

export default function VoiceButton({ onPress, enabled }) {
  const [active, setActive] = useState(false);

  if (!enabled) return null;

  function handlePress() {
    setActive(true);
    onPress();
    setTimeout(() => setActive(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handlePress}
      aria-label="Voice command"
      style={{
        position: "fixed",
        bottom: 90,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: "50%",
        border: "none",
        background: active ? "#e53e3e" : "#c4622d",
        color: "#fff",
        fontSize: 24,
        cursor: "pointer",
        boxShadow: active
          ? "0 0 0 8px rgba(229,62,62,0.2), 0 4px 20px rgba(196,98,45,0.5)"
          : "0 4px 20px rgba(196,98,45,0.4)",
        zIndex: 999,
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: active ? "pulse 1s infinite" : "none",
      }}>
      {active ? "👂" : "🎤"}
      <style>{`
        @keyframes pulse {
          0%   { box-shadow: 0 0 0 0 rgba(229,62,62,0.4), 0 4px 20px rgba(196,98,45,0.5); }
          70%  { box-shadow: 0 0 0 16px rgba(229,62,62,0), 0 4px 20px rgba(196,98,45,0.5); }
          100% { box-shadow: 0 0 0 0 rgba(229,62,62,0), 0 4px 20px rgba(196,98,45,0.5); }
        }
      `}</style>
    </button>
  );
}
