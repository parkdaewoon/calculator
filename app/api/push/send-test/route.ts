import webpush from "web-push";

function ensureWebPushConfigured() {
  const subject = process.env.VAPID_SUBJECT || "mailto:pwbw06@naver.com";
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  // ✅ 빌드 타임에 죽지 않게: 요청 시점에만 체크
  if (!publicKey || !privateKey) {
    throw new Error(
      "Missing VAPID keys. Set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in environment variables."
    );
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function POST(req: Request) {
  try {
    ensureWebPushConfigured();

    const { subscription } = await req.json();
    if (!subscription?.endpoint) {
      return new Response(JSON.stringify({ ok: false, error: "No subscription" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: "공무원 노트",
        body: "테스트 알림입니다!",
        url: "/",
      })
    );

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ ok: false, error: e?.message || "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}