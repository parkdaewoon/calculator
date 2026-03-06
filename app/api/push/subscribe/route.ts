export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PushSubscriptionLike = {
  endpoint: string;
  expirationTime?: number | null;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

let SUBS: PushSubscriptionLike[] = []; // 데모용

export async function POST(req: Request) {
  try {
    const sub = (await req.json()) as PushSubscriptionLike;

    if (!sub?.endpoint) {
      return new Response(
        JSON.stringify({ ok: false, error: "Invalid subscription" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!SUBS.find((s) => s.endpoint === sub.endpoint)) {
      SUBS.push(sub);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        count: SUBS.length,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: e?.message || String(e),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET() {
  return new Response(
    JSON.stringify({
      ok: true,
      count: SUBS.length,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}