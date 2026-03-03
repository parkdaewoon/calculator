export default function AdsenseSlot({ height = 72 }: { height?: number }) {
  return (
    <div
      className="w-full rounded-2xl border border-dashed border-neutral-300 bg-neutral-50 text-center text-xs text-neutral-500"
      style={{ height }}
    >
      <div className="flex h-full items-center justify-center">
        광고 영역 (AdSense Slot)
      </div>
    </div>
  );
}