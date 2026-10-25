import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { Box, IconButton, Switch, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Page from "../components/layout/Page";
import { usePuzzleStore } from "../stores/puzzleStore";
import { dessert } from "../theme/palette";
import { radius } from "../theme/shape";

export default function SettingsPage() {
  const navigate = useNavigate();
  const settings = usePuzzleStore((s) => s.settings);
  const updateSettings = usePuzzleStore((s) => s.updateSettings);

  return (
    <Page>
      <Box component="header" sx={{ display: "flex", alignItems: "center", px: 1, pt: "calc(env(safe-area-inset-top) + 8px)" }}>
        <IconButton aria-label="뒤로" onClick={() => navigate(-1)}>
          <ArrowBackIosNewIcon fontSize="small" />
        </IconButton>
        <Typography component="h1" sx={{ fontWeight: 800, fontSize: 20 }}>
          설정
        </Typography>
      </Box>
      <Box sx={{ px: 2, pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        <Group title="입력 방식">
          <Box sx={{ p: 2 }}>
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={settings.inputMode}
              onChange={(_, value) => value && updateSettings({ inputMode: value })}
              aria-label="입력 방식"
            >
              <ToggleButton value="cell-first" sx={{ fontWeight: 700 }}>칸 먼저 누르기</ToggleButton>
              <ToggleButton value="number-first" sx={{ fontWeight: 700 }}>숫자 먼저 고르기</ToggleButton>
            </ToggleButtonGroup>
            <Typography sx={{ mt: 1.5, fontSize: 13, color: "text.secondary" }}>
              {settings.inputMode === "cell-first"
                ? "칸을 누른 뒤 숫자를 누르면 들어갑니다."
                : "숫자를 골라 두면 누르는 칸마다 그 숫자가 들어갑니다. 같은 숫자를 여러 칸에 넣을 때 편해요."}
            </Typography>
          </Box>
        </Group>
        <Group title="화면">
          <Row label="같은 숫자 강조" checked={settings.highlightSame} onChange={(v) => updateSettings({ highlightSame: v })} />
          <Row label="겹친 숫자 빨갛게 표시" checked={settings.showConflicts} onChange={(v) => updateSettings({ showConflicts: v })} divider />
        </Group>
      </Box>
    </Page>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box component="section">
      <Typography component="h2" sx={{ fontSize: 13, fontWeight: 700, color: "text.secondary", px: 0.5, pb: 1 }}>
        {title}
      </Typography>
      <Box sx={{ bgcolor: dessert.paper, borderRadius: radius.item }}>{children}</Box>
    </Box>
  );
}

function Row({ label, checked, onChange, divider = false }: { label: string; checked: boolean; onChange: (v: boolean) => void; divider?: boolean }) {
  return (
    <Box component="label" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 52, px: 2, borderTop: divider ? `1px solid ${dessert.creamDeep}` : "none" }}>
      <Typography>{label}</Typography>
      <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} slotProps={{ input: { "aria-label": label } }} />
    </Box>
  );
}
