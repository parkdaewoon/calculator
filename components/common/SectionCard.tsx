"use client";

import React from "react";

export default function SectionCard({
  title,
  right,
  children,
}: {
  title?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
      {title ? (
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-neutral-900">{title}</div>
          {right}
        </div>
      ) : null}
      <div className={title ? "mt-3" : ""}>{children}</div>
    </section>
  );
}
