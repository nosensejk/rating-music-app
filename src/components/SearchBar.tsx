import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { searchAlbums } from "../services/musicBrainz";
import { type Album } from "../types/album";

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [artist, setArtist] = useState<{ id: string; name: string } | null>(
    null,
  );
  const [results, setResults] = useState<Album[]>([]);
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults([]);
        setOpen(false);
        return;
      }
      try {
        const data = await searchAlbums(query);
        setArtist(data.artist);
        setResults(data.releases);
        setOpen(true);
      } catch (error) {
        console.error(error);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const albums = results
    .filter(
      (album) =>
        album.type === "Album" && (album.secondaryTypes?.length ?? 0) === 0,
    )
    .slice(0, 5);

  const usedSlots = (artist ? 1 : 0) + albums.length;

  const singles = results
    .filter((album) => album.type === "Single")
    .slice(0, Math.max(0, 6 - usedSlots));

  return (
    <div ref={searchRef} className="relative w-80 max-sm:w-40">
      <input
        type="text"
        value={query}
        placeholder="Search..."
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2 text-white outline-none focus:border-blue-500"
      />
      {open && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full overflow-hidden rounded-xl border border-slate-600 bg-slate-700 shadow-xl">
          {/* Artist */}
          {artist && (
            <>
              <Link
                to={`/artist/${artist.id}`}
                onClick={() => {
                  setOpen(false);
                  setQuery("");
                }}
                className="block px-4 py-3 hover:bg-slate-600"
              >
                <p className="font-medium text-white">{artist.name}</p>
              </Link>
            </>
          )}

          {/* Albums */}
          {albums.length > 0 && (
            <>
              {albums.map((album) => (
                <Link
                  key={album.id}
                  to={`/album/${album.id}`}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 p-3 transition hover:bg-slate-600"
                >
                  <img
                    src={album.coverUrl}
                    alt={album.title}
                    className="h-12 w-12 rounded object-cover"
                  />

                  <div>
                    <p className="font-medium text-white">{album.title}</p>
                    <p className="text-sm text-zinc-400">{album.year}</p>
                  </div>
                </Link>
              ))}
            </>
          )}

          {/* Singles */}
          {singles.length > 0 && (
            <>
              {singles.map((single) => (
                <Link
                  key={single.id}
                  to={`/album/${single.id}`}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 p-3 transition hover:bg-slate-600"
                >
                  <img
                    src={single.coverUrl}
                    alt={single.title}
                    className="h-12 w-12 rounded object-cover"
                  />

                  <div>
                    <p className="font-medium text-white">{single.title}</p>
                    <p className="text-sm text-zinc-400">{single.year}</p>
                  </div>
                </Link>
              ))}
            </>
          )}
          <Link
            to={`/search?q=${encodeURIComponent(query)}`}
            onClick={() => {
              setOpen(false);
              setQuery("");
            }}
            className="block border-t border-slate-600 px-4 py-3 text-center text-blue-400 hover:bg-slate-600"
          >
            Show all results →
          </Link>
        </div>
      )}
    </div>
  );
}
