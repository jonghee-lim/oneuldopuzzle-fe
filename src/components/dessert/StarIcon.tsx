import { Box } from "@mui/material";
import { dessert } from "../../theme/palette";

/** 레벨 별. 받은 별은 노랑, 못 받은 별은 크림 빈 별 */
export default function StarIcon({ on = true, size = 20 }: { on?: boolean; size?: number }) {
  return (
    <Box component="svg" viewBox="0 0 24 24" aria-hidden sx={{ width: size, height: size, flexShrink: 0, display: "block" }}>
      <path
        d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.5L12 17.4l-5.8 3.1 1.1-6.5L2.6 9.4l6.5-.9z"
        fill={on ? "#F2B33D" : dessert.creamDeep}
        stroke={on ? "#D9962A" : dessert.line}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </Box>
  );
}
