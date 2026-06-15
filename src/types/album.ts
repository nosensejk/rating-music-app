export interface Album {
   id: string;
   title: string;
   artist: string;
   artistId: string;
   year: string;
   coverUrl: string;
   type: string;
   secondaryTypes: string[];
}

export interface Track {
   title: string;
   length: string;
}

export interface AlbumDetails extends Album {
   tracks: Track[];
}