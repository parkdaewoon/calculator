let SUBS: any[] = []; // ⚠️ 데모용(서버 재시작/리스타트 시 날아감)

export async function POST(req: Request) {
  const sub = await req.json();
  // 중복 방지
  if (!SUBS.find((s) => s.endpoint === sub.endpoint)) SUBS.push(sub);
  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET() {
  return new Response(JSON.stringify({ count: SUBS.length }), {
    headers: { "Content-Type": "application/json" },
  });
}