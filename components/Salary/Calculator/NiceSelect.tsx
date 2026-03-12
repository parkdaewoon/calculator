"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Opt } from "@/lib/salary/types";

export default function NiceSelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: Opt[];
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = React.useRef<HTMLButtonElement | null>(null);
  const popRef = React.useRef<HTMLDivElement | null>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "선택";

  const [pos, setPos] = useState<{ left: number; top: number; width: number } | null>(
    null
  );

  const updatePos = () => {
    const el = btnRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ left: r.left, top: r.bottom + 8, width: r.width });
  };

  useEffect(() => {
    if (!open) return;
    updatePos();

    const onResize = () => updatePos();
    const onScroll = () => updatePos();

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, true);

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (popRef.current?.contains(t)) return;
      setOpen(false);
    };

    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          "relative flex w-full items-center justify-between",
          "h-10 rounded-2xl border border-neutral-200 bg-white px-3",
          "text-left text-sm text-neutral-900 shadow-sm transition",
          "hover:border-neutral-300",
          "focus:outline-none focus:ring-4 focus:ring-neutral-200/60 focus:border-neutral-400",
        ].join(" ")}
      >
        <span className="truncate">{selectedLabel}</span>

        <span className="ml-2 flex h-6 w-6 items-center justify-center rounded-xl text-neutral-500">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>

      {open && pos
        ? createPortal(
            <div
              ref={popRef}
              style={{
                position: "fixed",
                left: pos.left,
                top: pos.top,
                width: pos.width,
                zIndex: 2000,
                touchAction: "pan-y",
                overscrollBehavior: "contain",
              }}
              className={[
                "overflow-x-hidden overflow-y-auto rounded-2xl border border-neutral-200 bg-white",
                "shadow-[0_20px_60px_rgba(0,0,0,0.18)]",
              ].join(" ")}
            >
              <div className="max-h-[260px] overflow-auto p-1">
                {options.map((o) => {
                  const active = o.value === value;
                  return (
                    <button
                      key={o.value}
                      type="button"
                      onClick={() => {
                        onChange(o.value);
                        setOpen(false);
                      }}
                      className={[
                        "w-full rounded-xl px-3 py-2 text-left text-xs transition",
                        active
                          ? "bg-neutral-900 text-white"
                          : "text-neutral-900 hover:bg-neutral-100",
                      ].join(" ")}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body
          )
        : null}
    </>
  );
}