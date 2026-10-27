import { Box, Typography } from "@mui/material";
import type { ReactNode } from "react";
import StarIcon from "../components/dessert/StarIcon";
import Page from "../components/layout/Page";
import PuzzleHeader from "../components/layout/PuzzleHeader";
import { totalStarsOf } from "../puzzle/core/collection";
import { SUDOKU_PAR_SECONDS } from "../puzzle/core/score";
import { ESCAPES } from "../puzzle/escape/puzzles";
import { NONOGRAMS } from "../puzzle/nonogram/puzzles";
import { DIFFICULTY_LABEL, type SudokuDifficulty } from "../puzzle/sudoku/generator";
import { formatTime } from "../puzzle/sudoku/game";
import { usePuzzleStore, type PuzzleStat } from "../stores/puzzleStore";
import { dessert } from "../theme/palette";
import { radius } from "../theme/shape";

/** 기록표: 모은 별과 퍼즐별 기록. 지금은 이 기기 기록만 보입니다(계정·순위는 이후 공용 API). */
export default function RecordsPage() {
  const stars = usePuzzleStore((s) => s.stars);
  const stats = usePuzzleStore((s) => s.stats);
  const zoneCleared = usePuzzleStore((s) => s.zoneCleared);
  const slideCleared = usePuzzleStore((s) => s.slideCleared);
  const blockCleared = usePuzzleStore((s) => s.blockCleared);
  const nonogramCleared = usePuzzleStore((s) => s.nonogramCleared);
  const escapeBest = usePuzzleStore((s) => s.escapeBest);
  const total = totalStarsOf(stars);
  // 별 키 앞부분(퍼즐 이름)으로 퍼즐별 별 합계를 셉니다.
  const starsOf = (...kinds: string[]) => Object.entries(stars).reduce((n, [k, v]) => (kinds.includes(k.split(":")[0]) ? n + v : n), 0);
  const sudokuCleared = (Object.keys(DIFFICULTY_LABEL) as SudokuDifficulty[]).reduce((n, d) => n + (stats[d]?.cleared ?? 0), 0);

  return (
    <Page>
      <PuzzleHeader title="기록표" subtitle="이 기기 기록" />
      <Box sx={{ px: 2, pt: 1.5, pb: 3, display: "flex", flexDirection: "column", gap: 2 }}>
        <Box component="section" aria-label="모은 별" sx={{ borderRadius: radius.card, bgcolor: dessert.vanilla, p: 2.5, display: "flex", alignItems: "center", gap: 2 }}>
          <StarIcon size={56} />
          <Box>
            <Typography sx={{ fontSize: 14, color: dessert.cocoaSoft, fontWeight: 600 }}>모은 별</Typography>
            <Typography sx={{ fontSize: 40, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
              {total.toLocaleString("ko-KR")}
              <Box component="span" sx={{ fontSize: 20, ml: 0.5 }}>개</Box>
            </Typography>
            <Typography sx={{ fontSize: 13, color: dessert.cocoaSoft }}>
              스도쿠 {sudokuCleared}판 · 보너스 {zoneCleared + slideCleared + blockCleared}판 · 스페셜 {nonogramCleared.length + Object.keys(escapeBest).length}판
            </Typography>
          </Box>
        </Box>

        <Section title="클래식 스도쿠" stars={starsOf("sudoku")}>
          <Table
            head={["난이도", "푼 판", "최고 기록", "평균"]}
            rows={(Object.keys(DIFFICULTY_LABEL) as SudokuDifficulty[]).map((d) => [DIFFICULTY_LABEL[d], ...statCells(stats[d])])}
          />
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
        </Section>

        <Section title="스페셜 스테이지" stars={starsOf("nonogram", "escape")}>
          <Table
            head={["퍼즐", "단계", "내 기록", "최소"]}
            rows={[
              ...NONOGRAMS.map((_, i) => ["노노그램", `${i + 1}단계`, nonogramCleared.includes(i) ? "완성" : "-", "-"]),
              ...ESCAPES.map((p, i) => ["블록 탈출", `${i + 1}단계`, escapeBest[i] !== undefined ? `${escapeBest[i]}수` : "-", `${p.minMoves}수`]),
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
            <li>같은 레벨을 다시 풀면 가장 많이 받은 별이 남아요. 별 6개마다 디저트가 하나 열려요.</li>
          </Box>
        </Section>
      </Box>
    </Page>
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
