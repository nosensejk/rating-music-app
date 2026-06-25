import { type Album, type AlbumDetails } from "../types/album";
import { type SearchResult } from "../types/search";
import { getAlbumCover } from "./lastfm";

interface MusicBrainzAlbum {
  id: string;
  title: string;
  "primary-type"?: string;
  "secondary-types"?: string[];
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

export interface GenreAlbum {
  id: string;
  title: string;
  artist: string;
  image: string;
  year: string;
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
    `https://musicbrainz.org/ws/2/artist/${artistId}?fmt=json`,
  );

  const data = await response.json();

  return {
    id: data.id,
    name: data.name,
  };
}

export async function getArtistAlbums(artistId: string): Promise<Album[]> {
  const response = await fetch(
    `https://musicbrainz.org/ws/2/release-group?artist=${artistId}&fmt=json&limit=100&inc=artist-credits`,
  );

  const data = await response.json();

  return Promise.all(
    data["release-groups"].map(async (album: MusicBrainzAlbum) => {
      const artist = album["artist-credit"]?.[0]?.name || "";

      const coverUrl =
        (await getAlbumCover(artist, album.title)) ??
        `https://coverartarchive.org/release-group/${album.id}/front`;

      return {
        id: album.id,
        title: album.title,
        artist,
        artistId: album["artist-credit"]?.[0]?.artist?.id || artistId,
        year: album["first-release-date"]?.split("-")[0] || "Unknown",
        coverUrl,
        type: album["primary-type"] ?? "Unknown",
        secondaryTypes: album["secondary-types"] ?? [],
      };
    }),
  );
}

export async function searchAlbums(
  query: string,
  signal?: AbortSignal,
): Promise<SearchResult> {
  const safeQuery = sanitizeQuery(query);
  const artists = await searchArtists(safeQuery, signal);

  if (artists.length > 0) {
    const releases = await getArtistAlbums(artists[0].id);

    return {
      artist: {
        id: artists[0].id,
        name: artists[0].name,
      },
      releases,
    };
  }
  const response = await fetch(
    `https://musicbrainz.org/ws/2/release-group?query=${encodeURIComponent(
      safeQuery,
    )}&fmt=json`,
    { signal },
  );

  const data = await response.json();

  const releases = data["release-groups"].map((album: MusicBrainzAlbum) => ({
    id: album.id,
    title: album.title,
    artist: album["artist-credit"]?.[0]?.name || "Unknown",
    artistId: album["artist-credit"]?.[0]?.artist?.id || "",
    year: album["first-release-date"]?.split("-")[0] || "Unknown",
    coverUrl: `https://coverartarchive.org/release-group/${album.id}/front`,
    type: album["primary-type"] ?? "Unknown",
    secondaryTypes: album["secondary-types"] ?? [],
  }));

  return {
    artist: null,
    releases,
  };
}

export async function getAlbumDetails(
  releaseGroupId: string,
): Promise<AlbumDetails> {
  const releasesResponse = await fetch(
    `https://musicbrainz.org/ws/2/release-group/${releaseGroupId}?inc=releases+artist-credits&fmt=json`,
  );
  const releasesData = await releasesResponse.json();

  const releases = releasesData.releases ?? [];

  const release =
    releases.find(
      (r: { country?: string; status?: string }) =>
        r.country === "XW" && r.status === "Official",
    ) ||
    releases.find((r: { status?: string }) => r.status === "Official") ||
    releases[0];

  if (!release) {
    throw new Error("Release not found");
  }

  const releaseResponse = await fetch(
    `https://musicbrainz.org/ws/2/release/${release.id}?inc=recordings+artist-credits&fmt=json`,
  );

  const releaseData = await releaseResponse.json();
 
  console.log(releasesData);
  

  const artist = releaseData["artist-credit"]?.[0]?.name || "Unknown";

  const lastFmCover = await getAlbumCover(artist, releaseData.title);
  const coverUrl = lastFmCover
    ? lastFmCover
    : `https://coverartarchive.org/release-group/${releaseGroupId}/front`;

  return {
    id: releaseGroupId,
    title: releaseData.title,
    type: releasesData["primary-type"] ?? "Unknown",
    secondaryTypes: releasesData["secondary-types"] ?? [],
    artist: releaseData["artist-credit"]?.[0]?.name || "Unknown",
    artistId: releaseData["artist-credit"]?.[0]?.artist?.id || "",
    year: releasesData.releases[0].date?.split("-")[0] || "Unknown",
    coverUrl,
    tracks:
      releaseData.media?.map(
        (medium: {
          title?: string;
          tracks?: {
            title: string;
            length?: number;
          }[];
        }) => ({
          title: medium.title || "",
          tracks:
            medium.tracks?.map((track) => ({
              title: track.title,
              length: formatTrackLength(track.length),
            })) ?? [],
        }),
      ) || [],
  };
}

export async function findMusicBrainzAlbum(
  artist: string,
  title: string,
): Promise<GenreAlbum | null> {
  const response = await fetch(
    `https://musicbrainz.org/ws/2/release-group/?query=artist:${encodeURIComponent(
      artist,
    )} AND releasegroup:${encodeURIComponent(title)}&fmt=json&limit=1`,
  );

  const data = await response.json();
  const album = data["release-groups"]?.[0];

  if (!album) return null;

  const coverUrl =
    (await getAlbumCover(artist, album.title)) ??
    `https://coverartarchive.org/release-group/${album.id}/front`;

  return {
    id: album.id,
    title: album.title,
    artist,
    year: album["first-release-date"]?.split("-")[0] ?? "Unknown",
    image: coverUrl,
  };
}
