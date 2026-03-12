"use client";

import React, { useEffect, useState } from "react";
import { clampInt } from "@/lib/salary/format";

export default function DraftNumberInput({
  value,
  min,
  max,
  onCommit,
  className,
}: {
  value: number;
  min: number;
  max: number;
  onCommit: (value: number) => void;
  className: string;
}) {
  const [draft, setDraft] = useState(() =>
    Number.isFinite(value) ? String(Math.trunc(value)) : ""
  );

  useEffect(() => {
    setDraft(Number.isFinite(value) ? String(Math.trunc(value)) : "");
  }, [value]);

  return (
    <input
      inputMode="numeric"
      value={draft}
      onChange={(e) => {
        const raw = e.target.value.replace(/[^0-9]/g, "");
        setDraft(raw);
      }}
      onBlur={() => {
        const committed = clampInt(draft, min, max);
        onCommit(committed);
        setDraft(String(committed));
      }}
      className={className}
    />
  );
}