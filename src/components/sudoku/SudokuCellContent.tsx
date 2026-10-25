import { Box } from "@mui/material";
import { dessert } from "../../theme/palette";

interface Props {
  value: number;
  notes: number;
  given: boolean;
  conflict: boolean;
}

/** 칸 안 숫자 또는 작은 메모 9칸 */
export default function SudokuCellContent({ value, notes, given, conflict }: Props) {
  if (value) {
    return (
      <Box
        component="span"
        className="sudoku-value"
        sx={{
          fontSize: "clamp(18px, 6.2vw, 30px)",
          fontWeight: given ? 700 : 600,
          lineHeight: 1,
          // 내가 넣은 숫자는 민트로, 빨강은 겹친 숫자에만 씁니다(분홍이 틀린 숫자처럼 보인다는 의견, 2026-10-25).
          color: conflict ? dessert.conflict : given ? dessert.cocoa : dessert.mintDeep,
        }}
      >
        {value}
      </Box>
    );
  }
  if (!notes) return null;
  return (
    <Box
      className="sudoku-notes"
      sx={{
        position: "absolute",
        inset: "2px",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        fontSize: "clamp(8px, 2.4vw, 12px)",
        fontWeight: 600,
        lineHeight: 1,
        color: dessert.cocoaSoft,
      }}
    >
      {Array.from({ length: 9 }, (_, k) => (
        <Box key={k} component="span" sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          {notes & (1 << (k + 1)) ? k + 1 : ""}
        </Box>
      ))}
    </Box>
  );
}
