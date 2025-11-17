import { MovieProps } from "@/types/movie";

interface MovieConfigProps {
  Movie: MovieProps;
  isLoading?: { isTrue: boolean; style: string; text: string };
  onUpdate: (
    movieId: number,
    updates?: Partial<MovieProps>,
    takeAction?: boolean
  ) => void;
  addMovie?: () => void;
  showSequelPrequel?: (sequelTitle: string) => void;
  showAnotherSeries?: (seriesDir: "left" | "right") => void;
}

export function MovieConfigMobile() {}
