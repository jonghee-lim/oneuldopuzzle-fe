// 레벨 1~N 문제를 모두 만들어 검사기로 다시 확인합니다. 서버 문제 풀에 넣기 전 이 검사를 통과해야 합니다.
// 사용: npm run check:pool -- 1000
import { checkSudoku } from "../src/puzzle/sudoku/checker.ts";
import { puzzleForLevel } from "../src/puzzle/sudoku/generator.ts";
import { solveWithSingles } from "../src/puzzle/sudoku/logic.ts";
import { rateSudoku } from "../src/puzzle/sudoku/techniques.ts";

const count = Number(process.argv[2] ?? 1000);
const started = Date.now();
const stats = new Map<string, { n: number; clues: number; singles: number; grades: number[] }>();
// 난이도마다 필요한 기술 단계(generator.ts의 RULES와 같아야 함): 찍지 않고 그 단계로 풀려야 합니다.
const GRADE: Record<string, number> = { easy: 1, normal: 1, hard: 2, expert: 3 };
const failures: string[] = [];
const seen = new Set<string>();

for (let level = 1; level <= count; level += 1) {
  const p = puzzleForLevel(level);
  const check = checkSudoku(p.puzzle, p.solution);
  const key = p.puzzle.join("");
  if (!check.ok) failures.push(`레벨 ${level}: ${check.reason}`);
  if (seen.has(key)) failures.push(`레벨 ${level}: 앞 레벨과 같은 문제`);
  seen.add(key);
  const rating = rateSudoku(p.puzzle);
  if (!rating.solved) failures.push(`레벨 ${level}: 기술만으로 안 풀림(찍어야 함)`);
  else if (rating.grade !== GRADE[p.difficulty]) failures.push(`레벨 ${level}: ${p.difficulty}인데 기술 단계 ${rating.grade}`);
  const s = stats.get(p.difficulty) ?? { n: 0, clues: 0, singles: 0, grades: [0, 0, 0, 0] };
  s.grades[rating.grade] += 1;
  s.n += 1;
  s.clues += p.puzzle.filter(Boolean).length;
  if (solveWithSingles(p.puzzle).solved) s.singles += 1;
  stats.set(p.difficulty, s);
}

for (const [difficulty, s] of stats) {
  console.log(`${difficulty}: ${s.n}개, 평균 단서 ${(s.clues / s.n).toFixed(1)}, 단서 찾기만으로 풀림 ${s.singles}개, 기술 단계 1/2/3: ${s.grades.slice(1).join("/")}`);
}
console.log(`${count}개 검사, ${((Date.now() - started) / 1000).toFixed(1)}초`);
if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("모두 답이 정확히 하나이고, 찍지 않고 난이도에 맞는 기술로 풀립니다.");
