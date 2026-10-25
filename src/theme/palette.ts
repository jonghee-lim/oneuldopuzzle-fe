// 디저트 파스텔 색. 쨍한 원색 대신 크림·연한 민트·연분홍으로 오래 풀어도 눈이 덜 피곤하게 합니다(설계서).
export const dessert = {
  // 노란 기가 덜한 크림. 설계서의 크림색을 지키면서 오래 봐도 누렇게 보이지 않게 합니다.
  cream: "#FBF7F2",
  creamDeep: "#F3ECE4",
  paper: "#FFFFFF",
  cocoa: "#4E3B2E",
  // 보조 글자. 크림 바탕에서도 4.5:1을 넘깁니다.
  cocoaSoft: "#735A4B",
  strawberry: "#E8899E",
  strawberryDeep: "#B44D68",
  strawberryMilk: "#FCE4EA",
  mint: "#BFE8D9",
  mintDeep: "#2E7D66",
  mintMilk: "#E8F6F0",
  vanilla: "#FFF1D6",
  line: "#D9C9BC",
  conflict: "#D9534F",
  conflictMilk: "#FBE3E1",
} as const;

/** 레벨마다 돌아가며 보이는 디저트(테마 수집은 4단계에서 붙입니다). 그림은 components/dessert/DessertArt. */
export const DESSERTS = [
  { id: "cake", name: "딸기 케이크" },
  { id: "cupcake", name: "컵케이크" },
  { id: "donut", name: "딸기 도넛" },
  { id: "macaron", name: "민트 마카롱" },
  { id: "pudding", name: "커스터드 푸딩" },
  { id: "cookie", name: "초코칩 쿠키" },
] as const;

export type DessertId = (typeof DESSERTS)[number]["id"];

export function dessertForLevel(level: number): (typeof DESSERTS)[number] {
  return DESSERTS[(level - 1) % DESSERTS.length];
}
