"use client";

import React, { useEffect, useMemo, useState } from "react";
import BottomSheet from "./BottomSheet";
import { WheelPicker } from "@/components/ui/wheel/WheelPicker";

const BREAK_OPTIONS = [
  { label: "없음", min: 0 },
  { label: "30분", min: 30 },
  { label: "1시간", min: 60 },
  { label: "1시간 30분", min: 90 },
  { label: "2시간", min: 120 },
  { label: "3시간", min: 180 },
  { label: "4시간", min: 240 },
  { label: "5시간", min: 300 },
  { label: "6시간", min: 360 },
  { label: "7시간", min: 420 },
  { label: "8시간", min: 480 },
];

export default function BreakWheelModal({
  open,
  value,
  onClose,
  onConfirm,
}: {
  open: boolean;
  value: number;
  onClose: () => void;
  onConfirm: (next: number) => void;
}) {
  const items = useMemo(() => BREAK_OPTIONS.map((o) => String(o.min)), []);
  const [v, setV] = useState(String(value ?? 0));

  useEffect(() => {
    if (!open) return;
    setV(String(value ?? 0));
  }, [open, value]);

  const label = useMemo(() => {
    const n = Number(v);
    return BREAK_OPTIONS.find((x) => x.min === n)?.label ?? `${n}분`;
  }, [v]);

  return open ? (
    <BottomSheet
      open={open}
      title="공제시간 선택"
      onClose={onClose}
      footer={
        <button
          className="w-full rounded-2xl bg-neutral-900 py-3 text-sm font-semibold text-white"
          type="button"
          onClick={() => {
            onConfirm(Number(v));
            onClose();
          }}
        >
          확인
        </button>
      }
    >
      {/* ✅ 높이 고정해서 다른 wheel들과 정렬감 맞춤 */}
      <div className="h-[220px] w-full [&_*]:text-center">
        <WheelPicker
          items={items}
          value={v}
          onChange={setV}
          format={(x) => {
            const n = Number(x);
            return BREAK_OPTIONS.find((o) => o.min === n)?.label ?? `${n}분`;
          }}
        />
      </div>

      <div className="mt-4 rounded-2xl border border-neutral-100 bg-neutral-50 p-3">
        <div className="mt-1 text-center text-sm font-semibold text-neutral-900">{label}</div>
      </div>
    </BottomSheet>
  ) : null;
}