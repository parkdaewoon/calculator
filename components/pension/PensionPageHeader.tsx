"use client";

import Link from "next/link";

type Props = {
  title: string;
  description: string;
};

export default function PensionPageHeader({ title, description }: Props) {
  return (
    <div className="space-y-5">
      <div className="mt-3 text-[11px] tracking-[0.25em] text-neutral-400">
        NOTE KOREAN OFFICER
      </div>

      <div className="mt-2 flex items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold leading-snug tracking-tight">
          {title}
        </h1>

        <Link
          href="/pension"
          className="inline-flex h-7 items-center rounded-full border border-neutral-200 bg-white px-2.5 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-50 active:scale-[0.98]"
        >
          전체 메뉴
        </Link>
      </div>

      <p className="mt-3 text-sm tracking-tighter text-neutral-500">
        {description}
      </p>
    </div>
  );
}