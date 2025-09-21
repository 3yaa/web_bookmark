import dotenv from "dotenv";

dotenv.config();

export async function getTwitchAccessToken() {
  try {
    const response = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: `${process.env.TWITCH_CLIENT_ID}`,
        client_secret: `${process.env.TWITCH_CLIENT_SECRET}`,
        grant_type: "client_credentials",
      }),
    });
    //
    if (!response.ok) {
      console.error(`TWITCH API error: ${response.statusText}`);
      return null;
    }
    //
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("TWITCH auth failed: ", error);
    return;
  }
}
