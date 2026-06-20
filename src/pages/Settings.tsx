import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getProfile } from "../services/profile";
import { FiEdit2 } from "react-icons/fi";
import { isUsernameTaken } from "../services/profile";

export default function Settings() {
  const [username, setUsername] = useState("");
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const profile = await getProfile(user.id);

      if (username !== profile?.username && 
        (await isUsernameTaken(username))
      ) {
        alert("This username is already taken");
        return;
      }

      if (profile) {
        setUsername(profile.username ?? "");
        setAvatarUrl(profile.avatar_url ?? "");
        setNewUsername(profile?.username ?? "");
      }
    }

    loadProfile();
  }, []);

  async function handleSubmit() {
    if (!username.trim()) {
      alert("Username cannot be empty");
      return;
    }
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Пользователь не найден");
        return;
      }

      const { error } = await supabase.from("profiles").upsert({
        id: user.id,
        username,
        avatar_url: avatarUrl,
      });

      if (error) {
        console.error(error);
        alert(error.message);
        return;
      }

      navigate(`/u/${username}`);
    } finally {
      setLoading(false);
    }
  }

  async function uploadAvatar(file: File) {
    try {
      setUploading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: files, error: listError } = await supabase.storage
        .from("avatars")
        .list();

      if (listError) throw listError;

      const userFiles =
        files?.filter((file) => file.name.startsWith(user.id)) ?? [];

      const { data: removeData, error: removeError } = await supabase.storage
        .from("avatars")
        .remove(userFiles.map((file) => file.name));

      console.log("DELETE DATA:", removeData);
      console.log("DELETE ERROR:", removeError);

      if (userFiles.length > 0) {
        const { error: deleteError } = await supabase.storage
          .from("avatars")
          .remove(userFiles.map((file) => file.name));

        if (deleteError) {
          console.error(deleteError);
        }
      }

      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setAvatarUrl(data.publicUrl);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">Profile Settings</h1>
      <div className="mb-6 flex flex-col">
        <img
          src={avatarUrl || "https://placehold.co/200x200?text=Avatar"}
          alt="Avatar"
          className="mb-4 h-32 w-32 object-cover border border-slate-700"
        />
        <div className="inline-block">
          <label className="cursor-pointer rounded bg-slate-700 px-4 py-2 text-white hover:bg-slate-600">
            Change Avatar
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  uploadAvatar(file);
                }
              }}
            />
          </label>
        </div>
        {uploading && (
          <p className="mt-2 text-sm text-zinc-400">Uploading...</p>
        )}
      </div>
      <hr className="mb-2 border-slate-400" />
      <div className="mb-6">
        <p className="mb-1 text-xs font-bold uppercase text-zinc-400">
          Username
        </p>

        {isEditingUsername ? (
          <div className="flex items-center gap-2">
            <input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              className="rounded border border-slate-700 bg-slate-800 px-3 py-2 text-white"
            />

            <button
              onClick={() => {
                setUsername(newUsername);
                setIsEditingUsername(false);
              }}
              className="rounded bg-green-600 px-3 py-2 text-white"
            >
              Save
            </button>

            <button
              onClick={() => {
                setNewUsername(username);
                setIsEditingUsername(false);
              }}
              className="rounded bg-slate-600 px-3 py-2 text-white"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-xl text-black">{username}</span>

            <button
              onClick={() => setIsEditingUsername(true)}
              className="text-zinc-400 transition hover:text-white"
            >
              <FiEdit2 size={16} />
            </button>
          </div>
        )}
      </div>
      <hr className="mb-2 border-slate-400" />
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="rounded bg-blue-600 px-4 py-2 text-white cursor-pointer"
      >
        Save Changes
      </button>
    </div>
  );
}
