import dotenv from "dotenv";

dotenv.config();

let twitchAccessToken = null;
let twitchTokenExpiry = null;

// get access token
async function getTwitchAccessToken() {
  try {
    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    });
    //
    if (!response.ok) {
      console.error(`Twitch API error: ${response.statusText}`);
      throw new Error(`Failed to get Twitch token: ${response.statusText}`);
    }
    //
    return await response.json();
  } catch (error) {
    console.error("Twitch auth failed: ", error);
    return;
  }
}

// check if token expired
export async function getAccessToken() {
  // token still valid
  if (twitchAccessToken && Date.now() < twitchTokenExpiry) {
    return twitchAccessToken;
  }
  // get new token
  const response = await getTwitchAccessToken();
  twitchAccessToken = response.access_token;
  // 60 sec buffer
  twitchTokenExpiry = Date.now() + (response.expires_in - 60) * 1000;
  //
  return twitchAccessToken;
}

export function resetToken() {
  twitchAccessToken = null;
  twitchTokenExpiry = null;
}
