"use client";

import { useEffect } from "react";

export default function SwipeBackBlocker() {
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let block = false;

    const EDGE_SIZE = 20;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;

      startX = t.clientX;
      startY = t.clientY;
      block = startX <= EDGE_SIZE;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!block) return;

      const t = e.touches[0];
      if (!t) return;

      const dx = t.clientX - startX;
      const dy = Math.abs(t.clientY - startY);

      if (dx > 12 && dx > dy) {
        e.preventDefault();
      }
    };

    const reset = () => {
      block = false;
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", reset, { passive: true });
    window.addEventListener("touchcancel", reset, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", reset);
      window.removeEventListener("touchcancel", reset);
    };
  }, []);

  return null;
}