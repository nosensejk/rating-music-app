import { type GenreAlbum } from "./musicBrainz";

interface LastFmTopAlbum {
  name: string;
  artist: {
    name: string;
  };
  image: {
    size: string;
    "#text": string;
  }[];
}

export async function getAlbumCover(
  artist: string,
  album: string,
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&artist=${encodeURIComponent(
        artist,
      )}&album=${encodeURIComponent(
        album,
      )}&api_key=${import.meta.env.VITE_LASTFM_API_KEY}&format=json`,
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    const image = data.album?.image?.find(
      (img: { size: string; ["#text"]: string }) => img.size === "mega",
    )?.["#text"];

    return image || null;
  } catch {
    return null;
  }
}

export async function getAlbumTags(
  artist: string,
  album: string,
): Promise<string[]> {
  const response = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=album.getinfo&api_key=${import.meta.env.VITE_LASTFM_API_KEY}&artist=${encodeURIComponent(
      artist,
    )}&album=${encodeURIComponent(album)}&format=json`,
  );

  const data = await response.json();

  return (
    data.album?.tags?.tag
      ?.slice(0, 3)
      ?.map((tag: { name: string }) => tag.name) ?? []
  );
}

export async function getArtistTags(artist: string): Promise<string[]> {
  const response = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&api_key=${import.meta.env.VITE_LASTFM_API_KEY}&artist=${encodeURIComponent(
      artist,
    )}&format=json`,
  );

  const data = await response.json();

  console.log(data);

  return (
    data.artist?.tags?.tag
      ?.slice(0, 5)
      ?.map((tag: { name: string }) => tag.name) ?? []
  );
}

export async function getTopAlbumsByTag(tag: string): Promise<GenreAlbum[]> {
  const response = await fetch(
    `https://ws.audioscrobbler.com/2.0/?method=tag.gettopalbums&tag=${encodeURIComponent(
      tag,
    )}&api_key=${import.meta.env.VITE_LASTFM_API_KEY}&format=json`,
  );

  const data = await response.json();

  const albums = await Promise.all(
    (data.albums?.album ?? [])
      .slice(0, 18)
      .map(async (album: LastFmTopAlbum) => {
        try {
          const mbResponse = await fetch(
            `https://musicbrainz.org/ws/2/release-group/?query=artist:${encodeURIComponent(
              album.artist.name,
            )} AND releasegroup:${encodeURIComponent(
              album.name,
            )}&fmt=json&limit=1`,
          );

          const mbData = await mbResponse.json();
          const releaseGroup = mbData["release-groups"]?.[0];

          if (!releaseGroup) return null;
          return {
            id: releaseGroup.id,
            title: album.name,
            artist: album.artist.name,
            year:
              releaseGroup["first-release-date"]?.split("-")[0] ?? "Unknown",
            image:
              album.image?.find((img) => img.size === "large")?.["#text"] ?? "",
          };
        } catch (error) {
          console.error(error);
          return null;
        }
      }),
  );

  return albums.filter((album): album is GenreAlbum => album !== null);
}
