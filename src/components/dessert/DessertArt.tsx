// 디저트 그림. 이모지는 기기마다 모양이 달라 앱 색과 어긋나므로, 앱 색으로 직접 그린 그림을 씁니다.
// 레벨·출석 보상으로 모으는 디저트도 이 그림을 늘려 씁니다.
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
