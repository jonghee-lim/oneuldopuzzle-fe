// 같은 씨앗(seed)이면 언제나 같은 문제가 나오도록 하는 난수기입니다.
// 레벨 번호로 문제를 다시 만들 수 있어야 서버 문제 풀과 앱이 같은 문제를 가리킬 수 있습니다.

export type Rng = () => number;

/** 문자열을 32비트 씨앗으로 바꿉니다(FNV-1a). */
export function seedFrom(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** mulberry32: 0 이상 1 미만의 수를 돌려줍니다. */
export function createRng(seed: number): Rng {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** 배열을 제자리에서 섞고 그대로 돌려줍니다. */
export function shuffle<T>(items: T[], rng: Rng): T[] {
  for (let i = items.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
