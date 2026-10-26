// 손가락으로 쓸기(스와이프). 2026-10-26 사용자 요청으로 누르기와 함께 씁니다.
// 짧게 누르면 그대로 누르기(click)로 처리하고, 일정 거리 이상 쓸면 쓸기로 처리한 뒤 뒤따르는 click은 막습니다.
import { useRef, type PointerEvent, type MouseEvent } from "react";

export type SwipeDir = "up" | "down" | "left" | "right";

export interface Swipe {
  dir: SwipeDir;
  /** 쓴 거리(px, 방향 축) */
  distance: number;
  /** 쓸기를 시작한 요소의 크기(칸 크기 계산용) */
  rect: DOMRect;
}

const THRESHOLD = 16;

export function useSwipe(onSwipe: (swipe: Swipe) => void) {
  const start = useRef<{ x: number; y: number; rect: DOMRect } | null>(null);
  const swiped = useRef(false);
  return {
    onPointerDown: (e: PointerEvent<HTMLElement>) => {
      start.current = { x: e.clientX, y: e.clientY, rect: e.currentTarget.getBoundingClientRect() };
      // 손가락이 요소 밖으로 나가도 떼는 순간을 이 요소가 받도록 붙잡습니다.
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // 붙잡기를 지원하지 않으면 요소 안에서 뗀 경우만 쓸기로 봅니다.
      }
      swiped.current = false;
    },
    onPointerUp: (e: PointerEvent<HTMLElement>) => {
      const s = start.current;
      start.current = null;
      if (!s) return;
      const dx = e.clientX - s.x;
      const dy = e.clientY - s.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < THRESHOLD) return;
      swiped.current = true;
      const horizontal = Math.abs(dx) >= Math.abs(dy);
      onSwipe({ dir: horizontal ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up", distance: horizontal ? Math.abs(dx) : Math.abs(dy), rect: s.rect });
    },
    onPointerCancel: () => {
      start.current = null;
    },
    onClickCapture: (e: MouseEvent<HTMLElement>) => {
      if (swiped.current) {
        swiped.current = false;
        e.stopPropagation();
        e.preventDefault();
      }
    },
  };
}
