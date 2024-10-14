export async function GET(_: Request) {
  return new Response(`Hi ${Math.random()}`);
}
