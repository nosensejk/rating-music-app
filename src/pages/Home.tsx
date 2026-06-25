import { Link } from "react-router-dom";
import TopAlbums from "../components/TopAlbums";

export default function Home() {
  const popularGenres = [
    "Alternative Rock",
    "Rock",
    "Indie Rock",
    "Hip Hop",
    "Jazz",
    "Electronic",
    "Metal",
    "Post-Rock",
    "Progressive Rock",
    "Shoegaze",
    "Ambient",
    "Experimental",
  ];

  return (
    <div className="bg-slate-800">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <section className="mb-16 text-center">
          <h1 className="text-5xl font-bold text-zinc-200">
            Rate albums. <br /> Discover music.
          </h1>
          <p className="mt-6 text-lg text-slate-300">
            Track your favourite albums and see what other listeners think.
          </p>
        </section>
        <TopAlbums />
        <section className="mt-12">
          <h2 className="mb-6 text-3xl font-bold text-white">Popular Genres</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {popularGenres.map((genre) => (
              <Link
                key={genre}
                to={`/genre/${encodeURIComponent(genre)}`}
                className="rounded-xl border border-slate-700 bg-slate-800 p-6 text-center text-lg font-semibold text-white transition hover:border-slate-500 hover:bg-slate-700"
              >
                {genre}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
