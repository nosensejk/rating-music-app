import { Link, useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar";
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import { type User } from "@supabase/supabase-js";
import { signInWithGoogle } from "../services/auth";
import { hasProfile, getProfile } from "../services/profile";

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  async function checkProfile(userId: string) {
    const exists = await hasProfile(userId);

    if (!exists) {
      navigate("/setup-profile");
    }
  }

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        const profile = await getProfile(user.id);
        setUsername(profile.username);
        setAvatarUrl(profile.avatar_url ?? "");
      }
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        checkProfile(session.user.id);
        const profile = await getProfile(session.user.id);
        setUsername(profile.username);
      } else {
        setUsername("User");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700 bg-slate-800/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="text-xl font-bold text-white">
          AlbumRater
        </Link>
        <div className="flex justify-between items-center gap-3">
          {user ? (
            <div className="relative" ref={searchRef}>
              <button
                className="text-zinc-300 transition hover:text-white cursor-pointer flex items-center gap-2"
                onMouseDown={() => setIsProfileOpen(!isProfileOpen)}
              >
                <img
                  src={avatarUrl || "https://placehold.co/200x200?text=Avatar"}
                  alt={username}
                  className="h-10 w-10 rounded-full object-cover border border-slate-700 "
                />
                <p className="max-sm:hidden">@{username}</p>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 w-40 rounded-md border border-slate-700 bg-slate-800 shadow-xl">
                  <Link
                    to="/profile"
                    className="block w-full rounded px-3 py-2 text-left text-white hover:bg-slate-700"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="block w-full rounded px-3 py-2 text-left text-white hover:bg-slate-700"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full rounded px-3 py-2 text-left text-white hover:bg-slate-700 cursor-pointer"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500 cursor-pointer"
            >
              Sign In
            </button>
          )}

          <SearchBar />
        </div>
      </div>
    </header>
  );
}
