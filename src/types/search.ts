import { type Album } from "./album";

export interface SearchResult {
   artist: {
      id: string;
      name: string;
   } | null;

   releases: Album[];
}