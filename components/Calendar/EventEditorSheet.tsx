"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import type { CalendarEvent, YYYYMMDD } from "@/lib/calendar";
import {
  COLOR_PRESETS,
  type TypeColorMap,
  type TypeKey,
} from "@/lib/calendar/typeColors";
import { loadTypeColors, saveTypeColors } from "@/lib/storage/typeColorStorage";
import {
  Calendar,
  Clock,
  Bell,
  MapPin,
  Link,
  FileText,
  ArrowRight,
} from "lucide-react";
type Props = {
  open: boolean;
  date: YYYYMMDD;
  event?: CalendarEvent | null;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
  onDelete?: (eventId: string) => void;
};

/** ✅ YYYY-MM-DD / YYYY-M-D / YYYY.MM.DD / YYYYMMDD -> YYYY-MM-DD */
function normalizeYmd(input: any): YYYYMMDD {
  const s = String(input ?? "").trim();
  if (!s) return "" as YYYYMMDD;

  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s as YYYYMMDD;

  if (/^\d{8}$/.test(s)) {
    const y = s.slice(0, 4);
    const m = s.slice(4, 6);
    const d = s.slice(6, 8);
    return `${y}-${m}-${d}` as YYYYMMDD;
  }

  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
    const [y, mo, da] = s.split("-");
    const m = String(Number(mo)).padStart(2, "0");
    const d = String(Number(da)).padStart(2, "0");
    return `${y}-${m}-${d}` as YYYYMMDD;
  }

  if (/^\d{4}\.\d{1,2}\.\d{1,2}$/.test(s)) {
    const [y, mo, da] = s.split(".");
    const m = String(Number(mo)).padStart(2, "0");
    const d = String(Number(da)).padStart(2, "0");
    return `${y}-${m}-${d}` as YYYYMMDD;
  }

  return "" as YYYYMMDD;
}

function ymdToDate(ymdLike: string): Date | null {
  const ymd = normalizeYmd(ymdLike);
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return null;

  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(y, (m ?? 1) - 1, d ?? 1);
  return isNaN(dt.getTime()) ? null : dt;
}

function dateToYmd(dt: Date): YYYYMMDD {
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}` as YYYYMMDD;
}

function fmtHeaderDateLabel(ymdLike: string) {
  const dt = ymdToDate(ymdLike);
  if (!dt) return String(ymdLike ?? "");
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}.${m}.${d}`;
}

function fmtWheelDateLabel(ymdLike: string) {
  const dt = ymdToDate(ymdLike);
  if (!dt) return String(ymdLike ?? "");
  const m = dt.getMonth() + 1;
  const d = dt.getDate();
  const day = ["일", "월", "화", "수", "목", "금", "토"][dt.getDay()];
  return `${m}월 ${d}일 (${day})`;
}

/** ✅ 중심 날짜 기준 ± spanDays 날짜 리스트 */
function buildDateListAround(centerYmdLike: string, spanDays = 120): YYYYMMDD[] {
  const center = ymdToDate(centerYmdLike) ?? new Date();
  const out: YYYYMMDD[] = [];
  for (let i = -spanDays; i <= spanDays; i++) {
    const dt = new Date(center);
    dt.setDate(center.getDate() + i);
    out.push(dateToYmd(dt));
  }
  return out;
}

function buildTimeList(stepMin = 5): string[] {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += stepMin) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
}

/** ===== Wheel Picker ===== */
function Wheel({
  items,
  value,
  onChange,
  format,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
  format?: (v: string) => string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState(false);
  const itemH = 44;
  const viewH = 240;
  const pad = viewH / 2 - itemH / 2; // 98
  const rafRef = useRef<number | null>(null);
  const settleRef = useRef<number | null>(null);
  const programmaticRef = useRef(false);

  // YYYY-MM-DD 비교용
  const toTime = (s: string) => {
    const dt = ymdToDate(s);
    return dt ? dt.getTime() : NaN;
  };

    const isTimeWheel = useMemo(() => {
    const sample = items?.[0] ?? "";
    // HH:MM 형태면 시간 휠로 판단
    return /^\d{2}:\d{2}$/.test(sample);
  }, [items]);

  const getBestIndex = (v: string) => {
    // ✅ 시간 휠: 날짜 정규화 금지 (여기가 맨위로 튀는 원인!)
    if (isTimeWheel) {
      const exact = items.indexOf(v);
      return exact >= 0 ? exact : 0;
    }

    // ✅ 날짜 휠(기존 로직 유지)
    const normalized = normalizeYmd(v);
    if (!normalized) return 0;

    const exact = items.indexOf(normalized);
    if (exact >= 0) return exact;

    // 없으면 "가장 가까운 날짜"로
    const t = toTime(normalized);
    if (!isFinite(t)) return 0;

    let best = 0;
    let bestDiff = Infinity;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const tt = toTime(it);
      if (!isFinite(tt)) continue;
      const diff = Math.abs(tt - t);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = i;
      }
    }
    return best;
  };

    const scrollToIndex = (idx: number) => {
    const el = ref.current;
    if (!el) return;

    const top = idx * itemH;

    programmaticRef.current = true;

    // 🔥 점프/이동 느낌 없애기: scrollTo 대신 즉시 할당
    el.scrollTop = top;

    // 다음 프레임에만 스크롤 이벤트 허용 + 화면 표시
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      programmaticRef.current = false;
      setReady(true);
    });
  };

  // ✅ 열릴 때/값 바뀔 때: 선택값이 중앙으로 오도록 스크롤
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // ✅ 세팅 전에는 숨김 (처음 다른 날짜 보이는 현상 제거)
    setReady(false);

    const idx = getBestIndex(value);

    // rAF 2번 유지 (바텀시트 애니메이션/레이아웃 안정화)
    let r1 = 0;
    let r2 = 0;
    r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => {
        scrollToIndex(idx);
      });
    });

    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (settleRef.current) window.clearTimeout(settleRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, value]);

  const commitFromScroll = () => {
    const el = ref.current;
    if (!el) return;

    const idx = Math.round(el.scrollTop / itemH);
    const safe = Math.min(items.length - 1, Math.max(0, idx));
    const next = items[safe];

    if (next && next !== value) onChange(next);
  };

  const onScroll = () => {
    if (programmaticRef.current) return;

    if (settleRef.current) window.clearTimeout(settleRef.current);
    settleRef.current = window.setTimeout(() => {
      commitFromScroll();
    }, 80);
  };

  return (
    <div className="relative">
      {/* 가운데 선택 하이라이트 */}
      <div className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2">
        <div className="mx-2 h-[44px] rounded-2xl border border-neutral-300 bg-neutral-50/70" />
      </div>

      <div
        ref={ref}
        onScroll={onScroll}
        className="h-[240px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          scrollSnapType: "y mandatory" as any,
          // ✅ 첫 위치 맞추기 전에는 숨김 → 이동하는 느낌 제거
          visibility: ready ? "visible" : "hidden",
        }}
      >
        <div style={{ height: pad }} />

        {items.map((it) => (
          <div
            key={it}
            className="flex items-center justify-center text-sm text-neutral-900"
            style={{ height: itemH, scrollSnapAlign: "center" as any }}
          >
            {format ? format(it) : it}
          </div>
        ))}

        <div style={{ height: pad }} />
      </div>
    </div>
  );
}

function BottomSheet({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[80]">
      <button
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="닫기"
      />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-md rounded-t-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-4">
          <div className="text-sm font-semibold text-neutral-900">{title}</div>
          <button
            onClick={onClose}
            className="rounded-xl px-3 py-2 text-sm text-neutral-600 hover:bg-neutral-100"
          >
            닫기
          </button>
        </div>
        <div className="px-5 pt-4 pb-3">{children}</div>
        {footer ? <div className="px-5 pb-5">{footer}</div> : <div className="pb-5" />}
      </div>
    </div>,
    document.body
  );
}

function WheelModal({
  open,
  title,
  onClose,
  onConfirm,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  children: React.ReactNode;
}) {
  return (
    <BottomSheet
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <button
          onClick={onConfirm}
          className="w-full rounded-2xl bg-neutral-900 py-3 text-sm font-semibold text-white"
        >
          확인
        </button>
      }
    >
      {children}
    </BottomSheet>
  );
}

/** ===== 유형(업무/복무) ===== */
type MainType = "WORK" | "DUTY";
const DEFAULT_WORK_SUBS = ["미팅", "회의", "교육", "회식"];
const DEFAULT_DUTY_SUBS = ["연가", "병가", "공가"];

function unpackType(v: string): { main: MainType; sub: string } {
  const [m, s] = (v || "").split("|");
  return { main: m === "DUTY" ? "DUTY" : "WORK", sub: s ?? "" };
}

/** ===== 알림 ===== */
const REMINDER_PRESETS: Array<{ label: string; minutes: number | null }> = [
  { label: "없음", minutes: null },
  { label: "10분 전", minutes: 10 },
  { label: "30분 전", minutes: 30 },
  { label: "1시간 전", minutes: 60 },
  { label: "2시간 전", minutes: 120 },
  { label: "1일 전", minutes: 60 * 24 },
  { label: "1주일 전", minutes: 60 * 24 * 7 },
];

function reminderLabel(min: number | null) {
  const found = REMINDER_PRESETS.find((x) => x.minutes === min);
  return found?.label ?? "없음";
}

/** ===== iOS 스타일 Row UI ===== */
function Row({
  icon,
  label,
  value,
  onClick,
  rightSlot,
  valueTone = "text-neutral-500",
}: {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  onClick?: () => void;
  rightSlot?: React.ReactNode;
  valueTone?: string;
}) {
  const clickable = !!onClick;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!clickable}
      className={[
        "w-full",
        "flex items-center gap-3",
        "px-4 py-3",
        "bg-white",
        clickable ? "active:bg-neutral-50" : "",
      ].join(" ")}
    >
      <div className="w-6 flex-none grid place-items-center text-neutral-400">
        {icon}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="text-[13px] font-semibold text-neutral-900">{label}</div>
      </div>

      {rightSlot ? (
        <div className="flex items-center gap-2">{rightSlot}</div>
      ) : (
        <div className="flex items-center gap-2 min-w-0">
          {value ? (
            <div className={["text-[13px] font-semibold", valueTone, "truncate"].join(" ")}>
              {value}
            </div>
          ) : null}
          {clickable ? <div className="text-neutral-300 text-lg leading-none">›</div> : null}
        </div>
      )}
    </button>
  );
}

function Divider() {
  return <div className="h-px bg-neutral-100" />;
}

function ColorDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block h-3.5 w-3.5 rounded-full border border-black/10"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  );
}

export default function EventEditorSheet({
  open,
  date,
  event,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const isEdit = !!event?.id;

  // ===== 유형 색상(저장/불러오기) =====
  const [typeColors, setTypeColors] = useState<TypeColorMap>(() => loadTypeColors());
  useEffect(() => saveTypeColors(typeColors), [typeColors]);

  const newId = () => crypto.randomUUID();

  const [colorSheetOpen, setColorSheetOpen] = useState(false);
  const [colorEditingKey, setColorEditingKey] = useState<TypeKey | null>(null);

  const [title, setTitle] = useState("");

  const [startDate, setStartDate] = useState<YYYYMMDD>(normalizeYmd(date));
  const [endDate, setEndDate] = useState<YYYYMMDD>(normalizeYmd(date));

  const [allDay, setAllDay] = useState(false);
  const [startTime, setStartTime] = useState("00:00");
const [endTime, setEndTime] = useState("00:00");

  const [location, setLocation] = useState("");
  const [url, setUrl] = useState("");
  const [memo, setMemo] = useState("");

  const [reminderMinutes, setReminderMinutes] = useState<number | null>(null);

  const [workSubs, setWorkSubs] = useState<string[]>(DEFAULT_WORK_SUBS);
  const [dutySubs, setDutySubs] = useState<string[]>(DEFAULT_DUTY_SUBS);
  const [typeValue, setTypeValue] = useState<string>("WORK|미팅");

  const [addingType, setAddingType] = useState(false);
  const [newTypeInput, setNewTypeInput] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [pick, setPick] = useState<null | { kind: "startDate" | "endDate" | "startTime" | "endTime" }>(null);
  const [tempValue, setTempValue] = useState("");

  const [datePickerCenter, setDatePickerCenter] = useState<YYYYMMDD>(normalizeYmd(date));

  const [typeSheetOpen, setTypeSheetOpen] = useState(false);
  const [reminderSheetOpen, setReminderSheetOpen] = useState(false);

  const timeItems = useMemo(() => buildTimeList(5), []);
  const dateItems = useMemo(() => {
    if (!pick) return [];
    if (pick.kind !== "startDate" && pick.kind !== "endDate") return [];
    const base = pick.kind === "startDate" ? startDate : endDate;
    const center = normalizeYmd(base || date);
    return buildDateListAround(center, 120);
  }, [pick, startDate, endDate, date]);

  useEffect(() => {
    if (!pick) return;

    if (pick.kind === "startDate") {
      const v = normalizeYmd(startDate || date);
      setTempValue(v);
      setDatePickerCenter(v);
      return;
    }

    if (pick.kind === "endDate") {
      const v = normalizeYmd(endDate || date);
      setTempValue(v);
      setDatePickerCenter(v);
      return;
    }

    if (pick.kind === "startTime") {
      setTempValue(startTime);
      return;
    }

    setTempValue(endTime);
  }, [pick, startDate, endDate, startTime, endTime, date]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      const el = menuRef.current;
      if (!el) return;
      if (el.contains(e.target as any)) return;
      setMenuOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!open) return;

    const e: any = event ?? null;

    setTitle((e?.title ?? "") as string);

    const baseStart = normalizeYmd(e?.dateStart ?? e?.startDate ?? e?.date ?? date);
    const baseEnd = normalizeYmd(
      e?.dateEnd ??
        e?.endDate ??
        e?.dateEnd ??
        e?.dateStart ??
        e?.date ??
        baseStart
    );

    setStartDate(baseStart || normalizeYmd(date));
    setEndDate(baseEnd || baseStart || normalizeYmd(date));

    setAllDay(!!e?.allDay);
    setStartTime((e?.startTime ?? "00:00") as string);
setEndTime((e?.endTime ?? "00:00") as string);

    setLocation((e?.location ?? "") as string);
    setUrl((e?.url ?? e?.link ?? "") as string);
    setMemo((e?.memo ?? "") as string);

    setReminderMinutes(typeof e?.reminderMinutes === "number" ? e.reminderMinutes : null);

    const savedMain = (e?.typeMain ?? e?.categoryMain) as string | undefined;
    const savedSub = (e?.typeSub ?? e?.categorySub) as string | undefined;
    if (savedMain && savedSub) {
      const packed = `${savedMain}|${savedSub}`;
      if (savedMain === "WORK") setWorkSubs((p) => (p.includes(savedSub) ? p : [...p, savedSub]));
      if (savedMain === "DUTY") setDutySubs((p) => (p.includes(savedSub) ? p : [...p, savedSub]));
      setTypeValue(packed);
    } else {
      setTypeValue("WORK|미팅");
    }

    setAddingType(false);
    setNewTypeInput("");
    setMenuOpen(false);
    setPick(null);
    setTempValue("");

    setDatePickerCenter(baseStart || normalizeYmd(date));

    setTypeSheetOpen(false);
    setReminderSheetOpen(false);
  }, [open, event, date]);

  const typeOptions = useMemo(() => {
    return {
      work: workSubs.map((s) => ({ value: `WORK|${s}`, label: s })),
      duty: dutySubs.map((s) => ({ value: `DUTY|${s}`, label: s })),
    };
  }, [workSubs, dutySubs]);

  const canSave = useMemo(() => {
  if (title.trim().length === 0) return false;
  if (startDate > endDate) return false;

  const timeUnspecified = !allDay && startTime === "00:00" && endTime === "00:00";
  if (!allDay && !timeUnspecified && startDate === endDate && startTime >= endTime) return false;

  return true;
}, [title, startDate, endDate, allDay, startTime, endTime]);

  const openPicker = (kind: "startDate" | "endDate" | "startTime" | "endTime") => {
    if (kind === "startDate") {
      const v = normalizeYmd(startDate || date);
      setTempValue(v);
      setDatePickerCenter(v);
      setPick({ kind });
      return;
    }
    if (kind === "endDate") {
      const v = normalizeYmd(endDate || date);
      setTempValue(v);
      setDatePickerCenter(v);
      setPick({ kind });
      return;
    }
    if (kind === "startTime") {
      setTempValue(startTime);
      setPick({ kind });
      return;
    }
    setTempValue(endTime);
    setPick({ kind });
  };

  const confirmPicker = () => {
    if (!pick) return;

    if (pick.kind === "startDate") {
      const v = normalizeYmd(tempValue);
      if (v) {
        setStartDate(v);
        if (v > endDate) setEndDate(v);
      }
    }
    if (pick.kind === "endDate") {
      const v = normalizeYmd(tempValue);
      if (v) {
        setEndDate(v);
        if (v < startDate) setStartDate(v);
      }
    }
    if (pick.kind === "startTime") setStartTime(tempValue);
    if (pick.kind === "endTime") setEndTime(tempValue);

    setPick(null);
  };

  const addTypeItem = () => {
    const v = newTypeInput.trim();
    if (!v) return;

    const { main } = unpackType(typeValue);
    if (main === "WORK") {
      setWorkSubs((prev) => (prev.includes(v) ? prev : [...prev, v]));
      setTypeValue(`WORK|${v}`);
    } else {
      setDutySubs((prev) => (prev.includes(v) ? prev : [...prev, v]));
      setTypeValue(`DUTY|${v}`);
    }

    setNewTypeInput("");
    setAddingType(false);
  };

  const removeCurrentTypeItem = () => {
    const { main, sub } = unpackType(typeValue);
    if (!sub) return;

    const defaults = new Set(main === "WORK" ? DEFAULT_WORK_SUBS : DEFAULT_DUTY_SUBS);
    if (defaults.has(sub)) return;

    if (main === "WORK") {
      setWorkSubs((prev) => prev.filter((x) => x !== sub));
      const next = workSubs.filter((x) => x !== sub)[0] ?? DEFAULT_WORK_SUBS[0];
      setTypeValue(`WORK|${next}`);
    } else {
      setDutySubs((prev) => prev.filter((x) => x !== sub));
      const next = dutySubs.filter((x) => x !== sub)[0] ?? DEFAULT_DUTY_SUBS[0];
      setTypeValue(`DUTY|${next}`);
    }
  };

  const handleSave = () => {
  if (!canSave) return;

  const base: any = event ? { ...(event as any) } : {};
  const { main: typeMain, sub: typeSub } = unpackType(typeValue);

  const safeStart = startDate;
  const safeEnd = endDate && endDate >= startDate ? endDate : startDate;

  // ✅ 00:00 / 00:00이면 "시간 미지정"으로 저장(시간 필드 제거)
  const timeUnspecified =
    !allDay && startTime === "00:00" && endTime === "00:00";

  const next: any = {
    ...base,
    id: base.id ?? newId(),

    dateStart: safeStart,
    dateEnd: safeEnd === safeStart ? undefined : safeEnd,

    title: title.trim(),
    allDay,

    startTime: allDay || timeUnspecified ? undefined : startTime,
    endTime: allDay || timeUnspecified ? undefined : endTime,

    location: location?.trim() ? location.trim() : undefined,
    url: url?.trim() ? url.trim() : undefined,

    typeMain,
    typeSub: typeSub || undefined,

    reminderMinutes: reminderMinutes ?? undefined,
    memo: memo?.trim() ? memo.trim() : undefined,
  };

  onSave(next as CalendarEvent);
  onClose();
};

  const currentTypeLabel = useMemo(() => {
    const { main, sub } = unpackType(typeValue);
    const head = main === "WORK" ? "업무" : "복무";
    return sub ? `${head} · ${sub}` : head;
  }, [typeValue]);

  const currentTypeColor = useMemo(() => {
    const key = typeValue as TypeKey;
    return typeColors[key] ?? COLOR_PRESETS[0];
  }, [typeValue, typeColors]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60]">
      {/* dim */}
      <button className="absolute inset-0 bg-black/25" onClick={onClose} aria-label="닫기" />

      {/* iOS 느낌: 카드형 시트 */}
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-md rounded-t-[28px] bg-white shadow-2xl overflow-hidden">
        {/* top bar */}
        <div className="flex items-center justify-between px-4 pt-4">
          <button
  onClick={onClose}
  aria-label="닫기"
  className="grid h-9 w-9 place-items-center rounded-full text-neutral-500 hover:bg-neutral-100 transition"
>
  <span className="text-xl leading-none">×</span>
</button>

          <div className="text-[13px] font-semibold text-neutral-500">
            {isEdit ? "일정 추가" : "새 이벤트"}
          </div>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((p) => !p)}
              className="grid h-10 w-10 place-items-center rounded-full text-neutral-700 hover:bg-neutral-100"
              aria-label="더보기"
            >
              <span className="text-2xl leading-none">⋯</span>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-lg">
                <button
                  onClick={() => {
                    const clone: any = event ? { ...(event as any) } : null;
                    if (!clone) return;
                    clone.id = newId();
                    onSave(clone as CalendarEvent);
                    setMenuOpen(false);
                    onClose();
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-neutral-800 hover:bg-neutral-50"
                >
                  복사하기
                </button>
              </div>
            )}
          </div>
        </div>

        {/* content */}
        <div className="px-4 pb-6 pt-2">
          {/* 제목 (iOS 큰 입력) */}
          <div className="mt-2 rounded-3xl bg-neutral-50 px-4 py-3">
            <div className="flex items-start gap-3">
              <div className="mt-2 h-8 w-1 rounded-full" style={{ backgroundColor: currentTypeColor }} />
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목"
                className="w-full bg-transparent text-[34px] leading-[38px] font-semibold tracking-tight text-neutral-900 outline-none placeholder:text-neutral-300"
              />
            </div>
          </div>

          {/* 날짜 카드 */}
<div className="mt-4 overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
  <Row
    icon={<Clock size={18} strokeWidth={1.8} className="text-neutral-500" />}
    label="일정 시작"
    value={`${fmtWheelDateLabel(startDate)}${allDay ? " · 종일" : ""}`}
    onClick={() => openPicker("startDate")}
    valueTone="text-neutral-600"
  />
  <Divider />
  <Row
    icon={<ArrowRight size={18} strokeWidth={1.8} className="text-neutral-500" />}
    label="일정 종료"
    value={`${fmtWheelDateLabel(endDate)}${allDay ? " · 종일" : ""}`}
    onClick={() => openPicker("endDate")}
    valueTone="text-neutral-600"
  />
</div>

{/* 종일 (배경 없음, 우측 정렬) */}
<div className="mt-2 flex items-center justify-end gap-3 px-1">
  <span className="text-[12px] font-semibold text-neutral-600">하루종일</span>

  <button
    type="button"
    onClick={() => setAllDay((p) => !p)}
    className={[
      "h-6 w-10 rounded-full relative transition",
      allDay ? "bg-neutral-900" : "bg-neutral-200",
    ].join(" ")}
    aria-label="종일 토글"
  >
    <span
      className={[
        "absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition",
        allDay ? "translate-x-4" : "translate-x-0",
      ].join(" ")}
    />
  </button>
</div>

{/* 시간 카드 (종일이면 숨김) */}
{!allDay ? (
  <div className="mt-3 overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
    <Row
      icon={<Clock size={18} strokeWidth={1.8} className="text-neutral-500" />}
      label="시작 시간"
      value={startTime}
      onClick={() => openPicker("startTime")}
      valueTone="text-neutral-700"
    />
    <Divider />
    <Row
      icon={<Clock size={18} strokeWidth={1.8} className="text-neutral-500" />}
      label="종료 시간"
      value={endTime}
      onClick={() => openPicker("endTime")}
      valueTone="text-neutral-700"
    />
  </div>
) : null}

          {/* 옵션 카드 */}
          <div className="mt-4 overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
            <Row
              icon={<Calendar size={18} strokeWidth={1.8} className="text-neutral-500" />}
              label="캘린더"
              value={currentTypeLabel}
              onClick={() => setTypeSheetOpen(true)}
              valueTone="text-neutral-700"
              rightSlot={
                <div className="flex items-center gap-2">
                  <ColorDot color={currentTypeColor} />
                  <div className="text-[13px] font-semibold text-neutral-700 truncate max-w-[160px]">
                    {currentTypeLabel}
                  </div>
                  <div className="text-neutral-300 text-lg leading-none">›</div>
                </div>
              }
            />
            <Divider />
            <Row
              icon={<Bell size={18} strokeWidth={1.8} className="text-neutral-500" />}
              label="알림"
              value={reminderLabel(reminderMinutes)}
              onClick={() => setReminderSheetOpen(true)}
              valueTone="text-neutral-700"
            />
          </div>

          {/* 위치/URL/메모 카드 */}
          <div className="mt-4 overflow-hidden rounded-3xl border border-neutral-100 bg-white shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-6 grid place-items-center text-neutral-400">
                  <MapPin size={18} strokeWidth={1.8} className="text-neutral-500" />
                </div>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="위치"
                  className="w-full bg-transparent text-[14px] font-semibold text-neutral-900 outline-none placeholder:text-neutral-300"
                />
              </div>
            </div>
            <Divider />
            <div className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="w-6 grid place-items-center text-neutral-400">
                  <Link size={18} strokeWidth={1.8} className="text-neutral-500" />
                </div>
                <input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="URL"
                  className="w-full bg-transparent text-[14px] font-semibold text-neutral-900 outline-none placeholder:text-neutral-300"
                />
              </div>
            </div>
            <Divider />
            <div className="px-4 py-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 w-6 grid place-items-center text-neutral-400">
                  <FileText size={18} strokeWidth={1.8} className="text-neutral-500" />
                </div>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="메모"
                  className="min-h-[90px] w-full resize-none bg-transparent text-[14px] font-semibold text-neutral-900 outline-none placeholder:text-neutral-300"
                />
              </div>
            </div>
          </div>

          {/* 삭제 (iOS 느낌: 아래쪽 버튼) */}
          {isEdit && onDelete ? (
            <div className="mt-4">
              <button
                onClick={() => {
                  const ok = window.confirm("이 일정을 삭제할까요?");
                  if (!ok) return;
                  onDelete((event as any).id);
                  onClose();
                }}
                className="w-full rounded-2xl border border-neutral-200 bg-white py-3 text-sm font-semibold text-red-600 hover:bg-neutral-50"
              >
                이벤트 삭제
              </button>
            </div>
          ) : null}

          {/* 선택 날짜 힌트(작게) */}
          <div className="mt-4 text-center text-xs text-neutral-400">
            {fmtHeaderDateLabel(date)}
          </div>
        </div>

        {/* ✅ iOS 스타일 완료 버튼(우하단) */}
        <button
          onClick={handleSave}
          disabled={!canSave}
          className={[
            "absolute right-5 bottom-5 grid h-14 w-14 place-items-center rounded-full shadow-xl",
            canSave ? "bg-neutral-900 text-white" : "bg-neutral-200 text-neutral-400",
          ].join(" ")}
          aria-label="완료"
        >
          <span className="text-2xl leading-none">✓</span>
        </button>
      </div>

      {/* Picker */}
      <WheelModal
        open={!!pick}
        title={
          pick?.kind === "startDate"
            ? "시작 날짜 선택"
            : pick?.kind === "endDate"
            ? "종료 날짜 선택"
            : pick?.kind === "startTime"
            ? "시작 시간 선택"
            : "종료 시간 선택"
        }
        onClose={() => setPick(null)}
        onConfirm={confirmPicker}
      >
        {pick?.kind === "startDate" || pick?.kind === "endDate" ? (
          <Wheel
            items={dateItems}
            value={normalizeYmd(
              tempValue ||
                (pick?.kind === "startDate" ? startDate : endDate) ||
                date
            )}
            onChange={setTempValue}
            format={fmtWheelDateLabel}
          />
        ) : (
          <Wheel items={timeItems} value={tempValue} onChange={setTempValue} />
        )}
      </WheelModal>

      {/* 유형 선택 */}
      <BottomSheet
        open={typeSheetOpen}
        title="유형 선택"
        onClose={() => {
          setTypeSheetOpen(false);
          setAddingType(false);
          setNewTypeInput("");
        }}
        footer={
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAddingType((p) => !p)}
                className="text-sm font-semibold text-neutral-700 hover:underline"
              >
                + 항목 추가
              </button>
              <button
                type="button"
                onClick={removeCurrentTypeItem}
                className="text-sm font-semibold text-neutral-500 hover:text-neutral-800"
                title="기본 항목은 삭제 불가"
              >
                현재 항목 삭제
              </button>
            </div>

            {addingType && (
              <div className="flex gap-2">
                <input
                  value={newTypeInput}
                  onChange={(e) => setNewTypeInput(e.target.value)}
                  placeholder="새 항목명 (현재 그룹에 추가)"
                  className="flex-1 rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-neutral-400"
                />
                <button
                  type="button"
                  onClick={addTypeItem}
                  disabled={!newTypeInput.trim()}
                  className="rounded-2xl bg-neutral-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-40"
                >
                  저장
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddingType(false);
                    setNewTypeInput("");
                  }}
                  className="rounded-2xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50"
                >
                  취소
                </button>
              </div>
            )}
          </div>
        }
      >
        <div className="space-y-3">
          <div className="text-xs font-semibold text-neutral-500">업무</div>
          <div className="space-y-2">
            {typeOptions.work.map((o) => {
              const active = typeValue === o.value;
              const key = o.value as TypeKey;
              const color = typeColors[key] ?? COLOR_PRESETS[0];

              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    setTypeValue(o.value);
                    setTypeSheetOpen(false);
                  }}
                  className={[
                    "w-full rounded-2xl border px-4 py-3 text-left",
                    active
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ColorDot color={color} />
                      <div className="text-sm font-semibold">{o.label}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setColorEditingKey(key);
                          setColorSheetOpen(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key !== "Enter" && e.key !== " ") return;
                          e.preventDefault();
                          e.stopPropagation();
                          setColorEditingKey(key);
                          setColorSheetOpen(true);
                        }}
                        className={[
                          "inline-flex items-center justify-center rounded-xl border px-2 py-1 text-xs font-semibold select-none",
                          active
                            ? "border-white/30 text-white/90 hover:bg-white/10"
                            : "border-neutral-200 text-neutral-700 hover:bg-neutral-50",
                        ].join(" ")}
                      >
                        색 선택
                      </span>
                      {active && <div className="text-sm">✓</div>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 text-xs font-semibold text-neutral-500">복무</div>
          <div className="space-y-2">
            {typeOptions.duty.map((o) => {
              const active = typeValue === o.value;
              const key = o.value as TypeKey;
              const color = typeColors[key] ?? COLOR_PRESETS[0];

              return (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => {
                    setTypeValue(o.value);
                    setTypeSheetOpen(false);
                  }}
                  className={[
                    "w-full rounded-2xl border px-4 py-3 text-left",
                    active
                      ? "border-neutral-900 bg-neutral-900 text-white"
                      : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <ColorDot color={color} />
                      <div className="text-sm font-semibold">{o.label}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => {
                          e.stopPropagation();
                          setColorEditingKey(key);
                          setColorSheetOpen(true);
                        }}
                        onKeyDown={(e) => {
                          if (e.key !== "Enter" && e.key !== " ") return;
                          e.preventDefault();
                          e.stopPropagation();
                          setColorEditingKey(key);
                          setColorSheetOpen(true);
                        }}
                        className={[
                          "inline-flex items-center justify-center rounded-xl border px-2 py-1 text-xs font-semibold select-none",
                          active
                            ? "border-white/30 text-white/90 hover:bg-white/10"
                            : "border-neutral-200 text-neutral-700 hover:bg-neutral-50",
                        ].join(" ")}
                      >
                        색 선택
                      </span>
                      {active && <div className="text-sm">✓</div>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </BottomSheet>

      {/* 색상 선택 */}
      <BottomSheet
        open={colorSheetOpen}
        title="색상 선택"
        onClose={() => {
          setColorSheetOpen(false);
          setColorEditingKey(null);
        }}
      >
        <div className="grid grid-cols-6 gap-3">
          {COLOR_PRESETS.map((c) => {
            const active = !!colorEditingKey && typeColors[colorEditingKey] === c;

            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  if (!colorEditingKey) return;
                  setTypeColors((p) => ({ ...p, [colorEditingKey]: c }));
                  setColorSheetOpen(false);
                  setColorEditingKey(null);
                }}
                className={[
                  "grid place-items-center rounded-2xl p-2",
                  active ? "bg-neutral-100" : "hover:bg-neutral-50",
                ].join(" ")}
                aria-label={`색상 ${c}`}
              >
                <span
                  className="h-7 w-7 rounded-full border border-black/10"
                  style={{ backgroundColor: c }}
                />
              </button>
            );
          })}
        </div>
      </BottomSheet>

      {/* 알림 선택 */}
      <BottomSheet
        open={reminderSheetOpen}
        title="알림 선택"
        onClose={() => setReminderSheetOpen(false)}
      >
        <div className="space-y-2">
          {REMINDER_PRESETS.map((r) => {
            const active = reminderMinutes === r.minutes;
            return (
              <button
                key={r.label}
                type="button"
                onClick={() => {
                  setReminderMinutes(r.minutes);
                  setReminderSheetOpen(false);
                }}
                className={[
                  "w-full rounded-2xl border px-4 py-3 text-left",
                  active
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-400",
                ].join(" ")}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{r.label}</div>
                  {active && <div className="text-sm">✓</div>}
                </div>
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </div>,
    document.body
  );
}