import Link from "next/link";

export default function IconCard({
  href,
  icon,
  title,
  desc,
  disabled = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: React.ReactNode;
  disabled?: boolean;
}) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-3 py-5">
      {/* 아이콘 영역 */}
      <div
        className={`
          flex h-[72px] w-[72px] items-center justify-center rounded-2xl
          bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200
          ${!disabled ? "group-hover:bg-neutral-200" : "opacity-60"}
        `}
      >
        {icon}
      </div>

      {/* 제목 */}
      <div
        className={`text-[16px] font-semibold tracking-tight ${
          disabled ? "text-neutral-400" : "text-neutral-800"
        }`}
      >
        {title}
      </div>

      {/* 설명 */}
      <div className="text-center text-[12px] leading-relaxed text-neutral-500">
        {desc}
      </div>
    </div>
  );

  if (disabled) {
    return (
      <div className="rounded-3xl border border-neutral-100 bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)]">
        {content}
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group rounded-3xl border border-neutral-100 bg-white p-4 shadow-[0_10px_25px_rgba(0,0,0,0.05)] transition active:scale-[0.98]"
    >
      {content}
    </Link>
  );
}