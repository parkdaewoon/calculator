export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// NOTE:
// 일정 알림 전송은 /api/jobs/send-shift-reminders 에서 통합 처리합니다.
// 이 엔드포인트는 중복 발송 방지를 위해 성공 no-op 응답만 반환합니다.

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json(
      {
        ok: false,
        error: "Unauthorized",
        got: auth,
        expectedExists: !!process.env.CRON_SECRET,
      },
      { status: 401 }
    );
  }
  return Response.json({ ok: true, sent: 0, skipped: "deprecated-route" });
}

