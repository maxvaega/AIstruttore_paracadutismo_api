import "dotenv/config";
import type { VercelRequest } from "@vercel/node";
import axios from "axios";

export async function GET(request: VercelRequest) {
  const idDiego = "1063423088051438";
  const idMax = "1591457695102340";
  const idBot = "17841469430276251";

  const { searchParams } = new URL(request.url as string);
  const msg =
    searchParams.get("msg") ||
    "please add ?msg=qualcosa&to=diego|max in the url";
  const toPerson = searchParams.get("to");

  if (!["diego", "max"].includes(toPerson)) {
    return new Response(`?to need to be one of [diego,max]`, {
      status: 400,
    });
  }

  let toId = "";

  if (toPerson === "diego") {
    toId = idDiego;
  } else if (toPerson === "max") {
    toId = idMax;
  }

  const endpoint = "/api/messaging-webhook";
  const url = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}${endpoint}`
    : `http://localhost:3000${endpoint}`;

  await axios.post(url, {
    object: "instagram",
    entry: [
      {
        time: 1728404620418, // can be removed
        id: idBot, // can be removed
        messaging: [
          {
            sender: { id: toId },
            recipient: { id: idBot },
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
