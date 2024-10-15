import axios from "axios";
import { FacebookMessage } from "../app/types";
import { API_VERSION } from "@/app/const";

export function sendMessageToUser(personId: string, message: string) {
  return axios.post<{
    recipient_id: string;
    message_id: string;
  }>(
    `https://graph.facebook.com/${API_VERSION}/${process.env.PAGE_ID}/messages`,
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

export async function sendSequenceMessageToUser(
  personId: string,
  messages: string[]
) {
  let count = 0;
  while (count < messages.length) {
    await sendMessageToUser(personId, messages[count]);
    count++;
  }
}

export function fetchmessage(messageId: string) {
  return axios.get<FacebookMessage>(
    `https://graph.facebook.com/${API_VERSION}/${messageId}`,
    {
      params: {
        fields: "id,created_time,from,to,message",
        access_token: process.env.ACCESS_TOKEN,
      },
    }
  );
}

export function getBaseUrl() {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api`
    : `http://localhost:3000/api`;
}
