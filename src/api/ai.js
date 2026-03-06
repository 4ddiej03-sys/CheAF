import axios from "axios";

export const getRecipes = async (pantry) => {
  const res = await axios.post("http://localhost:3000/ai/recipes", {
    pantry
  });
  return res.data;
};
