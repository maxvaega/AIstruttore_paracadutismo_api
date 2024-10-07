import { waitUntil } from "@vercel/functions";
import type { VercelRequest } from "@vercel/node";
import axios from "axios";
import crypto from "node:crypto";

// FB will call http://localhost:3000/api/messaging-webhook?hub.mode=subscribe&hub.challenge=123&hub.verify_token=abc
export async function GET(request: VercelRequest) {
  const { searchParams } = new URL(request.url as string);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Check if a token and mode is in the query string of the request
  if (mode && token && challenge) {
    // Check the mode and token sent is correct
    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
      // Respond with the challenge token from the request
      console.log("WEBHOOK_VERIFIED");
      return new Response(challenge as string, { status: 200 });
    } else {
      // Respond with '403 Forbidden' if verify tokens do not match
      return new Response("FORBIDDEN", { status: 403 });
    }
  } else {
    console.log("missing 'mode' and 'token'");
    return new Response("FORBIDDEN", { status: 403 });
  }
}

export async function POST(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    verifyRequestSignature(request);
  }

  const body = await request.json();
  if (body.object === "instagram") {
    waitUntil(handleIstagramObj(body));
    return new Response("EVENT_RECEIVED - instagram", { status: 200 });
  } else {
    return new Response("WRONG EVENT_RECEIVED", { status: 404 });
  }
}

function handleIstagramObj(body: any) {
  const promises: Array<() => Promise<unknown>> = [];

  body.entry.forEach(function (entry) {
    entry.messaging.forEach(function (webhookEvent) {
      // Discard uninteresting events
      if ("read" in webhookEvent) {
        console.log("Got a read event");
        return;
      } else if ("delivery" in webhookEvent) {
        console.log("Got a delivery event");
        return;
      } else if (webhookEvent.message && webhookEvent.message.is_echo) {
        console.log(
          "Got an echo of our send, mid = " + webhookEvent.message.mid
        );
        return;
      } else if (webhookEvent.message && webhookEvent.message.is_deleted) {
        console.log("Got a deleted messag");
        return;
      }
      if (!webhookEvent.message) {
        console.log("Cannot find message");
        return;
      }

      if (!webhookEvent.message.text) {
        console.log("cannot process not textual message");
        return;
      }

      // console.dir(entry, { depth: null });
      let senderPsid = webhookEvent.sender.id;
      if (!!senderPsid) {
        const msg = webhookEvent.message.text;
        console.log("handle from", senderPsid, "mesh:", msg);

        promises.push(() =>
          axios.post(
            `https://graph.facebook.com/v20.0/${process.env.PAGE_ID}/messages`,
            {
              recipient: {
                id: senderPsid,
              },
              messaging_type: "RESPONSE",
              message: {
                text: msg,
              },
              access_token: process.env.ACCESS_TOKEN,
            }
          )
        );
      } else {
        console.log("### NOT FOUND PSID");
      }
    });
  });

  return Promise.all(promises.map((p) => p()));
}

async function verifyRequestSignature(req: Request) {
  return true;
  // todo
  //   var signature = req.headers.get("x-hub-signature");
  //   if (!signature) {
  //     console.warn(`Couldn't find "x-hub-signature" in headers.`);
  //   } else {
  //     var elements = signature.split("=");
  //     console.log(elements);
  //     var signatureHash = elements[1];
  //     var expectedHash = crypto
  //       .createHmac("sha1", process.env.APP_SECRET as string)
  //       .update(Buffer.from(req.body))
  //       .digest("hex");
  //     if (signatureHash != expectedHash) {
  //       throw new Error("Couldn't validate the request signature.");
  //     }
  //   }
}
