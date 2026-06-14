import { supabase } from "../lib/supabase";

export async function rateAlbum(
  albumId: string,
  rating: number,
  albumTitle: string,
  artistName: string,
  coveUrl: string,
) {
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
      album_title: albumTitle,
      artist_name: artistName,
      cover_url: coveUrl,
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

export async function getUserRating(albumId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .from("ratings")
    .select("rating")
    .eq("user_id", user.id)
    .eq("album_id", albumId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  return data?.rating ?? null;
}

export async function deleteRating(albumId: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const { error } = await supabase
    .from("ratings")
    .delete()
    .eq("user_id", user.id)
    .eq("album_id", albumId);

  if (error) {
    throw error;
  }
}
