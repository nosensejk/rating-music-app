import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAlbumDetails } from "../services/musicBrainz";
import { type AlbumDetails } from "../types/album";
import {
  rateAlbum,
  getAverageRating,
  getUserRating,
  deleteRating,
} from "../services/ratings";
import { supabase } from "../lib/supabase";


export default function AlbumPage() {
  const { id } = useParams();

  const [album, setAlbum] = useState<AlbumDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const [userRating, setUserRating] = useState<number | null>(null);
  const [inputRating, setInputRating] = useState<string>("");
  const [ratingsCount, setRatingsCount] = useState(0);
  const [avg, setAvg] = useState(0);

  const [isEditing, setIsEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  let trackNumber = 1;

  

  useEffect(() => {
    async function loadPage() {
      if (!id) return;

      try {
        const [albumData, average, rating, ratingsResponse] = await Promise.all([
          getAlbumDetails(id),
          getAverageRating(id),
          getUserRating(id),
          supabase.from("ratings").select("id").eq("album_id", id),
        ]);

        

        setAlbum(albumData);
        setAvg(average);
        setUserRating(rating);
        setRatingsCount(ratingsResponse.data?.length ?? 0);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadPage();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-800 text-white flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!album) {
    return (
      <div className="min-h-screen bg-slate-800 text-white flex items-center justify-center">
        Album not found
      </div>
    );
  }
 
  return (
    <div className="min-h-screen bg-slate-800 text-white">
      <div className="mx-auto max-w-6xl p-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start">
          <div className="shrink-0">
            <img
              src={album.coverUrl}
              alt={album.title}
              className="w-full max-w-sm rounded-xl object-cover"
            />

            <div className="mt-8">
              <h3 className="mb-3 text-xl font-semibold">Rating (0-100)</h3>

              <p className="mb-2 text-slate-300">
                Average: {avg.toFixed(1)} / 100 <br/>
                Based on <Link to={`/album/${id}/ratings`} className=" text-slate-400 hover:text-slate-200 hover:underline">{ratingsCount} ratings</Link>
              </p>

              <div className="mb-4 flex items-center gap-2">
                {!isEditing && (
                  <p className="font-medium text-blue-400 ">
                    Your rating: {userRating ?? "Not rated"}
                  </p>
                )}

                {userRating !== null && !isEditing && (
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpen((prev) => !prev)}
                      className="rounded px-2 py-1 bg-slate-700/70 hover:bg-slate-700"
                    >
                      ⋮
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-slate-600 bg-slate-700 shadow-lg">
                        <button
                          onClick={() => {
                            setIsEditing(true);
                            setMenuOpen(false);
                            setInputRating(userRating?.toString() ?? "");
                          }}
                          className="block w-full px-4 py-2 text-left hover:bg-slate-600"
                        >
                          Edit rating
                        </button>
                        <button
                          onClick={async () => {
                            await deleteRating(id!);
                            const newAvg = await getAverageRating(id!);
                            setAvg(newAvg);
                            setUserRating(null);
                            setMenuOpen(false);
                          }}
                          className="block w-full px-4 py-2 text-left hover:bg-slate-600"
                        >
                          Delete rating
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {(userRating === null || isEditing) && (
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={inputRating}
                    onChange={(e) => {
                      setInputRating(e.target.value);
                    }}
                    className="w-24 rounded border border-slate-600 bg-slate-700 px-3 py-2 text-white"
                  />

                  <button
                    onClick={async () => {
                      const num = Number(inputRating);

                      const clamped = Math.max(0, Math.min(100, num));

                      await rateAlbum(
                        id!,
                        clamped,
                        album.title,
                        album.artist,
                        album.coverUrl,
                      );

                      const newAvg = await getAverageRating(id!);
                      const newUserRating = await getUserRating(id!);

                      setAvg(newAvg);
                      setUserRating(newUserRating);
                      setInputRating("");
                      setIsEditing(false);
                    }}
                    className="rounded bg-blue-600 px-4 py-2 hover:bg-blue-500"
                  >
                    {isEditing ? "Save" : "Submit"}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <h1 className="text-5xl font-bold">{album.title}</h1>

            <Link
              to={`/artist/${album.artistId}`}
              className="size-fit mt-2 block text-xl hover:underline"
            >
              {album.artist}
            </Link>

            <p className="mt-2 text-slate-400">{album.year}</p>

            <h2 className="mt-8 mb-4 text-2xl font-semibold">Tracklist</h2>

            <ol className="space-y-2">
              {album.tracks.map((group, groupIndex) => (
                <div key={groupIndex} className="mb-8">
                  {group.title && (
                    <h3 className="mb-3 text-lg font-bold uppercase text-zinc-300">
                      {group.title}
                    </h3>
                  )}
                  {group.tracks.map((track, trackIndex) => (
                    <div key={trackIndex} className="flex items-center justify-between border-b border-slate-700 py-2">
                      <div className="flex gap-3">
                        <span className="text-zinc-500">{trackNumber++}</span>
                        <span>{track.title}</span>
                      </div>
                      <span className="text-zinc-400">{track.length}</span>
                    </div>
                  ))}
                </div>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
