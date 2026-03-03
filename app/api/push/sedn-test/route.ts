import webpush from "web-push";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || "mailto:test@example.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  const { subscription } = await req.json();

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
}