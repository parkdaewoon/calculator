"use client";

export default function TopBar({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur">
      <div className="relative flex items-center justify-center px-5 py-4">
        {/* Brand - 크게 */}
        <div className="text-[22px] font-semibold tracking-[-0.01em] text-neutral-900">
  공무원 노트
</div>

        {/* Menu Button - 오른쪽 고정, 2/3 크기 */}
        <button
          onClick={onMenu}
          aria-label="메뉴 열기"
          className="absolute right-5 inline-flex h-7 w-7 items-center justify-center rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 active:scale-[0.98]"
        >
          <span className="block w-4">
            <span className="mb-1 block h-[1.5px] w-full rounded bg-neutral-800" />
            <span className="mb-1 block h-[1.5px] w-full rounded bg-neutral-800" />
            <span className="block h-[1.5px] w-full rounded bg-neutral-800" />
          </span>
        </button>
      </div>

      <div className="h-px w-full bg-neutral-100" />
    </header>
  );
}