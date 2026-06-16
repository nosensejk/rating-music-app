import { supabase } from "../lib/supabase";

export interface TopAlbum {
  album_id: string;
  album_title: string;
  artist_name: string;
  cover_url: string;
  avg_rating: number;
  ratings_count: number;
}

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

export async function getTopAlbums(): Promise<TopAlbum[]> {
  const { data, error } = await supabase
    .from("ratings")
    .select(`album_id, album_title, artist_name, cover_url, rating`);

    if (error) throw error;
    const grouped = new Map<string, TopAlbum>();

    data.forEach((row) => {
      const existing = grouped.get(row.album_id);
      if (existing) {
        existing.avg_rating += row.rating;
        existing.ratings_count += 1;
      } else {
        grouped.set(row.album_id, {
          album_id: row.album_id,
          album_title: row.album_title,
          artist_name: row.artist_name,
          cover_url: row. cover_url,
          avg_rating: row.rating,
          ratings_count: 1,
        });
      }
    });

    const albums = Array.from(grouped.values()).map((album) => ({
      ...album, avg_rating: album.avg_rating / album.ratings_count,
    })).sort((a, b) => b.avg_rating - a.avg_rating).slice(0, 10);

    return albums;
}
