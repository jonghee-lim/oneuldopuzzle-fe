import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Box, ButtonBase, LinearProgress, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import DessertArt from "../components/dessert/DessertArt";
import StarIcon from "../components/dessert/StarIcon";
import Page from "../components/layout/Page";
import PuzzleHeader from "../components/layout/PuzzleHeader";
import { STARS_PER_DESSERT, isUnlocked, nextUnlockAt, totalStarsOf, unlockedByStars } from "../puzzle/core/collection";
import { usePuzzleStore } from "../stores/puzzleStore";
import { DESSERTS, dessert } from "../theme/palette";
import { radius } from "../theme/shape";

/** 디저트 도감(2026-10-26 사용자 결정: 계속하게 만드는 중심 재미). 별 6개마다 하나씩 열리고, 오늘의 퍼즐 세 판을 다 풀면 그날 디저트를 받습니다. */
export default function DessertsPage() {
  const stars = usePuzzleStore((s) => s.stars);
  const treats = usePuzzleStore((s) => s.treats);
  const total = totalStarsOf(stars);
  const n = DESSERTS.length;
  const open = DESSERTS.filter((d, i) => isUnlocked(i, d.id, total, n, treats)).length;
  const next = nextUnlockAt(total, n);
  const nextDessert = next === null ? null : DESSERTS[unlockedByStars(total, n)];
  const progress = next === null ? 100 : ((total % STARS_PER_DESSERT) / STARS_PER_DESSERT) * 100;

  return (
    <Page>
      <PuzzleHeader title="디저트 도감" subtitle={`${open}/${n} 모음`} />
      <Box sx={{ px: 2, pt: 1.5, pb: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box component="section" aria-label="모은 별" sx={{ borderRadius: radius.card, bgcolor: dessert.vanilla, p: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <StarIcon size={28} />
            <Typography sx={{ fontSize: 28, fontWeight: 800, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{total}</Typography>
            <Typography sx={{ fontSize: 14, color: dessert.cocoaSoft, fontWeight: 600, ml: 0.25 }}>모은 별</Typography>
          </Box>
          <Typography sx={{ fontSize: 14, mt: 1, fontWeight: 600 }}>
            {nextDessert && next !== null ? `별 ${next - total}개 더 모으면 다음 디저트가 열려요` : "별로 여는 디저트를 모두 열었어요!"}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            aria-label="다음 디저트까지"
            sx={{ mt: 1, height: 8, borderRadius: radius.pill, bgcolor: dessert.paper, "& .MuiLinearProgress-bar": { bgcolor: "#F2B33D", borderRadius: radius.pill } }}
          />
          <Typography sx={{ fontSize: 13, color: dessert.cocoaSoft, mt: 1 }}>레벨마다 별 1~3개 · 오늘의 퍼즐 세 판을 다 풀면 그날 디저트를 받아요</Typography>
        </Box>

        <Box component="ul" aria-label="디저트" sx={{ listStyle: "none", m: 0, p: 0, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
          {DESSERTS.map((d, i) => {
            const unlocked = isUnlocked(i, d.id, total, n, treats);
            const got = treats[d.id] ?? 0;
            return (
              <Box
                component="li"
                key={d.id}
                aria-label={unlocked ? `${d.name}${got ? `, 받은 수 ${got}` : ""}` : `잠김, 별 ${i * STARS_PER_DESSERT}개에 열림`}
                sx={{ position: "relative", bgcolor: unlocked ? dessert.paper : dessert.creamDeep, borderRadius: radius.item, p: 1, pt: 1.5, display: "flex", flexDirection: "column", alignItems: "center", gap: 0.5, minHeight: 124 }}
              >
                <Box sx={unlocked ? undefined : { filter: "brightness(0)", opacity: 0.12 }}>
                  <DessertArt id={d.id} size={60} />
                </Box>
                {unlocked ? (
                  <Typography sx={{ fontSize: 13, fontWeight: 700, textAlign: "center", lineHeight: 1.25 }}>{d.name}</Typography>
                ) : (
                  <Typography sx={{ fontSize: 13, fontWeight: 700, color: dessert.cocoaSoft, display: "flex", alignItems: "center", gap: 0.25 }}>
                    <LockOutlinedIcon aria-hidden sx={{ fontSize: 14 }} />
                    <StarIcon size={13} />
                    {i * STARS_PER_DESSERT}
                  </Typography>
                )}
                {got > 0 && (
                  <Box component="span" aria-hidden sx={{ position: "absolute", top: 6, right: 6, px: 0.75, borderRadius: radius.pill, bgcolor: dessert.strawberryMilk, color: dessert.strawberryDeep, fontSize: 12, fontWeight: 800 }}>
                    ×{got}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        <ButtonBase component={Link} to="/records" sx={{ alignSelf: "center", px: 2, minHeight: 44, borderRadius: radius.pill, fontSize: 14, fontWeight: 700, color: dessert.mintDeep }}>
          퍼즐별 기록 보기
        </ButtonBase>
      </Box>
    </Page>
  );
}
