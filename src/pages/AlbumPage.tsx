import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAlbumDetails } from "../services/musicBrainz";
import { type AlbumDetails } from "../types/album";
import { rateAlbum, getAverageRating } from "../services/ratings";
import { signInWithGoogle } from "../services/auth";

export default function AlbumPage() {
  const { id } = useParams();

  const [album, setAlbum] = useState<AlbumDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [avg, setAvg] = useState(0);

  useEffect(() => {
    async function loadAlbum() {
      if (!id) return;
      try {
        const data = await getAlbumDetails(id);
        setAlbum(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    loadAlbum();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getAverageRating(id).then(setAvg);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        Album not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="mx-auto max-w-6xl p-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <div>
            <img
              src={album.coverUrl}
              alt={album.title}
              className="w-full max-w-sm rounded-xl object-cover"
            />
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-3">Rating (0-100)</h3>
              <p className="text-zinc-400 mb-3">
                Average: {avg.toFixed(1)} / 100
              </p>
              <div className="flex gap-3 items-center">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={userRating}
                  onChange={(e) => setUserRating(Number(e.target.value))}
                  className="w-24 rounded bg-zinc-900 border border-zinc-700 px-3 py-2 text-white"
                />
                <button
                  onClick={async () => {
                    const clamped = Math.max(0, Math.min(100, userRating));
                    await rateAlbum(id!, clamped);
                    const newAvg = await getAverageRating(id!);
                    setAvg(newAvg);
                    setUserRating(0);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded"
                >
                  Submit
                </button>
                <button onClick={signInWithGoogle} className="rounded bg-green-600 px-4 py-2 hover:bg-green-500">Sign in with Google</button>
              </div>
            </div>
          </div>
          <div>
            <h1 className="text-5xl" font-bold>
              {album.title}
            </h1>
            <p className="mt-2 text-xl text-zinc-400">{album.artist}</p>
            <p className="mt-2 text-zinc-500">{album.year}</p>
            <h2 className="mt-8 mb-4 text-2xl font-semibold">Tracklist</h2>
            <ol className="space-y-2">
              {album.tracks.map((track, index) => (
                <li key={index} className="rounded bg-zinc-900 px-4 py-3">
                  {index + 1}. {track}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
