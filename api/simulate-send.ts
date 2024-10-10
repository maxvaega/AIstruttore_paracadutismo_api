import "dotenv/config";
import type { VercelRequest } from "@vercel/node";
import axios from "axios";
import { getBaseUrl } from "./utils.js";

// example => http://localhost:3000/api/simulate-send?personId=1063423088051438&messageText=come%20si%20fa%20deriva
// const idDiego = "1063423088051438";
// const idMax = "1591457695102340";
export async function GET(request: VercelRequest) {
  const idBot = "17841469430276251";

  const { searchParams } = new URL(request.url as string);
  const messageText = searchParams.get("messageText");
  const personId = searchParams.get("personId");

  if (!personId) {
    return new Response(
      `simulate-send => personId: ${personId}, messageText: ${messageText} `,
      {
        status: 401,
      }
    );
  }

  const url = `${getBaseUrl()}/messaging-webhook`;

  await axios.post(url, {
    object: "instagram",
    entry: [
      {
        time: 1728404620418, // can be removed
        id: idBot, // can be removed
        messaging: [
          {
            sender: { id: personId },
            recipient: { id: idBot },
            timestamp: 1728404619889, // can be removed
            message: {
              text: messageText,
            },
          },
        ],
      },
    ],
  });
  return new Response(`send: ${messageText}`);
}
