"use client";

import React, { useEffect, useMemo, useState } from "react";
import BottomSheet from "./BottomSheet";
import { WheelPicker } from "@/components/ui/wheel/WheelPicker";
import type { HHMM } from "@/components/Calendar/types";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}
function splitHHMM(v: HHMM) {
  const [h, m] = v.split(":");
  return { h, m };
}
function makeHHMM(h: string, m: string) {
  return `${h}:${m}` as HHMM;
}

export default function TimeWheelModal({
  open,
  title = "시간 선택",
  value,
  stepMin = 5,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  value: HHMM;
  stepMin?: number;
  onClose: () => void;
  onConfirm: (next: HHMM) => void;
}) {
  const [h, setH] = useState(() => splitHHMM(value).h);
  const [m, setM] = useState(() => splitHHMM(value).m);

  useEffect(() => {
    if (!open) return;
    const p = splitHHMM(value);
    setH(p.h);
    setM(p.m);
  }, [open, value]);

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => pad2(i)), []);
  const mins = useMemo(() => {
    const out: string[] = [];
    for (let i = 0; i < 60; i += stepMin) out.push(pad2(i));
    return out;
  }, [stepMin]);

  useEffect(() => {
    if (!open) return;
    if (mins.includes(m)) return;

    const target = Number(m);
    let best = mins[0];
    let bestDiff = Infinity;
    for (const mm of mins) {
      const diff = Math.abs(Number(mm) - target);
      if (diff < bestDiff) {
        bestDiff = diff;
        best = mm;
      }
    }
    setM(best);
  }, [open, m, mins]);

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
            const next = makeHHMM(h, m);
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
          <div className="mb-2 w-full text-center text-xs font-semibold text-neutral-700">시</div>
          <div className="h-[220px] w-full [&_*]:text-center">
            <WheelPicker items={hours} value={h} onChange={setH} />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="mb-2 w-full text-center text-xs font-semibold text-neutral-700">분</div>
          <div className="h-[220px] w-full [&_*]:text-center">
            <WheelPicker items={mins} value={m} onChange={setM} />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-3">
        <div className="mt-1 text-center text-sm font-semibold text-neutral-900 tabular-nums">
          {h}:{m}
        </div>
      </div>
    </BottomSheet>
  ) : null;
}