import { NextResponse } from "next/server";

export const runtime = "nodejs";

type HolidayItem = {
  locdate: number | string; // 20260301
  dateName?: string;
  isHoliday?: string;
};

function parseYearMonth(yyyymm: string) {
  const match = yyyymm.match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;

  const [, year, month] = match;
  const monthNum = Number(month);
  if (monthNum < 1 || monthNum > 12) return null;

  return {
    solYear: year,
    solMonth: month,
  };
}

function safeServiceKey(raw: string) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function toItems(data: unknown): HolidayItem[] {
  const item = (data as any)?.response?.body?.items?.item;
  if (!item) return [];
  return Array.isArray(item) ? item : [item];
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get("month");

    if (!month) {
      return NextResponse.json({ error: "month required" }, { status: 400 });
    }

    const parsed = parseYearMonth(month);
    if (!parsed) {
      return NextResponse.json(
        { error: "invalid month format. use YYYY-MM" },
        { status: 400 }
      );
    }

    const rawKey = process.env.PUBLIC_DATA_SERVICE_KEY;
    if (!rawKey) {
      return NextResponse.json(
        { error: "PUBLIC_DATA_SERVICE_KEY missing" },
        { status: 500 }
      );
    }

    const key = safeServiceKey(rawKey);
    const { solYear, solMonth } = parsed;

    const url =
      "https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo" +
      `?serviceKey=${key}` +
      `&solYear=${solYear}` +
      `&solMonth=${solMonth}` +
      `&_type=json` +
      `&numOfRows=100`;

    let res: Response;
    let text: string;

    try {
      res = await fetch(url, {
        cache: "no-store",
        headers: {
          Accept: "application/json, text/plain, */*",
        },
      });
      text = await res.text();
    } catch (err) {
      console.error("holidays upstream fetch failed:", err);
      return NextResponse.json(
        {
          error: "failed to fetch holiday api",
          month,
        },
        { status: 502 }
      );
    }

    let data: unknown = null;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("holidays upstream not json:", text.slice(0, 400));
      return NextResponse.json(
        {
          error: "upstream not json",
          status: res.status,
          preview: text.slice(0, 400),
          month,
        },
        { status: 502 }
      );
    }

    if (!res.ok) {
      console.error("holidays upstream http error:", res.status, data);
      return NextResponse.json(
        {
          error: "upstream http error",
          status: res.status,
          body: data,
          month,
        },
        { status: 502 }
      );
    }

    const resultCode = (data as any)?.response?.header?.resultCode;
    const resultMsg = (data as any)?.response?.header?.resultMsg;

    if (resultCode && resultCode !== "00") {
      console.error("holidays upstream api error:", resultCode, resultMsg, data);
      return NextResponse.json(
        {
          error: "holiday api returned error",
          resultCode,
          resultMsg,
          month,
        },
        { status: 502 }
      );
    }

    const items = toItems(data);

    const holidays: Record<string, { name: string; isHoliday: boolean }> = {};

    for (const it of items) {
      const loc = String(it.locdate ?? "").padStart(8, "0");
      if (!/^\d{8}$/.test(loc)) continue;

      const y = loc.slice(0, 4);
      const m = loc.slice(4, 6);
      const d = loc.slice(6, 8);
      const ymd = `${y}-${m}-${d}`;

      holidays[ymd] = {
        name: it.dateName || "공휴일",
        isHoliday: true,
      };
    }

    return NextResponse.json({
      month,
      holidays,
      count: Object.keys(holidays).length,
    });
  } catch (err) {
    console.error("holidays route error:", err);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}