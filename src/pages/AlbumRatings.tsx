import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

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

  const [ratings, setRatings] = useState<AlbumRating[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRatings() {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from("ratings")
          .select(`rating, created_at, profiles (username, avatar_url)`)
          .eq("album_id", id)
          .order("created_at", { ascending: false });

        if (error) throw error;


        setRatings(data);
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
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold text-white">Ratings</h1>

      <div className="space-y-4">
        {ratings.map((rating, index) => (
          <div
            key={index}
            className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800 p-4"
          >
            <Link
              to={`/u/${rating.profiles.username}`}
              className="flex items-center gap-3"
            >
              <img
                src={
                  rating.profiles.avatar_url ||
                  "https://placehold.co/100x100?text=Avatar"
                }
                alt={rating.profiles.username}
                className="h-12 w-12 rounded-full object-cover"
              />
              <span className="font-semibold text-white">
                @{rating.profiles.username}
              </span>
            </Link>
            <span className="text-2xl font-bold text-white">
              {rating.rating}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
