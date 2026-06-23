import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getProfileByUsername } from "../services/profile";

interface RatedAlbum {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  rating: number;
  created_at: string;
}

type SortType =
  | "rating-desc"
  | "rating-asc"
  | "rated-desc";

export default function UserProfile() {
  const { username: profileUsername } = useParams();
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [albums, setAlbums] = useState<RatedAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortType>("rated-desc");

  useEffect(() => {
    async function loadProfile() {
      try {
        if (!profileUsername) return;

        const profile = await getProfileByUsername(profileUsername);

        if (!profile) {
          setLoading(false);
          return;
        }

        setUsername(profile.username);
        setAvatarUrl(profile.avatar_url ?? "");

        const { data: ratings, error } = await supabase
          .from("ratings")
          .select("*")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        const ratedAlbums =
          ratings?.map((rating) => ({
            id: rating.album_id,
            title: rating.album_title,
            artist: rating.artist_name,
            coverUrl: rating.cover_url,
            rating: rating.rating,
            created_at: rating.created_at,
          })) ?? [];
        setAlbums(ratedAlbums);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [profileUsername]);

  const sortedAlbums = [...albums].sort((a, b) => {
    switch (sortBy) {
      case "rating-desc":
        return b.rating - a.rating;

      case "rating-asc":
        return a.rating - b.rating;

      case "rated-desc":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-800 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-800 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="flex gap-3 mb-5">
          <img
            src={avatarUrl || "https://placehold.co/200x200?text=Avatar"}
            alt={username}
            className="h-24 w-24 rounded-full object-cover border border-slate-700"
          />

          <div className="flex flex-col justify-evenly">
            <h1 className="text-4xl font-bold">@{username}</h1>
            <p className="text-zinc-400">{albums.length} ratings</p>
          </div>
        </div>

        <div className="mb-6 flex justify-end">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-white"
          >
            <option value="rated-desc">Recently Rated</option>
            <option value="rating-desc">Highest Rated</option>
            <option value="rating-asc">Lowest Rated</option>
          </select>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
          {sortedAlbums.map((album) => (
            <Link
              key={album.id}
              to={`/album/${album.id}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-zinc-600 transition"
            >
              <img
                src={album.coverUrl}
                alt={album.title}
                loading="lazy"
                className="aspect-square w-full object-cover"
              />
              <div className="p-4 flex justify-between items-center gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold truncate" title={album.title}>
                    {album.title}
                  </h3>
                  <p
                    className="text-sm text-zinc-400 mt-1 truncate"
                    title={album.artist}
                  >
                    {album.artist}
                  </p>
                </div>
                <div className="aspect-square h-9">
                  <p className="font-bold text-xl text-center">
                    {album.rating}
                  </p>
                  <div className="w-full bg-slate-800 h-[4px]">
                    <div
                      className={`h-full bg-red-500/80`}
                      style={{
                        width: `${album.rating}%`,
                        backgroundColor: `${album.rating >= 70 ? `green` : album.rating < 30 ? `red` : "yellow"}`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
