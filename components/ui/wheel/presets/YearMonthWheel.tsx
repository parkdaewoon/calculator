"use client";

import React, { useEffect, useMemo, useState } from "react";
import BottomSheet from "./BottomSheet";
import { WheelPicker } from "@/components/ui/wheel/WheelPicker";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function normalizeYYYYMM(v: string) {
  if (!v) return "";
  const s = String(v).trim();
  if (/^\d{4}-\d{2}$/.test(s)) return s;
  return "";
}

function yyyymmToParts(v: string) {
  const safe = normalizeYYYYMM(v);
  if (!safe) {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() + 1 };
  }
  const [yy, mm] = safe.split("-").map((x) => Number(x));
  return { y: yy, m: mm };
}

function partsToYYYYMM(y: number, m: number) {
  return `${y}-${pad2(m)}`;
}

export default function YearMonthWheel({
  open,
  title = "년/월 선택",
  value,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  value: string; // YYYY-MM
  onClose: () => void;
  onConfirm: (nextYYYYMM: string) => void;
}) {
  const { y: initY, m: initM } = useMemo(() => yyyymmToParts(value), [value]);

  const curY = new Date().getFullYear();
  const years = useMemo(() => {
    const start = 1940;
  const end = 2099;
    return Array.from({ length: end - start + 1 }, (_, i) => String(start + i));
  }, [curY]);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => pad2(i + 1)), []);

  const [yy, setYy] = useState(String(initY));
  const [mm, setMm] = useState(pad2(initM));

  useEffect(() => {
    if (!open) return;
    setYy(String(initY));
    setMm(pad2(initM));
  }, [open, initY, initM]);

  return open ? (
    <BottomSheet
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <button
          className="w-full rounded-2xl bg-neutral-900 py-3 text-sm font-semibold text-white"
          type="button"
          onClick={() => {
            const next = partsToYYYYMM(Number(yy), Number(mm));
            onConfirm(next);
            onClose();
          }}
        >
          확인
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col">
          <div className="mb-2 w-full text-center text-xs font-semibold text-neutral-700">년</div>
          <div className="h-[220px] w-full [&_*]:text-center">
            <WheelPicker items={years} value={yy} onChange={setYy} />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-2 w-full text-center text-xs font-semibold text-neutral-700">월</div>
          <div className="h-[220px] w-full [&_*]:text-center">
            <WheelPicker items={months} value={mm} onChange={setMm} />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-3">
        <div className="mt-1 text-center text-sm font-semibold text-neutral-900 tabular-nums">
          {yy}년 {mm}월
        </div>
      </div>
    </BottomSheet>
  ) : null;
}