import { type Album } from "../types/album";
import { Link } from "react-router-dom";
import { useState } from "react";

interface AlbumCardProps {
  album: Album;
}

export default function AlbumCard({ album }: AlbumCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      to={`/album/${album.id}`}
      className="overflow-hidden rounded-xl border border-slate-600 bg-slate-700 transition hover:border-zinc-600"
    >
      <div className="aspect-square overflow-hidden bg-slate-800">
        {album.coverUrl && !imageError ? (
          <img
            src={album.coverUrl}
            alt={album.title}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-slate-300">
              <div className="mt-2 text-sm">No Cover</div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <h2 className="font-semibold text-zinc-200 truncate" title={album.title}>{album.title}</h2>
        <p className="mt-1 text-sm text-zinc-400 truncate" title={album.artist}>{album.artist}</p>
        <p className="mt-2 text-sm text-zinc-500">{album.year}</p>
      </div>
    </Link>
  );
}
