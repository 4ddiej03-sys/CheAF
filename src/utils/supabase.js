import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function loadUserData(userId) {
  const { data, error } = await supabase
    .from("user_data")
    .select("*")
    .eq("user_id", userId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

export async function saveUserData(userId, payload) {
  const { error } = await supabase
    .from("user_data")
    .upsert({ user_id: userId, ...payload, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ── Photo upload ─────────────────────────────────────────────────
export async function uploadRecipePhoto(userId, recipeId, file) {
  const ext  = file.name.split(".").pop();
  const path = `${userId}/${recipeId}.${ext}`;

  const { error } = await supabase.storage
    .from("recipe-photos")
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage
    .from("recipe-photos")
    .getPublicUrl(path);

  return data.publicUrl;
}

export async function deleteRecipePhoto(userId, recipeId) {
  const extensions = ["jpg", "jpeg", "png", "webp", "heic"];
  for (const ext of extensions) {
    await supabase.storage
      .from("recipe-photos")
      .remove([`${userId}/${recipeId}.${ext}`]);
  }
}
