export interface FacebookMessage {
  id: string;
  created_time: string;
  from: { username: string; id: string };
  to: { data: Array<{ username: string; id: string }> };
  message: string;
}

export interface PersonInfoDb {
  updated_at: string;
  thread_id: string;
}

export type OpenAiPollingbehavior = "recursive" | "long-task";
