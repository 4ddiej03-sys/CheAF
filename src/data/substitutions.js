const SUBSTITUTIONS = {
  milk: [
    { item: "soy milk", note: "Similar protein and neutral flavor" },
    { item: "almond milk", note: "Good for baking, mild taste" },
    { item: "oat milk", note: "Creamy texture like dairy milk" },
    { item: "water + butter", note: "Adds fat and liquid like milk" }
  ],

  butter: [
    { item: "olive oil", note: "Healthy fat, great for cooking" },
    { item: "margarine", note: "Closest baking replacement" },
    { item: "coconut oil", note: "Solid fat like butter" }
  ],

  eggs: [
    { item: "flaxseed egg", note: "Good binder for baking" },
    { item: "chia egg", note: "Similar to flax, vegan option" },
    { item: "applesauce", note: "Adds moisture in cakes" }
  ],

  cheese: [
    { item: "nutritional yeast", note: "Cheesy umami flavor" },
    { item: "vegan cheese", note: "Closest texture substitute" }
  ],

  sugar: [
    { item: "honey", note: "Natural sweetener, use less" },
    { item: "maple syrup", note: "Adds flavor and sweetness" },
    { item: "stevia", note: "Zero-calorie sweetener" }
  ],

  flour: [
    { item: "almond flour", note: "Low-carb baking option" },
    { item: "oat flour", note: "Great gluten-free substitute" }
  ],

  chicken: [
    { item: "tofu", note: "Protein-rich vegetarian option" },
    { item: "mushrooms", note: "Meaty texture and umami" },
    { item: "beans", note: "Budget protein replacement" }
  ],

  beef: [
    { item: "lentils", note: "Cheap and protein-packed" },
    { item: "mushrooms", note: "Meaty texture replacement" }
  ],

  onion: [
    { item: "shallot", note: "Similar but milder flavor" },
    { item: "leek", note: "Great in soups and sautés" }
  ],

  garlic: [
    { item: "garlic powder", note: "Dried garlic substitute" }
  ],

  tomato: [
    { item: "canned tomato", note: "Same flavor, already cooked" },
    { item: "red pepper", note: "Adds sweetness and color" }
  ]
};

export default SUBSTITUTIONS;
