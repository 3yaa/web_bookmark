export type SortConfig = {
  type: "title" | "score" | "dateCompleted" | "developer" | "dateReleased";
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
  rawgId: string; //!--REQUIRED
  title: string; //!--REQUIRED
  developer?: string;
  dateReleased?: number;
  images?: string[];
}

// for both dlcs and rawg
export interface RAWGInitProps {
  rawgId: string;
  title: string;
}

export interface RAWGDetailsProps {
  released?: string;
  background_image?: string;
  background_image_additional?: string;
  developer?: string;
}
