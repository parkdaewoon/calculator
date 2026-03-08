export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** YYYY-MM */
export function toYYYYMM(y: number, m: number) {
  return `${y}-${pad2(m)}`;
}
export function parseYYYYMM(v: string) {
  const s = String(v ?? "").trim();
  const now = new Date();
  const fallback = { y: now.getFullYear(), m: now.getMonth() + 1 };

  const m = s.match(/^(\d{4})-(\d{1,2})$/);
  if (!m) return fallback;

  const y = Number(m[1]);
  const mo = Number(m[2]);

  if (!Number.isFinite(y) || !Number.isFinite(mo)) return fallback;
  if (mo < 1 || mo > 12) return fallback;

  return { y, m: mo };
}

/** ✅ YYYY-MM-DD / YYYY-M-D / YYYY.MM.DD / YYYYMMDD -> YYYY-MM-DD */
export function normalizeYmd(input: any) {
  const s = String(input ?? "").trim();
  if (!s) return "";

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  if (/^\d{8}$/.test(s)) {
    const y = s.slice(0, 4);
    const m = s.slice(4, 6);
    const d = s.slice(6, 8);
    return `${y}-${m}-${d}`;
  }

  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
    const [y, mo, da] = s.split("-");
    const m = String(Number(mo)).padStart(2, "0");
    const d = String(Number(da)).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  if (/^\d{4}\.\d{1,2}\.\d{1,2}$/.test(s)) {
    const [y, mo, da] = s.split(".");
    const m = String(Number(mo)).padStart(2, "0");
    const d = String(Number(da)).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
// ✅ YYYY/M/D 또는 YYYY/MM/DD 지원
if (/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(s)) {
  const [y, mo, da] = s.split("/");
  const m = String(Number(mo)).padStart(2, "0");
  const d = String(Number(da)).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
  return "";
}

export function ymdToDate(ymdLike: string): Date | null {
  const ymd = normalizeYmd(ymdLike);
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;

  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, m - 1, d);

  // ✅ JS 자동 보정(2/31 -> 3/3) 방지: 역변환 비교로 검증
  if (isNaN(dt.getTime())) return null;
  if (dateToYmd(dt) !== ymd) return null;

  return dt;
}

export function dateToYmd(dt: Date): string {
  const y = dt.getFullYear();
  const m = pad2(dt.getMonth() + 1);
  const d = pad2(dt.getDate());
  return `${y}-${m}-${d}`;
}

export function buildDateListAround(centerYmdLike: string, spanDays = 120): string[] {
  const center = ymdToDate(centerYmdLike) ?? new Date();
  const out: string[] = [];
  for (let i = -spanDays; i <= spanDays; i++) {
    const dt = new Date(center);
    dt.setDate(center.getDate() + i);
    out.push(dateToYmd(dt));
  }
  return out;
}

export function buildTimeList(stepMin = 5): string[] {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += stepMin) {
      out.push(`${pad2(h)}:${pad2(m)}`);
    }
  }
  return out;
}

export function formatYmdKorean(ymd: string) {
  const n = normalizeYmd(ymd);
  if (!n) return "";

  const [y, m, d] = n.split("-");
  return `${y}년 ${m}월 ${d}일`;
}