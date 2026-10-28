import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { Box, IconButton, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

/** 설정에서 들어가는 화면의 위 줄: 뒤로(들어온 곳, 없으면 처음 화면)와 제목 */
export default function SubHeader({ title }: { title: string }) {
  const navigate = useNavigate();
  return (
    <Box component="header" sx={{ display: "flex", alignItems: "center", px: 1, pt: "calc(env(safe-area-inset-top) + 8px)" }}>
      <IconButton aria-label="뒤로" onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate("/"))}>
        <ArrowBackIosNewIcon fontSize="small" />
      </IconButton>
      <Typography component="h1" sx={{ fontWeight: 800, fontSize: 20 }}>
        {title}
      </Typography>
    </Box>
  );
}
