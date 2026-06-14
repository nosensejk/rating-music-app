import { type Album } from "../types/album";
import { Link } from "react-router-dom";

interface AlbumCardProps {
  album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  return (
    <Link to={`/album/${album.id}`}
      className="overflow-hidden rounded-xl border border-slate-600 bg-slate-700 transition hover:scale-[1.03] hover:border-zinc-600"
    >
      <img
        src={album.coverUrl}
        alt={album.title}
        className="aspect-square w-full object-cover"
        onError={(e) => {
          e.currentTarget.src = "https://placehold.co/500x500?text=No+Cover";
        }}
      />
      <div className="p-4">
        <h2 className="font-semibold">{album.title}</h2>
        <p className="mt-1 text-sm text-zinc-400">{album.artist}</p>
        <p className="mt-2 text-sm text-zinc-500">{album.year}</p>
      </div>
    </Link>
  );
}
