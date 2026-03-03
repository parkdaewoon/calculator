export async function GET() {
  return new Response(
    JSON.stringify({ key: process.env.VAPID_PUBLIC_KEY }),
    { headers: { "Content-Type": "application/json" } }
  );
}