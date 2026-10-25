import { ToggleButton, ToggleButtonGroup } from "@mui/material";

/** 스페셜 스테이지 체험용 단계 고르기 */
export default function StageTabs({ stages, value, onChange }: { stages: readonly string[]; value: number; onChange: (stage: number) => void }) {
  return (
    <ToggleButtonGroup exclusive fullWidth size="small" value={value} onChange={(_, v) => v !== null && onChange(v)} aria-label="단계">
      {stages.map((name, i) => (
        <ToggleButton key={name} value={i} sx={{ fontWeight: 700, height: 40 }}>
          {name}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
