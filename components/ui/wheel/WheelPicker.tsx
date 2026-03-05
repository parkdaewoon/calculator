"use client";

import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

export type WheelPickerHandle<T = string> = {
  getValue: () => T;
  commit: () => T;
};

type WheelPickerProps = {
  items: string[];
  value: string;
  onChange: (v: string) => void;
  format?: (v: string) => string;

  height?: number; // default 240
  itemH?: number; // default 44
  className?: string;

  settleMs?: number; // default 80
  snapOnCommit?: boolean; // default true
  hideUntilReady?: boolean; // default true
  tapToSelect?: boolean; // default true
};

export const WheelPicker = React.forwardRef<WheelPickerHandle<string>, WheelPickerProps>(
  function WheelPicker(
    {
      items,
      value,
      onChange,
      format,
      height = 240,
      itemH = 44,
      className,
      settleMs = 80,
      snapOnCommit = true,
      hideUntilReady = true,
      tapToSelect = true,
    },
    ref
  ) {
    const elRef = useRef<HTMLDivElement | null>(null);
    const valueRef = useRef(value);

    const rafRef = useRef<number | null>(null);
    const settleRef = useRef<number | null>(null);

    const programmaticRef = useRef(false);
    const fromUserScrollRef = useRef(false);

    const [ready, setReady] = useState(!hideUntilReady);

    useLayoutEffect(() => {
      valueRef.current = value;
    }, [value]);

    const pad = useMemo(() => Math.max(0, height / 2 - itemH / 2), [height, itemH]);

    const clampIndex = useCallback(
      (idx: number) => Math.min(items.length - 1, Math.max(0, idx)),
      [items.length]
    );

    // ✅ items에 value가 없으면 0으로 튀지 말고 “가장 가까운 숫자”를 찾기(날짜 31->30 같은 케이스)
    const getBestIndex = useCallback(
      (v: string) => {
        const exact = items.indexOf(v);
        if (exact >= 0) return exact;

        const tv = Number(v);
        if (Number.isFinite(tv)) {
          let bestIdx = 0;
          let bestDiff = Infinity;
          for (let i = 0; i < items.length; i++) {
            const n = Number(items[i]);
            if (!Number.isFinite(n)) continue;
            const diff = Math.abs(n - tv);
            if (diff < bestDiff) {
              bestDiff = diff;
              bestIdx = i;
            }
          }
          return bestIdx;
        }

        return 0;
      },
      [items]
    );

    const readCurrent = useCallback(() => {
      const el = elRef.current;
      if (!el) return valueRef.current;
      const idx = clampIndex(Math.round(el.scrollTop / itemH));
      return items[idx] ?? valueRef.current;
    }, [clampIndex, itemH, items]);

    const scrollToIndex = useCallback(
      (idx: number, behavior: ScrollBehavior) => {
        const el = elRef.current;
        if (!el) return;

        programmaticRef.current = true;
        el.scrollTo({ top: idx * itemH, behavior });

        window.setTimeout(() => {
          programmaticRef.current = false;
        }, behavior === "smooth" ? 220 : 0);
      },
      [itemH]
    );

    const commit = useCallback(() => {
      const el = elRef.current;
      if (!el) return valueRef.current;

      const idx = clampIndex(Math.round(el.scrollTop / itemH));
      const next = items[idx] ?? valueRef.current;

      if (next !== valueRef.current) onChange(next);

      if (snapOnCommit) scrollToIndex(idx, "smooth");

      return next;
    }, [clampIndex, itemH, items, onChange, scrollToIndex, snapOnCommit]);

    React.useImperativeHandle(
      ref,
      () => ({
        getValue: () => readCurrent(),
        commit: () => commit(),
      }),
      [readCurrent, commit]
    );

    // value/items 변경 시 위치 맞추기
    useLayoutEffect(() => {
      const el = elRef.current;
      if (!el) return;

      if (fromUserScrollRef.current) {
        fromUserScrollRef.current = false;
        return;
      }

      if (hideUntilReady) setReady(false);

      const idx = getBestIndex(value);

      let r1 = 0;
      let r2 = 0;
      r1 = requestAnimationFrame(() => {
        r2 = requestAnimationFrame(() => {
          programmaticRef.current = true;
          el.scrollTo({ top: idx * itemH, behavior: "auto" });

          if (rafRef.current) cancelAnimationFrame(rafRef.current);
          rafRef.current = requestAnimationFrame(() => {
            programmaticRef.current = false;
            if (hideUntilReady) setReady(true);
          });
        });
      });

      return () => {
        cancelAnimationFrame(r1);
        cancelAnimationFrame(r2);
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (settleRef.current) window.clearTimeout(settleRef.current);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, value]);

    const commitFromScroll = useCallback(() => {
      const el = elRef.current;
      if (!el) return;

      const idx = clampIndex(Math.round(el.scrollTop / itemH));
      const next = items[idx];
      if (!next) return;

      if (next !== valueRef.current) {
        fromUserScrollRef.current = true;
        onChange(next);
      }
    }, [clampIndex, itemH, items, onChange]);

    const onScroll = useCallback(() => {
      if (programmaticRef.current) return;

      if (settleRef.current) window.clearTimeout(settleRef.current);
      settleRef.current = window.setTimeout(() => {
        commitFromScroll();
      }, settleMs);
    }, [commitFromScroll, settleMs]);

    const onTap = useCallback(
      (idx: number) => {
        if (!tapToSelect) return;
        const safe = clampIndex(idx);
        const next = items[safe];
        if (!next) return;

        scrollToIndex(safe, "smooth");

        if (next !== valueRef.current) {
          fromUserScrollRef.current = true;
          onChange(next);
        }
      },
      [tapToSelect, clampIndex, items, onChange, scrollToIndex]
    );

    return (
      <div className={["relative", className ?? ""].join(" ")}>
        <div className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2">
          <div
            className="mx-2 rounded-2xl border border-neutral-300 bg-neutral-50/70"
            style={{ height: itemH }}
          />
        </div>

        <div
          ref={elRef}
          onScroll={onScroll}
          // ✅ 모바일에서 pointer/touch 중복 커밋 방지: pointer만 사용
          onPointerUp={() => commit()}
          className="overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{
            height,
            scrollSnapType: "y mandatory" as any,
            WebkitOverflowScrolling: "touch",
            overscrollBehavior: "contain",
            visibility: !hideUntilReady || ready ? "visible" : "hidden",
          }}
        >
          <div style={{ height: pad }} />
          {items.map((it, idx) => (
            <button
              key={`${it}_${idx}`}
              type="button"
              onClick={() => onTap(idx)}
              className={[
                "flex w-full items-center justify-center",
                "text-sm font-semibold",
                it === value ? "text-neutral-900" : "text-neutral-400",
                "active:bg-neutral-100/60",
              ].join(" ")}
              style={{ height: itemH, scrollSnapAlign: "center" as any }}
            >
              {format ? format(it) : it}
            </button>
          ))}
          <div style={{ height: pad }} />
        </div>
      </div>
    );
  }
);

export const NumberWheelPicker = React.forwardRef<
  WheelPickerHandle<number>,
  {
    items: number[];
    value: number;
    onChange: (v: number) => void;
    height?: number;
    itemH?: number;
    className?: string;
    settleMs?: number;
    snapOnCommit?: boolean;
    hideUntilReady?: boolean;
    tapToSelect?: boolean;
    format?: (v: number) => string;
  }
>(function NumberWheelPicker({ items, value, onChange, format, ...rest }, ref) {
  const strItems = useMemo(() => items.map(String), [items]);
  const strValue = String(value);
  const innerRef = useRef<WheelPickerHandle<string> | null>(null);

  React.useImperativeHandle(
    ref,
    () => ({
      getValue: () => Number(innerRef.current?.getValue() ?? strValue),
      commit: () => Number(innerRef.current?.commit() ?? strValue),
    }),
    [strValue]
  );

  return (
    <WheelPicker
      ref={innerRef}
      items={strItems}
      value={strValue}
      onChange={(s) => onChange(Number(s))}
      format={format ? (s) => format(Number(s)) : undefined}
      {...rest}
    />
  );
});