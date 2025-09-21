export type SortConfig = {
  type: "title" | "score" | "dateCompleted" | "studio" | "dateReleased";
  order: "asc" | "desc";
};

export interface GameProps {
  id: number; //--REQUIRED -> will do on server side
  // user set
  score?: number;
  dateCompleted?: Date | null;
  note?: string;
  status: "Playing" | "Completed"; //!--REQUIRED
  // from rawg
  igdbId: number; //!--REQUIRED
  title: string; //!--REQUIRED
  studio?: string;
  dateReleased?: number;
  posterUrl?: string;
  backdropUrls?: string[];
  curBackdropIndex: number;
  //
  dlcIndex: number;
  mainTitle?: string;
  dlcs?: IGDBInitProps[]; // 0 for original game
}

export interface IGDBInitProps {
  id?: number;
  name?: string;
}

export interface IGDBProps {
  igdbId: number;
  title: string;
  released_year?: number;
  cover_url?: string;
  developer?: { name: string }[];
  expansions?: IGDBInitProps[];
  screenshot_urls?: { ss_url: string }[];
}

export interface IGDBDlcProps {
  igdbId: number;
  title: string;
  released_year?: number;
  cover_url?: string;
  developer?: { name: string }[];
  screenshot_urls?: { ss_url: string }[];
}
