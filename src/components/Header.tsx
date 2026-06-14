import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-800/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold text-white">
          AlbumRater
        </Link>
        <div className="flex justify-between items-center gap-3">
          <Link
            to="/profile"
            className="text-zinc-300 transition hover:text-white"
          >
            Profile
          </Link>
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
