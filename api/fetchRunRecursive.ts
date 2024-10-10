import { AssistantClient } from "./openai.js";
import axios from "axios";
import { getBaseUrl } from "./utils.js";
import { waitUntil } from "@vercel/functions";
import { sendMessageToUser } from "./api.js";

export async function POST(request: Request) {
  const body = await request.json();
  const runId: string | undefined = body.runId;
  const messageText: string | undefined = body.messageText;
  const personId: string | undefined = body.personId;
  const threadId: string | undefined = body.threadId;

  if (!runId || !messageText || !personId || !threadId) {
    return new Response(
      `fetchRunRecursive => runId: ${runId}, messageText: ${messageText}, personId: ${personId}, threadId: ${threadId}`,
      {
        status: 401,
      }
    );
  }

  const client = new AssistantClient();
  client.setup(threadId);

  await client.delay();
  const response = await client.retrieveRun(runId);
  if (response.status === "in_progress" || response.status === "queued") {
    console.log("status is", response.status, " => fetch again :(");
    // call again
    const url = `${getBaseUrl()}/fetchRunRecursive`;

    waitUntil(
      axios.post(url, {
        runId,
        messageText,
        personId,
        threadId,
      })
    );

    return new Response("OK", { status: 200 });
  }

  const notifyError = () =>
    sendMessageToUser(personId, "C'è stato un errore, contatta il supporto");

  if (response.status !== "completed") {
    waitUntil(notifyError());
    return new Response(
      `runId: ${runId}, terminates with status ${response.status}`,
      { status: 400 }
    );
  }

  // completed
  console.log(threadId, "has completed");
  try {
    const lastMessage = await client.popLastMessage(runId);
    const messageType = lastMessage.content[0].type;
    console.log("text message is", lastMessage);
    if (messageType === "text") {
      console.log("enter on if");
      const answer = lastMessage.content[0].text.value.slice(0, 1000);
      console.log("answer is", answer);
      // waitUntil(sendMessageToUser(personId, answer));
    } else {
      // waitUntil(notifyError());
      // throw new Error(
      //   `runId: ${runId}, lastMessage was of type ${messageType}`
      // );
    }
  } catch (e) {
    // waitUntil(notifyError());
    // return new Response("error generic", { status: 400 });
  }

  return new Response("OK", { status: 200 });
}
