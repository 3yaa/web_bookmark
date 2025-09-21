import dotenv from "dotenv";
import { getTwitchAccessToken } from "./twitchAccessToken.js";

dotenv.config();

let twitchAccessToken = null;
let twitchTokenExpiry = null;

async function getAccessToken() {
  if (twitchAccessToken && Date.now() < twitchTokenExpiry) {
    return twitchAccessToken;
  }
  //
  const response = await getTwitchAccessToken();
  if (!response) {
    throw new Error("Failed to fetch Twitch token");
  }
  twitchAccessToken = response.access_token;
  twitchTokenExpiry = Date.now() + response.expires_in * 1000;
  return twitchAccessToken;
}

async function makeIgdbRequest(query, accessToken) {
  const url = "https://api.igdb.com/v4/games";

  return await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Client-ID": process.env.TWITCH_CLIENT_ID,
      Accept: "application/json",
    },
    body: query,
  });
}

export async function useIgdbAPI(req, res) {
  try {
    const accessToken = await getAccessToken();
    const { title, limit } = req.query;
    const url = "https://api.igdb.com/v4/games";
    const query = `
			search "${title}";
			fields 
				id, name,
				cover.image_id,
				expanded_games.id, expanded_games.name,
				expansions.id, expansions.name,
				first_release_date,
				involved_companies.company.name, involved_companies.developer, involved_companies.publisher,
				screenshots.image_id;
			limit ${limit};
		`;
    // first call
    const response = await makeIgdbRequest(query, accessToken);
    // twitch token refresh
    if (response.status === 401) {
      twitchAccessToken = null;
      const newToken = await getAccessToken();
      // second call
      const retry = await makeIgdbRequest(query, newToken);
      if (!retry.ok) {
        return res.status(retry.status).json({
          success: false,
          message: `IGDB API error after retry: ${retry.statusText}`,
        });
      }
    } else if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        message: `IGDB API error: ${response.statusText}`,
        error: "IGDB API failure",
      });
    }
    // data clean
    const data = await response.json();
    const games = Array.isArray(data) ? data : [];
    const processedGames = games.map((game) => {
      return {
        igdbId: game.id,
        title: game.name,
        released_year: new Date(game.first_release_date * 1000).getFullYear(),
        cover_url: game.cover
          ? `https://images.igdb.com/igdb/image/upload/t_original/${game.cover.image_id}.jpg`
          : null,
        developer: (game.involved_companies || [])
          .filter((company) => company.developer)
          .map((company) => ({ name: company.company.name })),
        expansions: game.expansions,
        screenshot_urls: (game.screenshots || []).map((ss) => ({
          ss_url: `https://images.igdb.com/igdb/image/upload/t_original/${ss.image_id}.jpg`,
        })),
      };
    });
    //
    res.status(200).json({
      success: true,
      count: processedGames.length,
      data: processedGames,
    });
  } catch (error) {
    console.error("IGDB fetch failed: ", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch game from IGDB",
      error: error.message,
    });
  }
}
