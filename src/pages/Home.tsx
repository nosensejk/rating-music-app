import { useState, useEffect } from "react";
import { searchAlbums } from "../services/musicBrainz";
import { type Album } from "../types/album";
import AlbumCard from "../components/AlbumCard";
import { Link } from "react-router-dom";

export default function Home() {
  const [query, setQuery] = useState("");
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setAlbums([]);
        return;
      }
      setLoading(true);
      try {
        const results = await searchAlbums(query, controller.signal);
        setAlbums(results);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <Link to="/profile" className="mb-6 inline-block text-blue-400 hover:text-blue-300">My Profile</Link>
        <h1 className="mb-8 text-center text-5xl font-bold">Album Rater</h1>
        <div className="mb-10 flex gap-3">
          <input
            type="text"
            placeholder="Search albums..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 outline-none transition focus:border-blue-500"
          />
        </div>
        {loading && <p className="text-center text-zinc-400">Loading...</p>}
        {!loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
