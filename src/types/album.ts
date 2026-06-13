export interface Album {
   id: string;
   title: string;
   artist: string;
   year: string;
   coverUrl: string;
}

export interface AlbumDetails extends Album {
   tracks: string[];
}