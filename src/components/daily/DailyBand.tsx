import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import { Box, ButtonBase, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { dailyKinds, dailySudokuDifficulty, dateKey, streakOf } from "../../puzzle/core/daily";
import { HINT_DAILY_BONUS, HINT_PER_DAILY } from "../../puzzle/core/score";
import { DIFFICULTY_LABEL } from "../../puzzle/sudoku/generator";
import { usePuzzleStore } from "../../stores/puzzleStore";
import { dessert } from "../../theme/palette";
import { radius } from "../../theme/shape";
import { DAILY_NAME, DAILY_ROUTE } from "./daily";
import DailyShare from "./DailyShare";
import { dailyRound } from "../../puzzle/core/share";

/** 첫 화면 위 '오늘의 퍼즐' 띠: 날짜로 고른, 누구에게나 같은 세 판. 다 풀면 힌트 보너스·연속 출석, 결과 공유(디저트는 2026-10-27 없앰) */
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
  const allDone = kinds.every((k) => done.includes(k));

  return (
    <Box component="section" aria-labelledby="daily-title" sx={{ borderRadius: radius.card, bgcolor: dessert.paper, p: 2, boxShadow: "0 1px 2px rgba(78,59,46,.06), 0 8px 24px rgba(78,59,46,.06)" }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box role="img" aria-label={`연속 ${streak}일`} sx={{ width: 52, height: 52, flexShrink: 0, borderRadius: radius.item, bgcolor: streak > 0 ? dessert.strawberryMilk : dessert.creamDeep, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
          <LocalFireDepartmentIcon aria-hidden sx={{ fontSize: 20, color: streak > 0 ? "#F06A3B" : dessert.cocoaSoft }} />
          <Box component="span" aria-hidden sx={{ fontSize: 16, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{streak}</Box>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography id="daily-title" component="h2" sx={{ fontSize: 18, fontWeight: 800 }}>
            오늘의 퍼즐 <Box component="span" sx={{ color: dessert.cocoaSoft, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>#{dailyRound(today)} · {done.length}/{kinds.length}</Box>
          </Typography>
          <Typography sx={{ fontSize: 13, color: dessert.cocoaSoft }}>
            {allDone ? "오늘 몫을 다 풀었어요. 결과를 보내 견줘 보세요!" : `모두 같은 세 판이에요. 한 판마다 힌트 ${HINT_PER_DAILY}개, 다 풀면 ${HINT_DAILY_BONUS}개 더`}
          </Typography>
        </Box>
        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
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
      {allDone && (
        <Box sx={{ mt: 1 }}>
          <DailyShare />
        </Box>
      )}
    </Box>
  );
}
