// utils/scaleIngredients.js
// Scales ingredient amounts up or down based on serving size ratio

const FRACTIONS = {
  "½": 0.5, "⅓": 0.333, "¼": 0.25, "⅔": 0.667, "¾": 0.75,
  "⅛": 0.125, "⅙": 0.167, "⅜": 0.375, "⅝": 0.625, "⅞": 0.875,
};

const FRACTION_TO_TEXT = [
  [0.125, "⅛"], [0.167, "⅙"], [0.25, "¼"], [0.333, "⅓"],
  [0.375, "⅜"], [0.5, "½"],   [0.625, "⅝"], [0.667, "⅔"],
  [0.75, "¾"],  [0.875, "⅞"],
];

function toDecimal(str) {
  // Replace unicode fractions
  let s = str.trim();
  for (const [frac, val] of Object.entries(FRACTIONS)) {
    s = s.replace(frac, ` ${val}`);
  }
  // Handle "1 ½" style mixed numbers
  const mixed = s.match(/^(\d+)\s+([\d.]+)$/);
  if (mixed) return parseFloat(mixed[1]) + parseFloat(mixed[2]);
  // Handle regular fractions like "1/3"
  const slash = s.match(/^(\d+)\/(\d+)$/);
  if (slash) return parseInt(slash[1]) / parseInt(slash[2]);
  return parseFloat(s) || null;
}

function toNiceText(num) {
  if (num === 0) return "0";

  // Check if close to a nice fraction
  for (const [val, text] of FRACTION_TO_TEXT) {
    if (Math.abs(num - val) < 0.05) return text;
  }

  // Check mixed numbers like 1½
  const whole = Math.floor(num);
  const frac  = num - whole;
  if (whole > 0 && frac > 0.05) {
    for (const [val, text] of FRACTION_TO_TEXT) {
      if (Math.abs(frac - val) < 0.05) return `${whole}${text}`;
    }
  }

  // Round to 1 decimal if needed
  if (Number.isInteger(num) || num >= 10) return Math.round(num).toString();
  return parseFloat(num.toFixed(1)).toString();
}

export function scaleIngredient(ingredient, originalServings, newServings) {
  if (!ingredient || originalServings === newServings) return ingredient;
  const ratio = newServings / originalServings;

  // Match pattern: optional number + optional fraction + unit + ingredient name
  // e.g. "2 cloves garlic", "1½ cups flour", "½ tsp salt", "3 large eggs"
  const pattern = /^([\d½⅓¼⅔¾⅛⅙⅜⅝⅞\/\s.]+)\s+(.+)$/;
  const match   = ingredient.match(pattern);

  if (!match) return ingredient; // no number found, return as-is

  const numStr   = match[1].trim();
  const rest     = match[2].trim();
  const original = toDecimal(numStr);

  if (!original || isNaN(original)) return ingredient;

  const scaled = original * ratio;
  return `${toNiceText(scaled)} ${rest}`;
}

export function scaleRecipe(recipe, newServings) {
  if (!recipe?.servings || !newServings) return recipe;
  const originalServings = recipe.servings;

  return {
    ...recipe,
    servings: newServings,
    ingredients: (recipe.ingredients || []).map(ing =>
      scaleIngredient(ing, originalServings, newServings)
    ),
  };
}
