import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchAlbums } from "../services/musicBrainz";
import { type Album } from "../types/album";
import AlbumCard from "../components/AlbumCard";

export default function Search() {
  const [params] = useSearchParams();
  const query = params.get("q") ?? "";
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const results = await searchAlbums(query);
        setAlbums(results);
      } finally {
        setLoading(false);
      }
    }
    if (query) {
      load();
    }
  }, [query]);

  if (loading) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl p-8 bg-slate-800">
      <h1 className="mb-6 text-3xl font-bold text-white">
        Search results for "{query}"
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {albums.map((album) => (
          <AlbumCard key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
}
