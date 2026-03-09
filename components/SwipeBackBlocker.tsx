"use client";

import { useEffect } from "react";

export default function SwipeBackBlocker() {
  useEffect(() => {
    let startX = 0;
    let startY = 0;
    let tracking = false;
    let fromLeftEdge = false;
    let fromRightEdge = false;

    const EDGE_SIZE = 32;
    const HORIZONTAL_LOCK_DISTANCE = 10;
    const VERTICAL_TOLERANCE = 28;

    const onTouchStart = (e: TouchEvent) => {
      if (!e.touches || e.touches.length !== 1) return;

      const t = e.touches[0];
      startX = t.clientX;
      startY = t.clientY;

      fromLeftEdge = startX <= EDGE_SIZE;
      fromRightEdge = startX >= window.innerWidth - EDGE_SIZE;
      tracking = fromLeftEdge || fromRightEdge;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!tracking || !e.touches || e.touches.length !== 1) return;

      const t = e.touches[0];
      const dx = t.clientX - startX;
      const dy = t.clientY - startY;

      // 세로 스크롤 의도면 차단 해제
      if (Math.abs(dy) > VERTICAL_TOLERANCE && Math.abs(dy) > Math.abs(dx)) {
        tracking = false;
        return;
      }

      // 왼쪽 가장자리 -> 오른쪽 스와이프(뒤로가기)
      if (fromLeftEdge && dx > HORIZONTAL_LOCK_DISTANCE) {
        e.preventDefault();
      }

      // 오른쪽 가장자리 -> 왼쪽 스와이프(앞으로가기)
      if (fromRightEdge && dx < -HORIZONTAL_LOCK_DISTANCE) {
        e.preventDefault();
      }
    };

    const reset = () => {
      tracking = false;
      fromLeftEdge = false;
      fromRightEdge = false;
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