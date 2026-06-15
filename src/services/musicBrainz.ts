import { type Album, type AlbumDetails } from "../types/album";

interface MusicBrainzAlbum {
  id: string;
  title: string;
  "primary-type"?: string;
  "secondary-types"?: string;
  "artist-credit"?: {
    name: string;
    artist?: {
      id: string;
    };
  }[];
  "first-release-date"?: string;
}

interface MusicBrainzArtist {
  id: string;
  name: string;
}

function sanitizeQuery(query: string) {
  return query.replace(/['"]/g, "").trim();
}

function formatTrackLength(ms?: number) {
  if (!ms) return "--:--";
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

async function searchArtists(query: string, signal?: AbortSignal) {
  const response = await fetch(
    `https://musicbrainz.org/ws/2/artist?query=${encodeURIComponent(query)}&fmt=json&limit=5`,
    { signal },
  );

  const data = await response.json();

  return data.artists as MusicBrainzArtist[];
}

export async function getArtist(artistId: string) {
  const response = await fetch(
    `https://musicbrainz.org/ws/2/artist/${artistId}?fmt=json`
  );

  const data = await response.json();

  return {
    id: data.id,
    name: data.name,
  };
}

export async function getArtistAlbums(artistId: string): Promise<Album[]> {
  const response = await fetch(
    `https://musicbrainz.org/ws/2/release-group?artist=${artistId}&fmt=json&limit=100`,
  );

  const data = await response.json();

  
  return data["release-groups"].map((album: MusicBrainzAlbum) => ({
    id: album.id,
    title: album.title,
    artistId: album["artist-credit"]?.[0]?.artist?.id || artistId,
    year: album["first-release-date"]?.split("-")[0] || "Unknown",
    coverUrl: `https://coverartarchive.org/release-group/${album.id}/front`,
    type: album["primary-type"] ?? "Unknown",
    secondaryTypes: album["secondary-types"] ?? [],
  }));

  
}

export async function searchAlbums(
  query: string,
  signal?: AbortSignal,
): Promise<Album[]> {
  const safeQuery = sanitizeQuery(query);
  const artists = await searchArtists(safeQuery, signal);
  if (artists.length > 0) {
    return getArtistAlbums(artists[0].id);
  }
  const response = await fetch(
    `https://musicbrainz.org/ws/2/release-group?query=${encodeURIComponent(
      safeQuery,
    )}&fmt=json`,
    { signal },
  );

  const data = await response.json();

  return data["release-groups"].map((album: MusicBrainzAlbum) => ({
    id: album.id,
    title: album.title,
    artist: album["artist-credit"]?.[0]?.name || "Unknown",
    artistId: album["artist-credit"]?.[0]?.artist?.id || "",
    year: album["first-release-date"]?.split("-")[0] || "Unknown",
    coverUrl: `https://coverartarchive.org/release-group/${album.id}/front`,
  }));
}

export async function getAlbumDetails(
  releaseGroupId: string,
): Promise<AlbumDetails> {
  const releasesResponse = await fetch(
    `https://musicbrainz.org/ws/2/release-group/${releaseGroupId}?inc=releases+artist-credits&fmt=json`,
  );
  const releasesData = await releasesResponse.json();
  const release = releasesData.releases?.[0];

  if (!release) {
    throw new Error("Release not found");
  }

  const releaseResponse = await fetch(
    `https://musicbrainz.org/ws/2/release/${release.id}?inc=recordings+artist-credits&fmt=json`,
  );

  const releaseData = await releaseResponse.json();

  return {
    id: releaseGroupId,
    title: releaseData.title,
    type: releaseData["primaty-type"] ?? "Unknown",
    secondaryTypes: releaseData["secondary-types"] ?? [],
    artist: releaseData["artist-credit"]?.[0]?.name || "Unknown",
    artistId: releaseData["artist-credit"]?.[0]?.artist?.id || "",
    year: releaseData.date?.split("-")[0] || "Unknown",
    coverUrl: `https://coverartarchive.org/release-group/${releaseGroupId}/front`,
    tracks:
      releaseData.media?.[0]?.tracks?.map(
        (track: { title: string; length?: number }) => ({
          title: track.title,
          length: formatTrackLength(track.length),
        }),
      ) || [],
  };
}
