import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getArtistAlbums, getArtist } from "../services/musicBrainz";
import { type Album } from "../types/album";

type FilterType = "Album" | "EP" | "Single" | "Compilation" | "All";

export default function ArtistPage() {
  const { id } = useParams();
  const [albums, setAlbums] = useState<Album[]>([]);
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
      if (!id) return;
      try {
        const data = await getArtistAlbums(id);
        const artist = await getArtist(id);

        data.sort((a, b) => {
          const yearA = parseInt(a.year) || 0;
          const yearB = parseInt(b.year) || 0;

          return yearB - yearA;
        });
        setAlbums(data);
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

  console.log(filteredAlbums);

  const getCountByType = (type: string, albums: Album[]) => {
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

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-8">
      <h1 className="mb-8 text-4xl font-bold">{artist}</h1>
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
            className="overflow-hidden rounded-xl border border-slate-600 bg-slate-700 transition hover:border-slate-500 hover:scale-[1.03]"
          >
            <img
              src={album.coverUrl}
              alt={album.title}
              className="aspect-square w-full object-cover"
            />
            <div className="p-4">
              <h3 className="line-clamp-2 font-semibold">{album.title}</h3>

              <span className="text-slate-400">{album.year}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
