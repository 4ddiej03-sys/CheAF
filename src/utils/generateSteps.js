// src/utils/generateSteps.js

export function generateSteps(ingredients = []) {
  if (!ingredients.length) return [];

  const steps = [];

  steps.push("Prepare all ingredients by washing and chopping as needed.");

  if (ingredients.some(i => i.toLowerCase().includes("onion"))) {
    steps.push("Sauté onion in a pan until soft and fragrant.");
  }

  steps.push(
    "Add remaining ingredients and cook over medium heat, stirring occasionally."
  );

  steps.push(
    "Season with salt, pepper, and any spices you like."
  );

  steps.push(
    "Cook until everything is tender and well combined."
  );

  steps.push("Serve hot and enjoy your pantry creation.");

  return steps;
}
