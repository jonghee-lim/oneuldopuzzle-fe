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

/** 모으는 디저트(도감 순서). 레벨마다 돌아가며 보이고, 별을 모으거나 오늘의 퍼즐로 받습니다. 그림은 components/dessert/DessertArt. */
export const DESSERTS = [
  { id: "cake", name: "딸기 케이크" },
  { id: "cupcake", name: "컵케이크" },
  { id: "donut", name: "딸기 도넛" },
  { id: "macaron", name: "민트 마카롱" },
  { id: "pudding", name: "커스터드 푸딩" },
  { id: "cookie", name: "초코칩 쿠키" },
  { id: "tart", name: "딸기 타르트" },
  { id: "roll", name: "롤케이크" },
  { id: "icecream", name: "아이스크림" },
  { id: "croissant", name: "크루아상" },
  { id: "madeleine", name: "마들렌" },
  { id: "waffle", name: "와플" },
  { id: "pancake", name: "팬케이크" },
  { id: "jelly", name: "과일 젤리" },
  { id: "choux", name: "슈크림" },
  { id: "taiyaki", name: "붕어빵" },
  { id: "bingsu", name: "딸기 빙수" },
  { id: "cheesecake", name: "치즈케이크" },
] as const;

export type DessertId = (typeof DESSERTS)[number]["id"];

export function dessertForLevel(level: number): (typeof DESSERTS)[number] {
  const n = DESSERTS.length;
  return DESSERTS[(((level - 1) % n) + n) % n];
}

/**
 * 색깔 구역 퍼즐의 구역 색(8개). 서로 이웃해도 구별되도록 색상(빨강·주황·노랑·초록·청록·파랑·보라·분홍)을 고루 나누고,
 * 색만으로 구분하지 않도록 구역 경계에 굵은 선을 함께 그립니다.
 */
export const ZONE_COLORS = ["#F9C9D4", "#FBD9B0", "#F6EDA6", "#C9E8B8", "#B7E3DC", "#BCD5F2", "#D7C9F0", "#EBC7E6"] as const;
