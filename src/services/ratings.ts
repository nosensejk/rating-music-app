import { supabase } from "../lib/supabase";

export async function rateAlbum(albumId: string, rating: number) {
  if (rating < 0 || rating > 100) {
    throw new Error("Rating must be between 0 and 100");
  }
  const { data: userData } = await supabase.auth.getUser();

  const user = userData.user;
  if (!user) throw new Error("Nou authenticated");

  const { error } = await supabase.from("ratings").upsert(
    {
      user_id: user.id,
      album_id: albumId,
      rating,
    },
    { onConflict: "user_id,album_id" },
  );

  if (error) throw error;
}

export async function getAverageRating(albumId: string) {
  const { data } = await supabase
    .from("ratings")
    .select("rating")
    .eq("album_id", albumId);

  if (!data?.length) return 0;

  const sum = data.reduce((acc, r) => acc + r.rating, 0);
  return sum / data.length;
}
