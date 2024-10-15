import { waitUntil } from "@vercel/functions";
import { fetchmessage, sendMessageToUser } from "../../../utils/api";
import { AssistantClient } from "../../openai";
import { getBaseUrl, removeMarkdown } from "../../../utils/utils";
import axios from "axios";
import { kv } from "@vercel/kv";
import { PersonInfoDb } from "../../types";

const client = new AssistantClient();

// FB will call http://localhost:3000/api/messaging-webhook?hub.mode=subscribe&hub.challenge=123&hub.verify_token=abc
export async function GET(request: Request) {
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

async function handleIstagramObj(body: any) {
  const prefix = "Mi hai chiesto ";
  let promises: Array<() => ReturnType<typeof sendMessageToUser>> = [];

  body.entry.forEach(function (entry: any) {
    entry.messaging.forEach(function (webhookEvent: any) {
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

      let senderPsid = webhookEvent.sender.id;
      console.log("i received a message from", senderPsid);
      if (!!senderPsid) {
        const msg = `${prefix}"${webhookEvent.message.text}"`;
        promises.push(() => sendMessageToUser(senderPsid, msg));
      } else {
        console.log("### NOT FOUND PSID");
      }
    });
  });

  if (promises.length === 0) {
    return Promise.resolve();
  }

  const resultList = await Promise.all(promises.map((p) => p()));
  console.log("result list lenth", resultList.length);
  console.log(resultList[0]);
  const { data } = resultList[0];

  const { data: dataMessage } = await fetchmessage(data.message_id);
  const messageText = dataMessage.message.replace(prefix, "");
  const personId = dataMessage.to.data[0].id; // horrible I know

  let threadId = "";
  console.log(new Date().toUTCString());
  const personInfo = await kv.get<PersonInfoDb>(personId);
  if (!!personInfo) {
    threadId = personInfo.thread_id;
    console.log("### trovato", threadId);
  } else {
    const { id } = await client.createThread();
    threadId = id;
    console.log("### non trovato quindi creato", id);
  }

  // update record
  await kv.set<PersonInfoDb>(personId, {
    thread_id: threadId,
    updated_at: new Date().toUTCString(),
  });
  console.log("updated thread", threadId);

  client.setup(threadId);

  const lastMessage = await client.processMessageAndWait(messageText);
  console.log("last message", lastMessage);
  if (lastMessage && lastMessage.content[0].type === "text") {
    const markdownAnswer = lastMessage.content[0].text.value.slice(0, 1000);
    const normalizedAnswer = removeMarkdown(markdownAnswer);
    await sendMessageToUser(personId, normalizedAnswer);
  }

  // await client.sendMessage(messageText);
  // const { id: runId } = await client.run();

  // console.log("for personId", personId, "we use thread", threadId);
  // const url = `${getBaseUrl()}/fetchRunRecursive`;
  // console.log(new Date().toUTCString());
  // waitUntil(
  //   axios.post(url, {
  //     runId,
  //     messageText,
  //     personId,
  //     threadId,
  //   })
  // );

  return Promise.resolve();

  // try {
  //   promises = [];
  //   console.log("answer at", messateText);
  //   const res = await client.processMessageAndWait(messateText);
  //   res.content
  //     .filter((c) => c.type === "text")
  //     .filter((c) => !!c.text)
  //     .forEach((content) => {
  //       if (content.text) {
  //         // this check is usefull but typescript at build time generate error
  //         promises.push(() => {
  //           const textFormatted = content.text.value.substring(0, 1000); // .substring(0, 20);
  //           return sendMessageToUser(personId, textFormatted);
  //         });
  //       }
  //     });
  // } catch (e) {
  //   console.error(e);
  // }

  // await Promise.all(promises.map((p) => p()));
}

async function verifyRequestSignature(_: Request) {
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
