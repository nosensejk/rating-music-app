import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getArtistAlbums, getArtist } from "../services/musicBrainz";
import { type Album } from "../types/album";
import { supabase } from "../lib/supabase";

type FilterType = "Album" | "EP" | "Single" | "Compilation" | "All";

type RatedAlbum = Album & {
  rating: number;
};

export default function ArtistPage() {
  const { id } = useParams();
  const [albums, setAlbums] = useState<RatedAlbum[]>([]);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [artist, setArtist] = useState(null);
  const [filter, setFilter] = useState<FilterType>("Album");

  const tabs: {
    value: FilterType;
    label: string;
  }[] = [
    { value: "Album", label: "Albums" },
    { value: "EP", label: "EPs" },
    { value: "Single", label: "Singles" },
    { value: "Compilation", label: "Compilations" },
    { value: "All", label: "All" },
  ];

  useEffect(() => {
    async function load() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!id) return;

      setLoading(true);
      try {
        const [data, artist, ratingsResponse] = await Promise.all([
          getArtistAlbums(id),
          getArtist(id),
          supabase.from("ratings").select("*").eq("user_id", user?.id),
        ]);
        const ratings = ratingsResponse.data ?? [];

        const albumsWithRatings = data.map((album) => {
          const rating = ratings.find((r) => r.album_id === album.id);

          return {
            ...album,
            rating: rating?.rating ?? 0,
          };
        });

        albumsWithRatings.sort((a, b) => {
          const yearA = parseInt(a.year) || 0;
          const yearB = parseInt(b.year) || 0;

          return yearB - yearA;
        });
        setAlbums(albumsWithRatings);
        setArtist(artist.name);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  const filteredAlbums = albums.filter((album) => {
    const secondaryTypes = album.secondaryTypes ?? [];

    switch (filter) {
      case "Album":
        return album.type === "Album" && secondaryTypes.length === 0;

      case "EP":
        return album.type === "EP";

      case "Single":
        return album.type === "Single";

      case "Compilation":
        return secondaryTypes.includes("Compilation");

      case "All":
      default:
        return true;
    }
  });

  const getCountByType = (type: string, albums: RatedAlbum[]) => {
    return albums.filter((album) => {
      const secondaryTypes = album.secondaryTypes ?? [];

      switch (type) {
        case "Album":
          return album.type === "Album" && secondaryTypes.length === 0;

        case "EP":
          return album.type === "EP";

        case "Single":
          return album.type === "Single";

        case "Compilation":
          return secondaryTypes.includes("Compilation");

        case "All":
        default:
          return true;
      }
    }).length;
  };

  const averageRating = () => {
    const ratedAlbums = albums.filter((album) => {
      const secondaryTypes = album.secondaryTypes ?? [];

      return (
        (album.type === "Album" || album.type === "EP") &&
        !secondaryTypes.includes("Compilation") &&
        album.rating > 0
      );
    });

    if (ratedAlbums.length === 0) return 0;

    const sum = ratedAlbums.reduce((acc, album) => acc + album.rating, 0);

    return Number(sum / ratedAlbums.length);
  };

  const avg = averageRating();
  const ratingsCount = albums.filter(
    (a) => (a.type === "Album" || a.type === "EP") && a.rating > 0,
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen text-black flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <div className="mb-8 w-fit flex items-center gap-6 bg-slate-700 p-4 rounded-lg">
        <h1 className="text-4xl font-bold text-zinc-200">{artist}</h1>

        {avg ? (
          <div className="w-fit flex flex-col items-center gap-2 p-2 rounded-lg border-l-zinc-200">
            <div className="text-s text-slate-400 mt-1">USER SCORE</div>
            <div className="flex items-center gap-3">
              <div className="aspect-square h-13">
                <p
                  className="font-bold text-3xl text-center text-zinc-200"
                  title={avg.toFixed(1)}
                >
                  {avg.toFixed(0)}
                </p>
                <div className="w-full bg-slate-800 h-[4px]">
                  <div
                    className="h-full"
                    style={{
                      width: `${avg}%`,
                      backgroundColor: `${avg >= 70 ? `green` : avg < 30 ? `red` : "yellow"}`,
                    }}
                  ></div>
                </div>
              </div>
              <span className="text-s text-slate-400">
                Based on{" "}
                <span className="font-semibold text-white">{ratingsCount}</span>{" "}
                rating{ratingsCount === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        ) : (
          <span className="text-zinc-200 bg-slate-700 p-4 rounded-lg">No ratings yet</span>
        )}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`rounded-lg px-4 py-2 transition ${filter === tab.value ? "bg-blue-600 text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600 cursor-pointer"}`}
          >
            {tab.label} ({getCountByType(tab.value, albums)})
          </button>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {filteredAlbums.map((album) => (
          <Link
            key={album.id}
            to={`/album/${album.id}`}
            className="overflow-hidden rounded-xl border border-slate-600 bg-slate-700 transition hover:border-slate-500"
          >
            <div className="aspect-square overflow-hidden bg-slate-700">
              {album.coverUrl && !brokenImages.has(album.id) ? (
                <img
                  src={album.coverUrl}
                  alt={album.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={() => {
                    setBrokenImages((prev) => new Set(prev).add(album.id));
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <div className="text-center text-slate-300">
                    <div className="mt-2 text-sm">No Cover</div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="line-clamp-2 font-semibold text-zinc-200">
                {album.title}
              </h3>

              <span className="text-slate-400">{album.year}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
