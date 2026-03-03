import { NextResponse } from "next/server";

export const runtime = "nodejs";

type HolidayItem = {
  locdate: number; // 20260301
  dateName: string;
  isHoliday?: string; // "Y"
};

function yyyymmToYearMonth(yyyymm: string) {
  const [y, m] = yyyymm.split("-").map((v) => Number(v));
  const month = String(m).padStart(2, "0");
  return { solYear: String(y), solMonth: month };
}

function safeServiceKey(raw: string) {
  // 공공데이터포털 키는 이미 인코딩된 경우가 많음
  // 디코드가 되면 디코드해서 사용(=이중인코딩 방지)
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month"); // "YYYY-MM"
  if (!month) return NextResponse.json({ error: "month required" }, { status: 400 });

  const rawKey = process.env.PUBLIC_DATA_SERVICE_KEY;
  if (!rawKey) return NextResponse.json({ error: "PUBLIC_DATA_SERVICE_KEY missing" }, { status: 500 });

  const key = safeServiceKey(rawKey);
  const { solYear, solMonth } = yyyymmToYearMonth(month);

  const url =
    "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo" +
    `?serviceKey=${key}` + // ✅ 인코딩하지 않음(이중 인코딩 방지)
    `&solYear=${solYear}` +
    `&solMonth=${solMonth}` +
    `&_type=json` +
    `&numOfRows=100`;

  const res = await fetch(url, { cache: "no-store" });
  const text = await res.text();

  // 응답이 JSON이 아닐 수도 있어서 직접 파싱
  let data: any = null;
  try {
    data = JSON.parse(text);
  } catch {
    return NextResponse.json(
      {
        error: "upstream not json",
        status: res.status,
        preview: text.slice(0, 400),
        url,
      },
      { status: 502 }
    );
  }

  if (!res.ok) {
    return NextResponse.json(
      {
        error: "upstream http error",
        status: res.status,
        body: data,
        url,
      },
      { status: 502 }
    );
  }

  const items: HolidayItem[] =
    data?.response?.body?.items?.item
      ? Array.isArray(data.response.body.items.item)
        ? data.response.body.items.item
        : [data.response.body.items.item]
      : [];

  const map: Record<string, { name: string; isHoliday: boolean }> = {};
  for (const it of items) {
    const loc = String(it.locdate); // 20260301
    const y = loc.slice(0, 4);
    const m = loc.slice(4, 6);
    const d = loc.slice(6, 8);
    const ymd = `${y}-${m}-${d}`;
    map[ymd] = { name: it.dateName ?? "공휴일", isHoliday: true };
  }

  return NextResponse.json({ month, holidays: map, count: Object.keys(map).length });
}