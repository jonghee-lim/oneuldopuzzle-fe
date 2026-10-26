// 화면 움직임 모음. 움직임 줄이기 설정이면 모두 멈춥니다.

/** 완성 그림이 톡 튀어나오는 움직임(움직임 줄이기 설정이면 멈춤) */
export const popIn = {
  "@keyframes pop-in": {
    "0%": { transform: "scale(0.6) rotate(-8deg)", opacity: 0 },
    "60%": { transform: "scale(1.12) rotate(3deg)", opacity: 1 },
    "100%": { transform: "scale(1) rotate(0deg)" },
  },
  animation: "pop-in 520ms cubic-bezier(.2,.9,.3,1.2) both",
  "@media (prefers-reduced-motion: reduce)": { animation: "none" },
} as const;

/** 줄·상자를 다 채운 칸이 한 번 반짝입니다. */
export const flash = {
  "@keyframes cell-flash": {
    "0%": { opacity: 0 },
    "30%": { opacity: 0.85 },
    "100%": { opacity: 0 },
  },
  animation: "cell-flash 650ms ease-out both",
  "@media (prefers-reduced-motion: reduce)": { animation: "none", opacity: 0 },
} as const;
