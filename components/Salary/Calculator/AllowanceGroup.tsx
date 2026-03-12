"use client";

import React, { useState } from "react";

export default function AllowanceGroup({
  title,
  rightHint,
  defaultOpen = false,
  children,
}: {
  title: string;
  rightHint?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-3xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full select-none touch-manipulation items-center justify-between gap-3 px-4 py-3"
      >
        <div className="text-sm font-semibold text-neutral-900">{title}</div>
        <div className="flex items-center gap-2">
          {rightHint ? (
            <span className="text-xs text-neutral-400">{rightHint}</span>
          ) : null}
          <span className="text-neutral-400">{open ? "−" : "+"}</span>
        </div>
      </button>

      {open ? <div className="space-y-2 px-4 pb-4">{children}</div> : null}
    </div>
  );
}