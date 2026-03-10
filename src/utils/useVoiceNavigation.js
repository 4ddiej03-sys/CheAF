// utils/useVoiceNavigation.js
// Voice navigation hook — controls the entire app by voice
// Uses Web Speech API (built into all modern browsers, no library needed)

import { useEffect, useRef, useCallback } from "react";

// Speak a message aloud
export function speak(text, rate = 1) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
}

export function useVoiceNavigation({
  enabled = false,
  onNavigate,       // (tab) => void
  onAddPantryItem,  // (name) => void
  onScanFridge,     // () => void
  onGenerateRecipe, // () => void
  onSearchOnline,   // () => void
  onCookBestMatch,  // () => void
  onImportURL,      // () => void
  recipes = [],
  onCookRecipe,     // (recipe) => void
}) {
  const recognitionRef = useRef(null);
  const listeningRef   = useRef(false);
  const enabledRef     = useRef(enabled);

  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  const processCommand = useCallback((transcript) => {
    const cmd = transcript.toLowerCase().trim();
    console.log("Voice command:", cmd);

    // ── Navigation ───────────────────────────────────────────────
    if (cmd.includes("recipe") && !cmd.includes("generate") && !cmd.includes("cook") && !cmd.includes("create")) {
      onNavigate("recipes");
      speak("Opening recipes");
      return;
    }
    if (cmd.includes("pantry") && !cmd.includes("scan") && !cmd.includes("add")) {
      onNavigate("pantry");
      speak("Opening pantry");
      return;
    }
    if (cmd.includes("shopping") || cmd.includes("shop") || cmd.includes("grocery")) {
      onNavigate("shopping");
      speak("Opening shopping list");
      return;
    }
    if (cmd.includes("favourite") || cmd.includes("favorite") || cmd.includes("saved")) {
      onNavigate("favorites");
      speak("Opening favourites");
      return;
    }

    // ── Pantry actions ───────────────────────────────────────────
    if (cmd.includes("add ") && (cmd.includes("pantry") || cmd.includes("ingredient") || cmd.includes("have"))) {
      const patterns = [
        /add (.+?) to pantry/,
        /add (.+?) to ingredients/,
        /i have (.+)/,
        /add (.+)/,
      ];
      for (const pattern of patterns) {
        const match = cmd.match(pattern);
        if (match) {
          const ingredient = match[1].trim();
          onAddPantryItem(ingredient);
          speak(`Added ${ingredient} to your pantry`);
          return;
        }
      }
    }

    if (cmd.includes("scan") || cmd.includes("fridge") || cmd.includes("photo") || cmd.includes("camera")) {
      onScanFridge();
      speak("Opening fridge scanner");
      return;
    }

    // ── Recipe actions ───────────────────────────────────────────
    if (cmd.includes("generate") || cmd.includes("create recipe") || cmd.includes("make recipe") || cmd.includes("ai recipe")) {
      onGenerateRecipe();
      speak("Generating AI recipe from your pantry");
      return;
    }

    if (cmd.includes("search online") || cmd.includes("find online") || cmd.includes("online recipe")) {
      onSearchOnline();
      speak("Opening online recipe search");
      return;
    }

    if (cmd.includes("best match") || cmd.includes("cook best") || cmd.includes("what can i make") || cmd.includes("what can i cook")) {
      onCookBestMatch();
      speak("Finding best match from your pantry");
      return;
    }

    if (cmd.includes("import") || cmd.includes("url") || cmd.includes("website")) {
      onImportURL();
      speak("Opening recipe import");
      return;
    }

    // ── Cook a specific recipe by name ───────────────────────────
    if (cmd.includes("cook ") || cmd.includes("make ") || cmd.includes("start cooking")) {
      const searchTerm = cmd
        .replace("cook ", "").replace("make ", "").replace("start cooking ", "")
        .trim();
      const match = recipes.find(r =>
        r.title.toLowerCase().includes(searchTerm) ||
        searchTerm.includes(r.title.toLowerCase().split(" ")[0])
      );
      if (match) {
        onCookRecipe(match);
        speak(`Starting ${match.title}. Let's cook!`);
        return;
      }
      speak(`I couldn't find a recipe called ${searchTerm}. Try saying "go to recipes" to browse.`);
      return;
    }

    // ── Help ─────────────────────────────────────────────────────
    if (cmd.includes("help") || cmd.includes("what can") || cmd.includes("commands")) {
      speak("You can say: go to pantry, go to recipes, go to shopping list, add garlic to pantry, scan fridge, generate recipe, search online, best match, or cook followed by a recipe name.");
      return;
    }

    // ── Unrecognised ─────────────────────────────────────────────
    speak(`I didn't understand "${transcript}". Say help to hear available commands.`);
  }, [onNavigate, onAddPantryItem, onScanFridge, onGenerateRecipe, onSearchOnline, onCookBestMatch, onImportURL, recipes, onCookRecipe]);

  const startListening = useCallback(() => {
    if (!enabledRef.current) return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      speak("Voice navigation is not supported on this browser. Please use Chrome or Safari.");
      return;
    }
    if (listeningRef.current) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      listeningRef.current = true;
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      processCommand(transcript);
    };

    recognition.onerror = (event) => {
      listeningRef.current = false;
      if (event.error !== "no-speech" && event.error !== "aborted") {
        speak("Sorry, I didn't catch that. Try again.");
      }
    };

    recognition.onend = () => {
      listeningRef.current = false;
    };

    recognitionRef.current = recognition;
    recognition.start();
    speak("Listening…", 1.2);
  }, [processCommand]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.abort();
    listeningRef.current = false;
    window.speechSynthesis?.cancel();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopListening();
  }, [stopListening]);

  return { startListening, stopListening, isListening: listeningRef };
}
