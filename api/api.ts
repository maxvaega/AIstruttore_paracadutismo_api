import "dotenv/config";
import axios from "axios";

export function sendMessageToUser(personId: string, message: string) {
  console.log("#### handle from", personId, "message:", message);
  return axios.post(
    `https://graph.facebook.com/v20.0/${process.env.PAGE_ID}/messages`,
    {
      recipient: {
        id: personId,
      },
      messaging_type: "RESPONSE",
      message: {
        text: message,
      },
      access_token: process.env.ACCESS_TOKEN,
    }
  );
}
