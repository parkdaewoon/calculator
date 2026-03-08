export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    key: process.env.VAPID_PUBLIC_KEY ?? null,
  });
}