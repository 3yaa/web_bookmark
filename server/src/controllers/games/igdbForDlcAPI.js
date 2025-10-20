import { makeIgdbRequestWithRety } from "./igdbInternal/igdbAPI.js";
import { checkDuplicate } from "../../utils/checkDuplicate.js";

export async function useIgdbForDlcAPI(req, res) {
  try {
    const igdbId = req.query.igdbId;
    const query = `
			where id = ${igdbId};
			fields 
				id, name,
				cover.image_id,
				expanded_games.id, expanded_games.name,
				expansions.id, expansions.name,
				first_release_date,
				involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
				screenshots.image_id;
		`;
    // call
    const response = await makeIgdbRequestWithRety(query);
    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: `IGDB-DLC API error: ${response.statusText}`,
        error: "IGDB-DLC API failure",
      });
    }
    // data clean
    const data = await response.json();
    const dlcs = data || [];
    const processedDlc = dlcs.map((dlc) => {
      return {
        igdbId: dlc.id,
        title: dlc.name,
        released_year: new Date(dlc.first_release_date * 1000).getFullYear(),
        cover_url: dlc.cover
          ? `https://images.igdb.com/igdb/image/upload/t_1080p/${dlc.cover.image_id}.jpg`
          : null,
        developer: (dlc.involved_companies || [])
          .filter((company) => company.developer)
          .map((company) => ({ name: company.company.name })),
        screenshot_urls: (dlc.screenshots || []).map((ss) => ({
          ss_url: `https://images.igdb.com/igdb/image/upload/t_1080p/${ss.image_id}.jpg`,
        })),
      };
    });
    // check for duplicate
    const isDuplicate = await checkDuplicate(
      "games",
      "igdb_id",
      processedDlc.igdbId
    );
    if (isDuplicate) {
      return res.status(409).json({
        success: false,
        title: processedDlc.title,
        message: `Dlc "${processedDlc.title}" already in your library`,
        error: "Duplicate found",
      });
    }
    //
    res.status(200).json({
      success: true,
      data: processedDlc,
    });
  } catch (error) {
    console.error("IGDB-DLC fetch failed: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch DLC from IGDB",
      error: error.message,
    });
  }
}
