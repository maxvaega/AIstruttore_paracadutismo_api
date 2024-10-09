import "dotenv/config";
import type { VercelRequest } from "@vercel/node";
import axios from "axios";

export async function GET(request: VercelRequest) {
  const { searchParams } = new URL(request.url as string);
  const msg =
    searchParams.get("msg") ||
    "please add ?msg=qualcosa&to=diego|max in the url";
  const toPerson = searchParams.get("to") || "diego";
  let toId = "";
  const psIdDiego = "1063423088051438";
  if (toPerson === "diego") {
    toId = psIdDiego;
  } else if (toPerson === "max") {
    toId = "1591457695102340";
  } else {
    toId = psIdDiego;
  }

  const endpoint = "/api/messaging-webhook";
  const url = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}${endpoint}`
    : `http://localhost:3000${endpoint}`;

  console.log("simulate send with url:", url);
  await axios.post(url, {
    object: "instagram",
    entry: [
      {
        time: 1728404620418, // can be removed
        id: "17841469430276251", // can be removed
        messaging: [
          {
            sender: { id: toId },
            recipient: { id: "17841469430276251" },
            timestamp: 1728404619889, // can be removed
            message: {
              text: msg,
            },
          },
        ],
      },
    ],
  });
  return new Response(`send: ${msg}`);
}
