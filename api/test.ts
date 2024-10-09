import type { VercelRequest } from "@vercel/node";

export async function GET(_: VercelRequest) {
  return new Response(`Hi ${Math.random()}`);
}
