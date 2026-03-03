import webpush from "web-push";

function ensureWebPushConfigured() {
  const subject = process.env.VAPID_SUBJECT || "mailto:test@example.com";
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error("Missing VAPID keys (VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY).");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function POST(req: Request) {
  try {
    ensureWebPushConfigured();

    const { subscription } = await req.json();

    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title: "공무원 노트", body: "테스트 알림입니다!", url: "/" })
    );

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}