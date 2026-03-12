"use client";

import React from "react";

export default function ModePill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "min-w-[44px] rounded-full px-3 py-1 text-[11px] transition",
        active
          ? "bg-white text-neutral-900 shadow-sm"
          : "bg-transparent text-neutral-500",
      ].join(" ")}
    >
      {label}
    </button>
  );
}