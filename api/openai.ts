import "dotenv/config";
import OpenAI from "openai";

export class AssistantClient {
  private client: OpenAI;
  private assistantId = "asst_G0ltgxAwkOCz3ylXV6OAHrgS";
  private threadId: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_TOKEN,
    });
  }

  setup(threadId: string) {
    this.threadId = threadId;
  }

  private sendMessage(content: string) {
    return this.client.beta.threads.messages.create(this.threadId, {
      role: "user",
      content,
    });
  }

  private run() {
    return this.client.beta.threads.runs.create(this.threadId, {
      assistant_id: this.assistantId,
    });
  }

  private delay() {
    return new Promise((resolve) => setTimeout(resolve, 2000));
  }

  private async runAndConsume() {
    const { id: runId } = await this.run();
    // Create a response
    let response = await this.client.beta.threads.runs.retrieve(
      this.threadId,
      runId
    );

    // Wait for the response to be ready
    while (response.status === "in_progress" || response.status === "queued") {
      console.log("waiting...", response.status);
      await this.delay();
      response = await this.client.beta.threads.runs.retrieve(
        this.threadId,
        runId
      );
    }

    console.log("after cycle on response status is", response.status);
    switch (response.status) {
      case "cancelled":
        break;
      case "completed":
        break;
      case "expired":
        break;
      case "failed":
        break;
      case "incomplete":
        break;
      case "requires_action":
        break;
    }

    const messageList = await this.client.beta.threads.messages.list(
      this.threadId
    );

    // Find the last message for the current run
    const lastMessage = messageList.data
      .filter(
        (message) => message.run_id === runId && message.role === "assistant"
      )
      .pop();

    return lastMessage;
  }

  async processMessageAndWait(message: string) {
    await this.sendMessage(message);
    const res = await this.runAndConsume();
    return res;
  }
}
