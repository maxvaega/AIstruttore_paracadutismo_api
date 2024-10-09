export interface FacebookMessage {
  id: string;
  created_time: string;
  from: { username: string; id: string };
  to: { data: Array<{ username: string; id: string }> };
  message: string;
}
