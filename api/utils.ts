import "dotenv/config";

export function getBaseUrl() {
  return process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}/api`
    : `http://localhost:3000/api`;
}
