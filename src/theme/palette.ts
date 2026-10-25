// 디저트 파스텔 색. 쨍한 원색 대신 크림·연한 민트·연분홍으로 오래 풀어도 눈이 덜 피곤하게 합니다(설계서).
export const dessert = {
  cream: "#FFF8EF",
  paper: "#FFFFFF",
  cocoa: "#5A4636",
  cocoaSoft: "#8B7262",
  strawberry: "#E8899E",
  strawberryDeep: "#C9607A",
  strawberryMilk: "#FCE4EA",
  mint: "#BFE8D9",
  mintDeep: "#3E8E77",
  mintMilk: "#E8F6F0",
  vanilla: "#FFF1D6",
  line: "#D9C9BC",
  conflict: "#D9534F",
  conflictMilk: "#FBE3E1",
} as const;

/** 레벨마다 돌아가며 보이는 디저트(테마 수집은 4단계에서 붙입니다). */
export const DESSERTS = ["🍰", "🧁", "🍩", "🍪", "🍮", "🍓", "🍦", "🍫", "🥞", "🍡"] as const;

export function dessertForLevel(level: number): string {
  return DESSERTS[(level - 1) % DESSERTS.length];
}
