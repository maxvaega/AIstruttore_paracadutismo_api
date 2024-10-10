import "dotenv/config";
import OpenAI from "openai";

export class AssistantClient {
  private client: OpenAI;
  private assistantId = process.env.OPENAI_ASSISTANT_ID;
  private threadId: string;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_TOKEN,
    });
  }

  setup(threadId: string) {
    this.threadId = threadId;
  }

  public sendMessage(content: string) {
    return this.client.beta.threads.messages.create(this.threadId, {
      role: "user",
      content,
    });
  }

  public run() {
    return this.client.beta.threads.runs.create(this.threadId, {
      assistant_id: this.assistantId,
      tool_choice: {
        type: "file_search",
      },
      truncation_strategy: {
        type: "last_messages",
        last_messages: 2,
      },
    });
  }

  public delay() {
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

  public retrieveRun(runId: string) {
    return this.client.beta.threads.runs.retrieve(this.threadId, runId);
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

    console.log(
      "after cycle on response status is",
      response.status,
      response.last_error
    );
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

  public async popLastMessage(runId: string) {
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
