import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getAlbumDetails } from "../services/musicBrainz";
import { type AlbumDetails } from "../types/album";

interface AlbumRating {
  rating: number;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export default function AlbumRatings() {
  const { id } = useParams();

  const [album, setAlbum] = useState<AlbumDetails | null>(null);
  const [ratings, setRatings] = useState<AlbumRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRatings() {
      if (!id) return;

      try {
        const [albumData, ratingsResponse] = await Promise.all([
          getAlbumDetails(id),
          supabase
            .from("ratings")
            .select(`rating, created_at, profiles (username, avatar_url)`)
            .eq("album_id", id)
            .order("created_at", { ascending: false }),
        ]);

        setAlbum(albumData);

        if (ratingsResponse.error) throw ratingsResponse.error;

        const formattedRatings: AlbumRating[] = (
          ratingsResponse.data ?? []
        ).map((item) => ({
          rating: item.rating,
          created_at: item.created_at,
          profiles: Array.isArray(item.profiles)
            ? item.profiles[0]
            : item.profiles,
        }));

        setRatings(formattedRatings);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadRatings();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-800 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-slate-800 min-h-screen">
      <div className="mx-auto max-w-6xl p-8">
        <div className="mb-8 flex items-center gap-6">
          <img
            src={album?.coverUrl}
            alt={album?.title}
            className="h-32 w-32 rounded-md"
          />
          <div>
            <Link to={`/album/${id}`} className="text-zinc-200 hover:underline">
              <h1 className="text-3xl font-bold">
                {album?.title}
              </h1>
            </Link>

            <p className="text-slate-400">{album?.artist}</p>
            <p className="mt-2 text-sm text-slate-400">
              {ratings.length} ratings
            </p>
          </div>
        </div>
        <hr className="mb-4 border-slate-400" />
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {ratings.map((rating, index) => (
            <Link
              key={index}
              to={`/u/${rating.profiles.username}`}
              className="flex flex-col items-center text-center"
            >
              <span className="mb-1 text-sm text-slate-400">
                {new Date(rating.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>

              <img
                src={
                  rating.profiles.avatar_url ||
                  "https://placehold.co/100x100?text=Avatar"
                }
                alt={rating.profiles.username}
                className="mb-1 h-20 w-20 rounded-full object-cover"
              />

              <span className="mb-1 max-w-full truncate font-semibold text-zinc-200">
                {rating.profiles.username}
              </span>

              <span className="text-xl text-zinc-200 text-center">
                {rating.rating}
              </span>

              <div className="w-9 bg-slate-800 h-[4px]">
                <div
                  className={`h-full bg-red-500/80`}
                  style={{
                    width: `${rating.rating}%`,
                    backgroundColor: `${rating.rating >= 70 ? `green` : rating.rating < 30 ? `red` : "yellow"}`,
                  }}
                ></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
