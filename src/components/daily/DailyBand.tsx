import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import { Box, ButtonBase, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import DessertArt from "../dessert/DessertArt";
import { dailyKinds, dailySudokuDifficulty, dateKey, streakOf } from "../../puzzle/core/daily";
import { DIFFICULTY_LABEL } from "../../puzzle/sudoku/generator";
import { usePuzzleStore } from "../../stores/puzzleStore";
import { dessert } from "../../theme/palette";
import { radius } from "../../theme/shape";
import { DAILY_NAME, DAILY_ROUTE, dailyDessert } from "./daily";

/** 첫 화면 위 '오늘의 퍼즐' 띠: 날짜로 고른 세 판, 다 풀면 힌트 보너스와 연속 출석 */
export default function DailyBand() {
  const today = dateKey();
  const storedDate = usePuzzleStore((s) => s.dailyDate);
  const storedDone = usePuzzleStore((s) => s.dailyDone);
  const days = usePuzzleStore((s) => s.dailyDays);
  const hints = usePuzzleStore((s) => s.hints);
  // 날짜가 바뀌었으면 어제 푼 기록은 오늘 것으로 보지 않습니다(판은 열 때 새로 만듭니다).
  const done = storedDate === today ? storedDone : [];
  const kinds = dailyKinds(today);
  const streak = streakOf(days, today);
  const treat = dailyDessert(today);
  const allDone = kinds.every((k) => done.includes(k));

  return (
    <Box component="section" aria-labelledby="daily-title" sx={{ borderRadius: radius.card, bgcolor: dessert.paper, p: 2, boxShadow: "0 1px 2px rgba(78,59,46,.06), 0 8px 24px rgba(78,59,46,.06)" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <DessertArt id={treat.id} size={52} title={treat.name} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography id="daily-title" component="h2" sx={{ fontSize: 18, fontWeight: 800 }}>
            오늘의 퍼즐 <Box component="span" sx={{ color: dessert.cocoaSoft, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{done.length}/{kinds.length}</Box>
          </Typography>
          <Typography sx={{ fontSize: 13, color: dessert.cocoaSoft }}>
            {allDone ? "오늘 몫을 다 풀었어요. 내일 또 만나요!" : `세 판을 다 풀면 ${treat.name}${withParticle(treat.name)} 힌트를 받아요`}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 800, color: dessert.strawberryDeep, fontVariantNumeric: "tabular-nums" }}>연속 {streak}일</Typography>
          <Typography aria-label={`남은 힌트 ${hints}개`} sx={{ fontSize: 13, fontWeight: 700, color: dessert.cocoaSoft, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 0.25 }}>
            <LightbulbOutlinedIcon aria-hidden sx={{ fontSize: 15 }} />
            {hints}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${kinds.length}, 1fr)`, gap: 1, mt: 1.5 }}>
        {kinds.map((k) => {
          const finished = done.includes(k);
          const label = k === "sudoku" ? `스도쿠 ${DIFFICULTY_LABEL[dailySudokuDifficulty(today)]}` : DAILY_NAME[k];
          return (
            <ButtonBase
              key={k}
              component={Link}
              to={DAILY_ROUTE[k]}
              aria-label={`오늘의 퍼즐 ${label}${finished ? ", 완료" : ""}`}
              sx={{
                minHeight: 52,
                px: 1,
                borderRadius: radius.item,
                gap: 0.5,
                fontSize: 14,
                fontWeight: 700,
                lineHeight: 1.25,
                textAlign: "center",
                color: finished ? dessert.mintDeep : dessert.cocoa,
                bgcolor: finished ? dessert.mintMilk : dessert.creamDeep,
                "&.Mui-focusVisible": { outline: `3px solid ${dessert.strawberryDeep}`, outlineOffset: "2px" },
              }}
            >
              {finished && <CheckCircleIcon aria-hidden sx={{ fontSize: 18 }} />}
              {label}
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}

/** 받침이 있으면 '과', 없으면 '와' */
function withParticle(word: string): string {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  return code >= 0 && code < 11172 && code % 28 !== 0 ? "과" : "와";
}
