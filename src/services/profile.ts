import { supabase } from "../lib/supabase";

export async function hasProfile(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();
  return !!data;
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getProfileByUsername(username: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();

  if (error) throw error;

  return data;
}

export async function isUsernameTaken(username: string) {
  const {data, error} = await supabase.from("profiles").select("id").eq("username", username).maybeSingle();

  if (error) throw error;

  return !!data;
}
