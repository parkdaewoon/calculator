import type { YYYYMM, YYYYMMDD } from "@/lib/calendar";

export type HolidayMap = Record<YYYYMMDD, { name: string; isHoliday: boolean }>;

export async function fetchHolidays(month: YYYYMM): Promise<HolidayMap> {
  const res = await fetch(`/api/holidays?month=${encodeURIComponent(month)}`, {
    cache: "no-store",
  });
  if (!res.ok) return {} as HolidayMap;
  const json = await res.json();
  return (json?.holidays ?? {}) as HolidayMap;
}