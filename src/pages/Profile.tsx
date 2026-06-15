import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getProfile } from "../services/profile";

interface RatedAlbum {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  rating: number;
}

export default function Profile() {
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [albums, setAlbums] = useState<RatedAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;
        const profile = await getProfile(user.id);
        setUsername(profile.username);
        setAvatarUrl(profile.avatar_url ?? "");
        const { data: ratings, error } = await supabase
          .from("ratings")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        const ratedAlbums =
          ratings?.map((rating) => ({
            id: rating.album_id,
            title: rating.album_title,
            artist: rating.artist_name,
            coverUrl: rating.cover_url,
            rating: rating.rating,
          })) ?? [];
        setAlbums(ratedAlbums);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
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
        <img
          src={avatarUrl || "https://placehold.co/200x200?text=Avatar"}
          alt={username}
          className="h-24 w-24 rounded-full object-cover border border-slate-700"
        />

        <div>
          <h1 className="text-4xl font-bold">@{username}</h1>
          <p className="text-zinc-400">{albums.length} ratings</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {albums.map((album) => (
            <Link
              key={album.id}
              to={`/album/${album.id}`}
              className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden hover:border-zinc-600 transition"
            >
              <img
                src={album.coverUrl}
                alt={album.title}
                className="aspect-square w-full object-cover"
              />
              <div className="p-4 flex justify-between items-center">
                <div className="">
                  <h3 className="font-semibold">{album.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{album.artist}</p>
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
