"use client";

import React, { useEffect, useMemo, useState } from "react";
import BottomSheet from "./BottomSheet";
import { WheelPicker } from "@/components/ui/wheel/WheelPicker";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function normalizeYmdSimple(v: string) {
  if (!v) return "";
  const s = String(v).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return "";
}

function ymdToParts(ymd: string) {
  const safe = normalizeYmdSimple(ymd);
  if (!safe) {
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() + 1, d: now.getDate() };
  }
  const [y, m, d] = safe.split("-").map((x) => Number(x));
  return { y, m, d };
}

function partsToYmd(y: number, m: number, d: number) {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m, 0).getDate(); // m: 1~12
}

export default function DateWheelModal({
  open,
  title = "날짜 선택",
  value,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  value: string; // YYYY-MM-DD
  onClose: () => void;
  onConfirm: (nextYmd: string) => void;
}) {
  const { y: initY, m: initM, d: initD } = useMemo(() => ymdToParts(value), [value]);

  const curY = new Date().getFullYear();
  const years = useMemo(() => {
    const start = 1940;
  const end = 2099;
    return Array.from({ length: end - start + 1 }, (_, i) => String(start + i));
  }, [curY]);

  const [yy, setYy] = useState(String(initY));
  const [mm, setMm] = useState(pad2(initM));
  const [dd, setDd] = useState(pad2(initD));

  useEffect(() => {
    if (!open) return;
    setYy(String(initY));
    setMm(pad2(initM));
    setDd(pad2(initD));
  }, [open, initY, initM, initD]);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => pad2(i + 1)), []);
  const days = useMemo(() => {
    const y = Number(yy);
    const m = Number(mm); // "01" -> 1
    const max = daysInMonth(y, m);
    return Array.from({ length: max }, (_, i) => pad2(i + 1));
  }, [yy, mm]);

  useEffect(() => {
    const max = daysInMonth(Number(yy), Number(mm));
    if (Number(dd) > max) setDd(pad2(max));
  }, [yy, mm, dd]);

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
            const next = partsToYmd(Number(yy), Number(mm), Number(dd));
            onConfirm(next);
            onClose();
          }}
        >
          확인
        </button>
      }
    >
      <div className="grid grid-cols-3 gap-3">
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

        <div className="flex flex-col">
          <div className="mb-2 w-full text-center text-xs font-semibold text-neutral-700">일</div>
          <div className="h-[220px] w-full [&_*]:text-center">
            <WheelPicker items={days} value={dd} onChange={setDd} />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-3">
        <div className="mt-1 text-center text-sm font-semibold text-neutral-900 tabular-nums">
          {yy}년 {mm}월 {dd}일
        </div>
      </div>
    </BottomSheet>
  ) : null;
}