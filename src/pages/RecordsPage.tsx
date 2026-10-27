import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import StarIcon from "../components/dessert/StarIcon";
import Page from "../components/layout/Page";
import PuzzleHeader from "../components/layout/PuzzleHeader";
import { totalStarsOf } from "../puzzle/core/collection";
import { addDays, dateKey, longestStreak, streakOf } from "../puzzle/core/daily";
import { speedup } from "../puzzle/core/record";
import { SUDOKU_PAR_SECONDS } from "../puzzle/core/score";
import { DIFFICULTY_LABEL, type SudokuDifficulty } from "../puzzle/sudoku/generator";
import { formatTime } from "../puzzle/sudoku/game";
import { usePuzzleStore, type PuzzleStat } from "../stores/puzzleStore";
import { dessert } from "../theme/palette";
import { radius } from "../theme/shape";

/** 기록표: 연속 출석, 퍼즐별 기록과 최근 판 추이, 모은 별. 지금은 이 기기 기록만 보입니다(계정·순위는 이후 공용 API). */
export default function RecordsPage() {
  const stars = usePuzzleStore((s) => s.stars);
  const stats = usePuzzleStore((s) => s.stats);
  const zoneCleared = usePuzzleStore((s) => s.zoneCleared);
  const slideCleared = usePuzzleStore((s) => s.slideCleared);
  const blockCleared = usePuzzleStore((s) => s.blockCleared);
  const nonogramCleared = usePuzzleStore((s) => s.nonogramCleared);
  const escapeCleared = usePuzzleStore((s) => s.escapeCleared);
  const dailyDays = usePuzzleStore((s) => s.dailyDays);
  const today = dateKey();
  const total = totalStarsOf(stars);
  // 별 키 앞부분(퍼즐 이름)으로 퍼즐별 별 합계를 셉니다.
  const starsOf = (...kinds: string[]) => Object.entries(stars).reduce((n, [k, v]) => (kinds.includes(k.split(":")[0]) ? n + v : n), 0);
  const sudokuCleared = (Object.keys(DIFFICULTY_LABEL) as SudokuDifficulty[]).reduce((n, d) => n + (stats[d]?.cleared ?? 0), 0);

  return (
    <Page>
      <PuzzleHeader title="기록표" subtitle="이 기기 기록" />
      <Box sx={{ px: 2, pt: 1.5, pb: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        <StreakCard days={dailyDays} today={today} />
        <Typography sx={{ fontSize: 13, color: dessert.cocoaSoft, px: 0.5, mt: -1, display: "flex", alignItems: "center", gap: 0.5 }}>
          <StarIcon size={15} />
          별 {total.toLocaleString("ko-KR")}개 · 스도쿠 {sudokuCleared}판 · 보너스 {zoneCleared + slideCleared + blockCleared}판 · 스페셜 {nonogramCleared + escapeCleared}판
        </Typography>

        <Section title="클래식 스도쿠" stars={starsOf("sudoku")}>
          <Table
            head={["난이도", "푼 판", "최고 기록", "평균"]}
            rows={(Object.keys(DIFFICULTY_LABEL) as SudokuDifficulty[]).map((d) => [DIFFICULTY_LABEL[d], ...statCells(stats[d])])}
          />
          <Trends items={(Object.keys(DIFFICULTY_LABEL) as SudokuDifficulty[]).map((d) => [DIFFICULTY_LABEL[d], stats[d]] as const)} />
        </Section>

        <Section title="보너스 퍼즐" stars={starsOf("zones", "blocks", "sliding")}>
          <Table
            head={["퍼즐", "깬 레벨", "최고 기록", "평균"]}
            rows={[
              ["색깔 구역", `${zoneCleared}`, ...statCells(stats.zones).slice(1)],
              ["블록 채우기", `${blockCleared}`, ...statCells(stats.blocks).slice(1)],
              ["슬라이딩", `${slideCleared}`, ...statCells(stats.sliding).slice(1)],
            ]}
          />
          <Trends items={[["색깔 구역", stats.zones], ["블록 채우기", stats.blocks], ["슬라이딩", stats.sliding]] as const} />
        </Section>

        <Section title="스페셜 퍼즐" stars={starsOf("nonogram", "escape", "nonogram-old", "escape-old")}>
          <Table
            head={["퍼즐", "깬 레벨", "별"]}
            rows={[
              ["노노그램", `${nonogramCleared}`, `${starsOf("nonogram", "nonogram-old")}`],
              ["블록 탈출", `${escapeCleared}`, `${starsOf("escape", "escape-old")}`],
            ]}
          />
        </Section>

        <Section title="별 받는 법">
          <Box component="ul" sx={{ m: 0, px: 2.5, py: 1.5, display: "flex", flexDirection: "column", gap: 0.75, fontSize: 14, color: dessert.cocoaSoft }}>
            <li>레벨마다 별 3개까지: 완성하면 1개, 아래 두 조건마다 1개씩</li>
            <li>
              스도쿠: 기준 시간 안에(쉬움 {formatTime(SUDOKU_PAR_SECONDS.easy)} · 보통 {formatTime(SUDOKU_PAR_SECONDS.normal)} · 어려움 {formatTime(SUDOKU_PAR_SECONDS.hard)} · 아주 어려움{" "}
              {formatTime(SUDOKU_PAR_SECONDS.expert)}), ‘틀린 칸 보기’와 힌트 없이
            </li>
            <li>색깔 구역·블록 채우기: 기준 시간 안에, 힌트 없이</li>
            <li>슬라이딩·블록 탈출: 최소 수로, 힌트 없이 (4×4 슬라이딩은 3분 안에)</li>
            <li>노노그램: 잘못 칠하지 않고, 힌트 없이</li>
            <li>같은 레벨을 다시 풀면 가장 많이 받은 별이 남아요.</li>
          </Box>
        </Section>
      </Box>
    </Page>
  );
}

const WEEKS = 4;

/** 연속 출석과 최근 4주 달력(오늘의 퍼즐 세 판을 다 푼 날) */
function StreakCard({ days, today }: { days: readonly string[]; today: string }) {
  const done = new Set(days);
  const streak = streakOf(days, today);
  const cells = Array.from({ length: WEEKS * 7 }, (_, k) => addDays(today, k - (WEEKS * 7 - 1)));
  return (
    <Box component="section" aria-label="연속 출석" sx={{ borderRadius: radius.card, bgcolor: dessert.paper, p: 2.5, boxShadow: "0 1px 2px rgba(78,59,46,.06), 0 8px 24px rgba(78,59,46,.06)" }}>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        <Typography sx={{ fontSize: 36, fontWeight: 800, lineHeight: 1, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
          {streak}
          <Box component="span" sx={{ fontSize: 18, ml: 0.25 }}>일</Box>
        </Typography>
        <Typography sx={{ fontSize: 15, fontWeight: 700 }}>연속 출석</Typography>
        <Typography sx={{ ml: "auto", fontSize: 13, color: dessert.cocoaSoft, fontVariantNumeric: "tabular-nums" }}>최장 {longestStreak(days)}일</Typography>
      </Box>
      <Typography sx={{ fontSize: 13, color: dessert.cocoaSoft, mt: 0.5 }}>오늘의 퍼즐 세 판을 다 푼 날을 셉니다.</Typography>
      <Box role="img" aria-label={`최근 4주 중 ${cells.filter((d) => done.has(d)).length}일 출석`} sx={{ mt: 1.5, display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 0.5 }}>
        {cells.map((d) => (
          <Box
            key={d}
            sx={{
              aspectRatio: "1 / 1",
              borderRadius: "6px",
              bgcolor: done.has(d) ? dessert.mintDeep : dessert.creamDeep,
              outline: d === today ? `2px solid ${dessert.strawberryDeep}` : "none",
              outlineOffset: "-2px",
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

/** 최근 판 시간 막대(왼쪽이 오래된 판)와 빨라진 정도 */
function Trends({ items }: { items: readonly (readonly [string, PuzzleStat | undefined])[] }) {
  const shown = items.filter(([, st]) => (st?.recent?.length ?? 0) >= 2);
  if (!shown.length) return null;
  return (
    <Box sx={{ borderTop: `1px solid ${dessert.creamDeep}`, px: 1.5, py: 1.25, display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: dessert.cocoaSoft }}>최근 판 시간</Typography>
      {shown.map(([name, st]) => {
        const recent = st!.recent!;
        const max = Math.max(...recent);
        const up = speedup(recent);
        const clean = st!.clean ?? 0;
        return (
          <Box key={name} sx={{ display: "grid", gridTemplateColumns: "72px minmax(0, 1fr) auto", alignItems: "end", gap: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{name}</Typography>
            <Box role="img" aria-label={`${name} 최근 ${recent.length}판: ${recent.map(formatTime).join(", ")}`} sx={{ display: "flex", alignItems: "flex-end", gap: "3px", height: 28 }}>
              {recent.map((t, k) => (
                <Box key={k} sx={{ flex: 1, maxWidth: 14, height: `${Math.max(12, (t / max) * 100)}%`, borderRadius: "3px", bgcolor: k === recent.length - 1 ? dessert.strawberryDeep : dessert.line }} />
              ))}
            </Box>
            <Typography sx={{ fontSize: 12, color: dessert.cocoaSoft, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
              {up !== null && up >= 5 ? `${up}% 빨라짐` : `힌트 없이 ${clean}판`}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

function statCells(stat: PuzzleStat | undefined): string[] {
  if (!stat || stat.cleared === 0) return ["0", "-", "-"];
  return [`${stat.cleared}`, stat.bestSeconds !== undefined ? formatTime(stat.bestSeconds) : "-", formatTime(Math.round(stat.totalSeconds / stat.cleared))];
}

function Section({ title, stars, children }: { title: string; stars?: number; children: ReactNode }) {
  return (
    <Box component="section">
      <Typography component="h2" sx={{ fontSize: 16, fontWeight: 700, px: 0.5, pb: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
        {title}
        {stars !== undefined && (
          <Box component="span" aria-label={`별 ${stars}개`} sx={{ ml: "auto", display: "inline-flex", alignItems: "center", gap: 0.25, fontSize: 14, color: dessert.cocoaSoft, fontVariantNumeric: "tabular-nums" }}>
            <StarIcon size={15} />
            {stars}
          </Box>
        )}
      </Typography>
      <Box sx={{ bgcolor: dessert.paper, borderRadius: radius.item, overflow: "hidden" }}>{children}</Box>
    </Box>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", fontVariantNumeric: "tabular-nums", "& th, & td": { px: 1.5, py: 1.25, textAlign: "left", fontSize: 14 } }}>
      <thead>
        <Box component="tr" sx={{ bgcolor: dessert.creamDeep }}>
          {head.map((h) => (
            <Box component="th" key={h} scope="col" sx={{ fontWeight: 700, color: dessert.cocoaSoft, fontSize: "13px !important" }}>
              {h}
            </Box>
          ))}
        </Box>
      </thead>
      <tbody>
        {rows.map((row, r) => (
          <Box component="tr" key={r} sx={{ borderTop: r ? `1px solid ${dessert.creamDeep}` : "none" }}>
            {row.map((cell, c) => (
              <Box component={c === 0 ? "th" : "td"} scope={c === 0 ? "row" : undefined} key={c} sx={{ fontWeight: c === 0 ? 700 : 500 }}>
                {cell}
              </Box>
            ))}
          </Box>
        ))}
      </tbody>
    </Box>
  );
}
