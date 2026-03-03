"use client";

import React from "react";

type Props = {
  onClick: () => void;
  hidden?: boolean;
};

export default function FloatingAddButton({ onClick, hidden }: Props) {
  if (hidden) return null;

  return (
    <button
      onClick={onClick}
      aria-label="일정 추가"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-900 text-2xl font-semibold text-white shadow-[0_16px_40px_rgba(0,0,0,0.25)] hover:bg-neutral-800 active:scale-95"
    >
      +
    </button>
  );
}