import { GameProps, IGDBProps, IGDBDlcProps } from "@/types/game";

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
    backdropUrls: dataGame.screenshot_urls?.map((item) => item.ss_url) || [],
    curBackdropIndex: 1,
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
    backdropUrls: dataDlc.screenshot_urls?.map((item) => item.ss_url) || [],
    curBackdropIndex: 1,
  };
}

export function cleanName(
  title: string | undefined,
  seriesTitle: string | undefined
) {
  if (!title || !seriesTitle) {
    return title;
  }
  //in the case series and title are the same
  if (title.trim() === seriesTitle.trim()) {
    return title;
  }
  //
  return (
    title
      .replace(`${seriesTitle}`, "")
      // Remove common separators at start
      .replace(/^[\s\-\–\—:;,\.\|#]*/, "")
      // Remove book/volume indicators
      .replace(
        /^(Book|Vol|Volume|Part|Episode|Chapter|No|Number)[\s\d\.\-:#]*/,
        ""
      )
      // Remove leading numbers with separators
      .replace(/^\d+[\s\-\.\):]*/, "")
      // Remove connecting words like "and the", "and", "&", "the"
      .replace(/^(and the|and|&)\s+/i, "")
      .trim()
  );
}
