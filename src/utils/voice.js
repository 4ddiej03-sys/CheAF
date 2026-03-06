let selectedVoice = null;
let keepAliveTimer = null;

function getSynth() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  return window.speechSynthesis;
}

export function loadVoices(timeoutMs = 3000) {
  const synth = getSynth();
  if (!synth) return Promise.resolve([]);
  return new Promise(resolve => {
    const immediate = synth.getVoices();
    if (immediate.length) { resolve(immediate); return; }
    const timer = setTimeout(() => resolve(synth.getVoices()), timeoutMs);
    synth.onvoiceschanged = () => { clearTimeout(timer); resolve(synth.getVoices()); };
  });
}

export async function setVoice(name) {
  const voices = await loadVoices();
  if (!voices.length) return;
  selectedVoice = voices.find(v => v.name.includes(name)) || voices[0];
}

export async function speak(text, options = {}) {
  const synth = getSynth();
  if (!synth || !text?.trim()) return;
  const { lang = "en", rate = 0.92, pitch = 1, onEnd = null, onError = null } = options;
  stopSpeaking();
  const msg = new SpeechSynthesisUtterance(text.trim());
  const voices = synth.getVoices();
  msg.voice = selectedVoice || voices.find(v => v.lang.startsWith(lang) && v.name.toLowerCase().includes("natural")) || voices.find(v => v.lang.startsWith(lang)) || voices[0];
  msg.lang = msg.voice?.lang || `${lang}-US`;
  msg.rate = rate; msg.pitch = pitch;
  msg.onend = () => { _stopKeepAlive(); if (typeof onEnd === "function") onEnd(); };
  msg.onerror = (e) => { _stopKeepAlive(); if (e.error !== "interrupted") { console.warn("Speech error:", e.error); if (typeof onError === "function") onError(e); } };
  synth.speak(msg);
  _startKeepAlive(synth);
}

export function stopSpeaking() {
  const synth = getSynth();
  if (!synth) return;
  _stopKeepAlive();
  synth.cancel();
}

export function isSpeaking() {
  const synth = getSynth();
  return synth ? synth.speaking : false;
}

function _startKeepAlive(synth) {
  _stopKeepAlive();
  keepAliveTimer = setInterval(() => {
    if (!synth.speaking) { _stopKeepAlive(); return; }
    synth.pause(); synth.resume();
  }, 10000);
}

function _stopKeepAlive() {
  if (keepAliveTimer) { clearInterval(keepAliveTimer); keepAliveTimer = null; }
}
