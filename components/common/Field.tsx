"use client";

import React from "react";

export default function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-neutral-500">{label}</div>
      {children}
    </label>
  );
}
