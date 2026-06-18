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
      <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-5">
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
            <div className="p-4 text-white">
              <h3 className="line-clamp-2 font-semibold truncate" title={album.album_title}>
                {album.album_title}
              </h3>
              <p className="mt-1 text-sm text-slate-300 truncate" title={album.artist_name}>{album.artist_name}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="aspect-square h-9">
                  <p className="font-bold text-xl text-center">
                    {album.avg_rating}
                  </p>
                  <div className="w-full bg-slate-800 h-[4px]">
                    <div className={`h-full bg-red-500/80`} style={{ width: `${album.avg_rating}%`, backgroundColor: `${album.avg_rating >= 70 ? `green` : album.avg_rating < 30 ? `red` : "yellow"}` }}></div>
                  </div>
                </div>
                <span className="text-xs text-slate-400">
                  user score ({album.ratings_count})
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
