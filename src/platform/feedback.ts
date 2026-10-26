// 효과음·진동. 소리 파일 없이 Web Audio로 짧고 부드러운 소리를 만듭니다.
// 인기 스도쿠 앱(Sudoku.com 등)처럼 효과음은 켜 두되 작게, 설정에서 끌 수 있게 합니다(2026-10-26 검토).
import { usePuzzleStore } from "../stores/puzzleStore";

export type Cue = "tap" | "place" | "erase" | "wrong" | "line" | "clear";

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  try {
    ctx ??= new Ctor();
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

/** 한 음: 주파수(Hz), 시작(초), 길이(초), 크기 */
function tone(a: AudioContext, freq: number, start: number, length: number, gain: number, type: OscillatorType = "sine") {
  const osc = a.createOscillator();
  const vol = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t = a.currentTime + start;
  vol.gain.setValueAtTime(0, t);
  vol.gain.linearRampToValueAtTime(gain, t + 0.01);
  vol.gain.exponentialRampToValueAtTime(0.0001, t + length);
  osc.connect(vol).connect(a.destination);
  osc.start(t);
  osc.stop(t + length + 0.02);
}

const SOUNDS: Record<Cue, (a: AudioContext) => void> = {
  tap: (a) => tone(a, 880, 0, 0.05, 0.03),
  place: (a) => tone(a, 660, 0, 0.09, 0.06, "triangle"),
  erase: (a) => tone(a, 440, 0, 0.08, 0.04, "triangle"),
  wrong: (a) => {
    tone(a, 220, 0, 0.16, 0.06, "triangle");
    tone(a, 196, 0.08, 0.18, 0.05, "triangle");
  },
  // 줄·상자를 다 채움: 올라가는 두 음
  line: (a) => {
    tone(a, 784, 0, 0.12, 0.05, "triangle");
    tone(a, 1047, 0.08, 0.16, 0.05, "triangle");
  },
  // 완성: 도미솔도
  clear: (a) => [523, 659, 784, 1047].forEach((f, k) => tone(a, f, k * 0.11, 0.3, 0.07, "triangle")),
};

const VIBRATION: Partial<Record<Cue, number | number[]>> = { place: 8, wrong: [20, 40, 20], line: 15, clear: [30, 50, 60] };

export function cue(name: Cue) {
  const { sound, haptics } = usePuzzleStore.getState().settings;
  if (sound) {
    const a = audio();
    if (a) SOUNDS[name](a);
  }
  if (haptics && VIBRATION[name] !== undefined && typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(VIBRATION[name]!);
    } catch {
      // 진동을 막은 브라우저는 조용히 넘어갑니다.
    }
  }
}
