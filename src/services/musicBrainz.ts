import { type Album, type AlbumDetails } from "../types/album";

interface MusicBrainzAlbum {
  id: string;
  title: string;
  "artist-credit"?: {
    name: string;
  }[];
  "first-release-date"?: string;
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

export async function searchAlbums(
  query: string,
  signal?: AbortSignal,
): Promise<Album[]> {
  const safeQuery = sanitizeQuery(query);
  const response = await fetch(
    `https://musicbrainz.org/ws/2/release-group?query=${encodeURIComponent(
      `artist:${safeQuery}`,
    )}&fmt=json`,
    { signal },
  );

  const data = await response.json();

  return data["release-groups"].map((album: MusicBrainzAlbum) => ({
    id: album.id,
    title: album.title,
    artist: album["artist-credit"]?.[0]?.name || "Unknown",
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
  console.log(releaseData);

  return {
    id: releaseGroupId,
    title: releaseData.title,
    artist: releaseData["artist-credit"]?.[0]?.name || "Unknown",
    year: releaseData.date?.split("-")[0] || "Unknown",
    coverUrl: `https://coverartarchive.org/release/${release.id}/front`,
    tracks:
      releaseData.media?.[0]?.tracks?.map(
        (track: { title: string; length?: number }) => ({
          title: track.title,
          length: formatTrackLength(track.length),
        }),
      ) || [],
  };
}
