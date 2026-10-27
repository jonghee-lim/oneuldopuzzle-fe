// 하는 법을 이미 본 퍼즐. 진행 기록과 따로 둡니다(기기 저장소를 못 쓰면 매번 보여 주지 않도록 이번 실행 동안만 기억).
import type { GuideKind } from "./guides";

const KEY = "oneuldopuzzle-guide-seen";
const memory = new Set<string>();

function read(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY);
    return new Set([...memory, ...(raw ? (JSON.parse(raw) as string[]) : [])]);
  } catch {
    return memory;
  }
}

export function guideSeen(kind: GuideKind): boolean {
  return read().has(kind);
}

export function markGuideSeen(kind: GuideKind): void {
  memory.add(kind);
  try {
    localStorage.setItem(KEY, JSON.stringify([...read(), kind]));
  } catch {
    // 저장소를 못 쓰면 이번 실행 동안만 기억합니다.
  }
}
