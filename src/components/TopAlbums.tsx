import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTopAlbums, type TopAlbum } from "../services/ratings";

export default function TopAlbums() {
  const [albums, setAlbums] = useState<TopAlbum[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getTopAlbums();
        setAlbums(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="text-center text-slate-300">Loading top albums...</div>
    );
  }
  return (
    <section>
      <h2 className="mb-8 text-3xl font-bold">Top Rated Albums</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {albums.map((album) => (
          <Link
            key={album.album_id}
            to={`/album/${album.album_id}`}
            className="overflow-hidden rounded-xl border border-slate-600 bg-slate-700 transition hover:border-slate-500"
          >
            <img
              src={album.cover_url}
              alt={album.album_title}
              className="aspect-square w-full object-cover"
            />
            <div className="p-4">
              <h3 className="line-clamp-2 font-semibold">
                {album.album_title}
              </h3>
              <p className="mt-1 text-sm text-slate-300">{album.artist_name}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="font-bold text-blue-400">
                  {album.avg_rating.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">
                  ({album.ratings_count})
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
