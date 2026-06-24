import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { getTopAlbumsByTag } from "../services/lastfm";

export default function GenrePage() {
  const { slug } = useParams();

  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const genreName = slug
    ?.split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

  useEffect(() => {
    async function loadGenre() {
      if (!slug) return;

      try {
        const albums = await getTopAlbumsByTag(slug);
        setAlbums(albums);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadGenre();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen text-black flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-slate-800 min-h-screen">
      <div className="mx-auto max-w-7xl p-6 bg-slate">
        <h1 className="mb-5 text-4xl font-bold text-white">{genreName}</h1>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-6">
          {albums.slice(0, 18).map((album) => (
            <Link
              to={`/album/${album.mbid}`}
              key={album.mbid}
              className="overflow-hidden rounded-xl border border-slate-700"
            >
              <img
                src={album.image}
                alt={album.title}
                className="aspect-square w-full object-cover"
              />
              <div className="p-3">
                <h3
                  className="truncate font-semibold text-white"
                  title={album.title}
                >
                  {album.title}
                </h3>
                <p
                  className="truncate text-sm text-slate-400"
                  title={album.artist}
                >
                  {album.artist}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
