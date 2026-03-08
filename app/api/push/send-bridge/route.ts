import { NextResponse } from "next/server";
import webpush from "web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReqBody = {
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  payload: {
    title: string;
    body: string;
    url?: string;
    icon?: string;
    badge?: string;
    tag?: string;
  };
};

function ensureWebPushConfigured() {
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!subject || !publicKey || !privateKey) {
    throw new Error("Missing VAPID envs");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function POST(req: Request) {
  try {
    const secret = req.headers.get("x-bridge-secret");
    if (secret !== process.env.WEB_PUSH_BRIDGE_SECRET) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    ensureWebPushConfigured();

    const body = (await req.json()) as ReqBody;

    if (
      !body?.subscription?.endpoint ||
      !body?.subscription?.keys?.p256dh ||
      !body?.subscription?.keys?.auth
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid subscription" },
        { status: 400 }
      );
    }

    if (!body?.payload?.title || !body?.payload?.body) {
      return NextResponse.json(
        { ok: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    await webpush.sendNotification(
      body.subscription as any,
      JSON.stringify(body.payload)
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("send-bridge error:", e);
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "server error" },
      { status: 500 }
    );
  }
}