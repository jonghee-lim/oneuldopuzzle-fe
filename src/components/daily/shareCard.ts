// 오늘의 퍼즐 결과 카드 그림(1080×1080). 답은 그리지 않고 퍼즐별 시간·힌트 여부·연속 출석만 그립니다.
import { DAILY_KIND_NAME, dailyRound, dateLabel, type DailyResult } from "../../puzzle/core/share";
import { formatTime } from "../../puzzle/sudoku/game";
import { APP_URL } from "../../platform/share";
import { dessert } from "../../theme/palette";

const SIZE = 1080;
const FONT = '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard", "Noto Sans KR", "Malgun Gothic", sans-serif';

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  // roundRect가 없는 예전 iOS(15 이하)는 모서리를 직접 그립니다.
  if (typeof ctx.roundRect === "function") return ctx.roundRect(x, y, w, h, r);
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawShareCard(date: string, results: readonly DailyResult[], streak: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const font = (weight: number, px: number) => `${weight} ${px}px ${FONT}`;

  ctx.fillStyle = dessert.cream;
  ctx.fillRect(0, 0, SIZE, SIZE);
  ctx.fillStyle = dessert.paper;
  roundRect(ctx, 60, 60, SIZE - 120, SIZE - 120, 56);
  ctx.fill();

  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = dessert.strawberryDeep;
  ctx.font = font(800, 40);
  ctx.fillText("오늘Do퍼즐", 130, 175);
  ctx.fillStyle = dessert.cocoa;
  ctx.font = font(800, 76);
  ctx.fillText(`오늘의 퍼즐 #${dailyRound(date)}`, 130, 270);
  ctx.fillStyle = dessert.cocoaSoft;
  ctx.font = font(600, 38);
  ctx.fillText(`${dateLabel(date)} · 모두 같은 ${results.length}판`, 130, 330);

  results.forEach((r, i) => {
    const y = 400 + i * 150;
    const solved = r.seconds !== null;
    ctx.fillStyle = !solved ? dessert.creamDeep : r.helped ? dessert.vanilla : dessert.mintMilk;
    roundRect(ctx, 130, y, SIZE - 260, 120, 32);
    ctx.fill();
    // 왼쪽 네모 칸: 혼자 풀면 민트, 힌트를 쓰면 노랑
    ctx.fillStyle = !solved ? dessert.line : r.helped ? "#E8B640" : dessert.mintDeep;
    roundRect(ctx, 160, y + 30, 60, 60, 16);
    ctx.fill();
    ctx.fillStyle = dessert.cocoa;
    ctx.font = font(700, 44);
    ctx.textAlign = "left";
    ctx.fillText(DAILY_KIND_NAME[r.kind], 250, y + 76);
    ctx.textAlign = "right";
    ctx.font = font(800, 48);
    ctx.fillText(solved ? formatTime(r.seconds!) : "-", SIZE - 170, y + 78);
    if (r.helped) {
      ctx.fillStyle = dessert.cocoaSoft;
      ctx.font = font(600, 30);
      ctx.fillText("힌트", SIZE - 330, y + 74);
    }
    ctx.textAlign = "left";
  });

  const total = results.reduce((a, r) => a + (r.seconds ?? 0), 0);
  ctx.fillStyle = dessert.cocoa;
  ctx.font = font(800, 46);
  ctx.fillText(`합계 ${formatTime(total)}`, 130, 900);
  if (streak > 0) {
    ctx.textAlign = "right";
    ctx.fillStyle = "#E0552B";
    ctx.fillText(`연속 ${streak}일`, SIZE - 130, 900);
    ctx.textAlign = "left";
  }
  ctx.fillStyle = dessert.cocoaSoft;
  ctx.font = font(600, 30);
  ctx.fillText(`같은 판을 풀어 보세요 · ${new URL(APP_URL).host}`, 130, 965);
  return canvas;
}

export function canvasToFile(canvas: HTMLCanvasElement, name: string): Promise<File | undefined> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((blob) => resolve(blob ? new File([blob], name, { type: "image/png" }) : undefined), "image/png");
    } catch {
      resolve(undefined);
    }
  });
}
