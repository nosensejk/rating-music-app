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


