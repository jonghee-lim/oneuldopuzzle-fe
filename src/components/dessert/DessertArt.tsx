// 디저트 그림. 이모지는 기기마다 모양이 달라 앱 색과 어긋나므로, 앱 색으로 직접 그린 그림을 씁니다.
// 퍼즐 조각(색깔 구역의 마카롱, 블록 탈출의 케이크 등)과 완성 그림에 씁니다.
import { Box } from "@mui/material";
import type { ReactNode } from "react";
import { DESSERTS, type DessertId } from "../../theme/palette";

const C = {
  cream: "#FFFDF8",
  sponge: "#F4D9A8",
  spongeDeep: "#E2B97A",
  strawberry: "#E8899E",
  berry: "#D9566F",
  leaf: "#6BB596",
  mint: "#BFE8D9",
  mintDeep: "#7CC6AE",
  pink: "#F8C8D4",
  cocoa: "#6B4E3D",
  caramel: "#C98B4A",
  custard: "#F7DE8F",
  plate: "#EADFD6",
};

const ART: Record<DessertId, ReactNode> = {
  cake: (
    <>
      <ellipse cx="32" cy="54" rx="26" ry="5" fill={C.plate} />
      <path d="M8 30 L52 22 L56 30 L56 50 L8 50 Z" fill={C.sponge} />
      <path d="M8 36 L56 36 L56 40 L8 40 Z" fill={C.pink} />
      <path d="M8 44 L56 44 L56 46 L8 46 Z" fill={C.spongeDeep} />
      <path d="M8 30 L52 22 L56 30 Z" fill={C.cream} />
      <path d="M8 30 L56 30 L56 33 Q50 36 44 33 Q38 36 32 33 Q26 36 20 33 Q14 36 8 33 Z" fill={C.cream} />
      <path d="M40 14 Q46 10 50 15 Q52 22 45 25 Q38 22 40 14 Z" fill={C.berry} />
      <path d="M43 13 L45 9 L47 13 Z" fill={C.leaf} />
    </>
  ),
  cupcake: (
    <>
      <path d="M14 34 L50 34 L45 56 L19 56 Z" fill={C.mintDeep} />
      <path d="M23 34 L25 56 M32 34 L32 56 M41 34 L39 56" stroke={C.mint} strokeWidth="3" />
      <ellipse cx="32" cy="33" rx="21" ry="7" fill={C.pink} />
      <ellipse cx="32" cy="25" rx="16" ry="7" fill={C.pink} />
      <ellipse cx="32" cy="18" rx="10" ry="5.5" fill={C.strawberry} />
      <circle cx="32" cy="10" r="5" fill={C.berry} />
      <path d="M32 5 Q35 1 38 2" stroke={C.leaf} strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),
  donut: (
    <>
      <circle cx="32" cy="33" r="24" fill={C.spongeDeep} />
      <path d="M32 11 C46 11 55 20 55 30 C55 34 52 34 50 37 C47 41 44 36 40 40 C36 44 33 39 28 42 C23 45 20 39 16 40 C11 41 9 36 9 31 C9 20 18 11 32 11 Z" fill={C.strawberry} />
      <circle cx="32" cy="32" r="8" fill="#FFFFFF" />
      <g fill={C.cream}>
        <rect x="20" y="18" width="6" height="2.4" rx="1.2" transform="rotate(-30 23 19)" />
        <rect x="38" y="17" width="6" height="2.4" rx="1.2" transform="rotate(25 41 18)" />
        <rect x="45" y="27" width="6" height="2.4" rx="1.2" transform="rotate(80 48 28)" />
      </g>
      <g fill={C.mint}>
        <rect x="14" y="28" width="6" height="2.4" rx="1.2" transform="rotate(60 17 29)" />
        <rect x="29" y="15" width="6" height="2.4" rx="1.2" />
        <rect x="40" y="33" width="6" height="2.4" rx="1.2" transform="rotate(-40 43 34)" />
      </g>
    </>
  ),
  macaron: (
    <>
      <ellipse cx="32" cy="55" rx="22" ry="4" fill={C.plate} />
      <rect x="10" y="34" width="44" height="17" rx="8.5" fill={C.mintDeep} />
      <rect x="12" y="29" width="40" height="7" rx="3.5" fill={C.cream} />
      <rect x="10" y="14" width="44" height="17" rx="8.5" fill={C.mint} />
      <path d="M11 31 Q16 28 21 31 Q26 28 32 31 Q38 28 43 31 Q48 28 53 31" stroke={C.mintDeep} strokeWidth="2" fill="none" />
    </>
  ),
  pudding: (
    <>
      <ellipse cx="32" cy="54" rx="27" ry="5" fill={C.plate} />
      <path d="M18 20 L46 20 L52 52 L12 52 Z" fill={C.custard} />
      <path d="M18 20 L46 20 L47.5 28 Q42 32 38 27 Q34 33 29 27 Q24 32 16.5 28 Z" fill={C.caramel} />
      <ellipse cx="32" cy="20" rx="14" ry="3.5" fill={C.caramel} />
      <circle cx="32" cy="13" r="5" fill={C.berry} />
      <path d="M32 8 Q35 4 38 5" stroke={C.leaf} strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),
  cookie: (
    <>
      <circle cx="32" cy="32" r="24" fill={C.sponge} />
      <circle cx="32" cy="32" r="24" fill="none" stroke={C.spongeDeep} strokeWidth="3" />
      <g fill={C.cocoa}>
        <circle cx="22" cy="24" r="3.2" />
        <circle cx="38" cy="20" r="2.6" />
        <circle cx="42" cy="35" r="3.4" />
        <circle cx="27" cy="40" r="2.8" />
        <circle cx="33" cy="30" r="2.2" />
        <circle cx="20" cy="34" r="2" />
        <circle cx="35" cy="45" r="2.4" />
      </g>
    </>
  ),
  tart: (
    <>
      <ellipse cx="32" cy="52" rx="27" ry="5" fill={C.plate} />
      <path d="M7 36 L57 36 L52 50 L12 50 Z" fill={C.spongeDeep} />
      <path d="M7 36 Q12 40 17 36 Q22 40 27 36 Q32 40 37 36 Q42 40 47 36 Q52 40 57 36" stroke={C.caramel} strokeWidth="1.6" fill="none" />
      <ellipse cx="32" cy="35" rx="25" ry="5" fill={C.custard} />
      <g fill={C.berry}>
        <path d="M16 31 Q16 24 21 24 Q26 24 25 31 Q21 35 16 31 Z" />
        <path d="M28 29 Q28 21 33 21 Q38 21 37 29 Q33 33 28 29 Z" />
        <path d="M40 31 Q40 24 45 24 Q50 24 49 31 Q45 35 40 31 Z" />
      </g>
      <g fill={C.leaf}>
        <path d="M19 24 L21 21 L23 24 Z" />
        <path d="M31 21 L33 18 L35 21 Z" />
        <path d="M43 24 L45 21 L47 24 Z" />
      </g>
    </>
  ),
  roll: (
    <>
      <ellipse cx="32" cy="53" rx="27" ry="5" fill={C.plate} />
      <rect x="6" y="22" width="34" height="28" rx="4" fill={C.sponge} />
      <ellipse cx="42" cy="36" rx="14" ry="14" fill={C.spongeDeep} />
      <ellipse cx="42" cy="36" rx="11.5" ry="11.5" fill={C.sponge} />
      <path d="M42 36 m0 -7 a7 7 0 1 1 -7 7 a4.5 4.5 0 1 1 4.5 -4.5" stroke={C.cream} strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="42" cy="36" r="2" fill={C.strawberry} />
      <path d="M8 22 Q14 18 20 22 Q26 18 32 22 Q36 19 40 22" stroke={C.cream} strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="18" cy="16" r="4" fill={C.berry} />
    </>
  ),
  icecream: (
    <>
      <path d="M20 30 L44 30 L32 60 Z" fill={C.spongeDeep} />
      <path d="M23 36 L41 36 M26 43 L38 43 M29 50 L35 50" stroke={C.caramel} strokeWidth="1.5" />
      <path d="M25 31 L35 55 M39 31 L29 55" stroke={C.caramel} strokeWidth="1.2" opacity="0.6" />
      <circle cx="24" cy="25" r="10" fill={C.mint} />
      <circle cx="40" cy="25" r="10" fill={C.pink} />
      <circle cx="32" cy="15" r="10" fill={C.custard} />
      <path d="M15 30 Q20 34 25 30 Q30 34 34 30 Q39 34 44 30 Q48 33 50 29" stroke={C.cream} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <circle cx="32" cy="5" r="4" fill={C.berry} />
    </>
  ),
  croissant: (
    <>
      <ellipse cx="32" cy="50" rx="27" ry="5" fill={C.plate} />
      <path d="M6 40 Q10 22 32 18 Q54 22 58 40 Q52 46 46 42 Q40 48 32 45 Q24 48 18 42 Q12 46 6 40 Z" fill={C.spongeDeep} />
      <path d="M18 42 Q20 28 26 21 M32 45 L32 18 M46 42 Q44 28 38 21" stroke={C.caramel} strokeWidth="2" fill="none" />
      <path d="M12 34 Q20 30 28 34 M36 34 Q44 30 52 34" stroke={C.sponge} strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),
  madeleine: (
    <>
      <ellipse cx="32" cy="52" rx="26" ry="5" fill={C.plate} />
      <path d="M8 44 Q8 16 32 14 Q56 16 56 44 Q32 52 8 44 Z" fill={C.custard} />
      <path d="M32 46 L32 18 M22 45 L18 22 M42 45 L46 22 M13 43 L10 30 M51 43 L54 30" stroke={C.spongeDeep} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M8 44 Q32 52 56 44" stroke={C.caramel} strokeWidth="2.5" fill="none" />
    </>
  ),
  waffle: (
    <>
      <ellipse cx="32" cy="54" rx="26" ry="5" fill={C.plate} />
      <rect x="9" y="14" width="46" height="38" rx="8" fill={C.spongeDeep} />
      <g fill={C.sponge}>
        {[0, 1, 2, 3].flatMap((r) => [0, 1, 2, 3, 4].map((c) => <rect key={`${r}-${c}`} x={13 + c * 8.2} y={18 + r * 8.2} width="6" height="6" rx="1.2" />))}
      </g>
      <path d="M30 14 Q34 22 40 18 Q44 26 50 22 L50 14 Z" fill={C.cream} />
      <circle cx="44" cy="12" r="4.5" fill={C.berry} />
    </>
  ),
  pancake: (
    <>
      <ellipse cx="32" cy="55" rx="28" ry="5" fill={C.plate} />
      <rect x="8" y="42" width="48" height="9" rx="4.5" fill={C.spongeDeep} />
      <rect x="9" y="34" width="46" height="9" rx="4.5" fill={C.sponge} />
      <rect x="8" y="26" width="48" height="9" rx="4.5" fill={C.spongeDeep} />
      <path d="M12 27 Q20 23 32 24 Q46 23 52 27 L50 34 Q48 30 46 34 L44 29 Q40 31 38 28 L36 36 Q34 30 30 30 L26 33 Q22 30 18 31 L14 30 Z" fill={C.caramel} />
      <rect x="27" y="17" width="10" height="7" rx="1.5" fill={C.custard} />
    </>
  ),
  jelly: (
    <>
      <ellipse cx="32" cy="55" rx="26" ry="5" fill={C.plate} />
      <path d="M14 52 L18 20 Q32 12 46 20 L50 52 Z" fill={C.strawberry} opacity="0.85" />
      <path d="M18 20 Q32 12 46 20 Q32 27 18 20 Z" fill={C.pink} />
      <path d="M22 26 L19 48" stroke={C.cream} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <circle cx="34" cy="36" r="5" fill={C.custard} />
      <circle cx="40" cy="45" r="4" fill={C.mintDeep} />
      <circle cx="28" cy="44" r="3.5" fill={C.berry} />
    </>
  ),
  choux: (
    <>
      <ellipse cx="32" cy="54" rx="25" ry="5" fill={C.plate} />
      <path d="M10 44 Q8 30 18 26 Q22 16 32 18 Q42 15 46 25 Q57 30 54 44 Q32 52 10 44 Z" fill={C.spongeDeep} />
      <path d="M10 40 Q32 34 54 40 Q50 46 32 48 Q14 46 10 40 Z" fill={C.cream} />
      <path d="M20 26 Q26 22 30 26 M36 23 Q40 20 44 24" stroke={C.caramel} strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <g fill={C.cream} opacity="0.9">
        <circle cx="24" cy="20" r="1.5" />
        <circle cx="38" cy="18" r="1.5" />
        <circle cx="46" cy="28" r="1.5" />
      </g>
    </>
  ),
  taiyaki: (
    <>
      <ellipse cx="32" cy="52" rx="27" ry="5" fill={C.plate} />
      <path d="M8 34 Q14 18 34 18 Q46 18 50 26 L60 18 L58 34 L60 50 L50 42 Q46 50 34 50 Q14 50 8 34 Z" fill={C.spongeDeep} />
      <circle cx="18" cy="30" r="2.5" fill={C.cocoa} />
      <path d="M12 38 Q16 41 20 38" stroke={C.cocoa} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      <g stroke={C.caramel} strokeWidth="1.8" fill="none">
        <path d="M28 26 Q31 30 28 34 M34 26 Q37 30 34 34 M40 26 Q43 30 40 34" />
        <path d="M31 36 Q34 40 31 44 M37 36 Q40 40 37 44" />
      </g>
      <path d="M50 26 Q53 34 50 42" stroke={C.caramel} strokeWidth="1.8" fill="none" />
    </>
  ),
  bingsu: (
    <>
      <path d="M12 40 L52 40 L46 56 L18 56 Z" fill={C.mint} />
      <path d="M12 40 L52 40 L50 45 L14 45 Z" fill={C.mintDeep} />
      <path d="M12 40 Q10 22 32 14 Q54 22 52 40 Z" fill={C.cream} />
      <path d="M16 36 Q22 26 32 30 Q42 26 48 36 Q40 32 32 38 Q24 32 16 36 Z" fill={C.strawberry} opacity="0.8" />
      <g fill={C.berry}>
        <path d="M26 20 Q26 13 31 13 Q36 13 35 20 Q31 24 26 20 Z" />
        <path d="M34 24 Q34 18 39 18 Q44 18 43 24 Q39 28 34 24 Z" />
      </g>
      <path d="M29 13 L31 10 L33 13 Z M37 18 L39 15 L41 18 Z" fill={C.leaf} />
      <circle cx="22" cy="30" r="2.5" fill={C.custard} />
    </>
  ),
  cheesecake: (
    <>
      <ellipse cx="32" cy="54" rx="27" ry="5" fill={C.plate} />
      <path d="M8 34 L50 24 L56 34 L56 50 L8 50 Z" fill={C.custard} />
      <path d="M8 46 L56 46 L56 50 L8 50 Z" fill={C.spongeDeep} />
      <path d="M8 34 L50 24 L56 34 Z" fill="#FBEFC4" />
      <path d="M8 34 L56 34" stroke={C.caramel} strokeWidth="1.2" opacity="0.5" />
      <path d="M38 22 Q36 14 42 12 Q48 14 46 22 Q42 26 38 22 Z" fill={C.berry} />
      <path d="M30 28 Q32 22 38 24 Q40 30 34 31 Z" fill={C.strawberry} />
    </>
  ),
};

export default function DessertArt({ id, size = 64, title }: { id: DessertId; size?: number | string; title?: string }) {
  const name = DESSERTS.find((d) => d.id === id)?.name ?? "";
  return (
    <Box
      component="svg"
      viewBox="0 0 64 64"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      data-dessert={name}
      sx={{ width: size, height: size, display: "block", flex: "none" }}
    >
      {ART[id]}
    </Box>
  );
}
