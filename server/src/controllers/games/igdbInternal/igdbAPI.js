import dotenv from "dotenv";
import { resetToken, getAccessToken } from "./twitchAccessToken.js";

dotenv.config();

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

export async function makeIgdbRequestWithRety(query) {
  try {
    // first attempt
    const accessToken = await getAccessToken();
    let response = await makeIgdbRequest(query, accessToken);
    // second attempt
    if (response.status === 401) {
      resetToken();
      const newToken = await getAccessToken();
      response = await makeIgdbRequest(query, newToken);
    }
    //
    return response;
  } catch (error) {
    console.error("IGDB API request failed:", error);
    throw error;
  }
}
