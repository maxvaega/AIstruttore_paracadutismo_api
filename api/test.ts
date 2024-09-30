import type { VercelRequest, VercelResponse } from "@vercel/node";

export async function GET(request: VercelRequest) {
  return new Response(`Hi ${Math.random()}`);
}
