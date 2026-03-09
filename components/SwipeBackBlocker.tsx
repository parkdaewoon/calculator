"use client";

import { useEffect } from "react";

export default function SwipeBackBlocker() {
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let block = false;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;

      startX = t.clientX;
      startY = t.clientY;

      // 왼쪽 가장자리에서 시작한 터치만 대상으로 함
      block = startX <= 24;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!block) return;

      const t = e.touches[0];
      if (!t) return;

      const dx = t.clientX - startX;
      const dy = Math.abs(t.clientY - startY);

      // 오른쪽으로 미는 가로 스와이프만 차단
      if (dx > 10 && dx > dy) {
        e.preventDefault();
      }
    };

    const onTouchEnd = () => {
      block = false;
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: false });
    document.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return null;
}