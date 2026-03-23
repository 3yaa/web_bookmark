import { GameProps, IGDBProps, IGDBDlcProps } from "@/types/game";
import { cleanName } from "@/utils/cleanName";

export function resetGameValues(book: Partial<GameProps>): Partial<GameProps> {
  return {
    id: book.id,
    igdbId: book.igdbId,
    title: "",
    score: undefined,
    dateCompleted: undefined,
    note: undefined,
    studio: undefined,
    dateReleased: undefined,
    dlcIndex: undefined,
    dlcs: undefined,
    status: "Playing",
  };
}

export function mapIGDBDataToGame(dataGame: IGDBProps): Partial<GameProps> {
  return {
    igdbId: dataGame.igdbId,
    title: dataGame.title,
    dateReleased: dataGame.released_year,
    posterUrl: dataGame.cover_url,
    studio: dataGame.developer?.[0]?.name,
    dlcs: [
      { id: dataGame.igdbId, name: dataGame.title },
      ...(dataGame.expansions?.map((dlc) => ({
        id: dlc.id,
        name: cleanName(dlc.name, dataGame.title),
      })) || []),
    ],
    dlcIndex: 0,
  };
}

export function mapIGDBDlcsDataToGame(
  dataDlc: IGDBDlcProps,
  mainTitle: string
): Partial<GameProps> {
  return {
    igdbId: dataDlc.igdbId,
    title: cleanName(dataDlc.title, mainTitle),
    dateReleased: dataDlc.released_year,
    posterUrl: dataDlc.cover_url,
    studio: dataDlc.developer?.[0]?.name,
  };
}
