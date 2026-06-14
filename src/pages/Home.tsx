import TopAlbums from "../components/TopAlbums";

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="mb-16 text-center">
        <h1 className="text-5xl font-bold">
          Rate albums. <br /> Discover music.
        </h1>
        <p className="mt-6 text-lg text-slate-300">Track your favourite albums and see what other listeners think.</p>
      </section>
      <TopAlbums/>
    </div>
  );
}
