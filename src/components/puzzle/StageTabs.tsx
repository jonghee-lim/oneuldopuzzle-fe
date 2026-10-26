import CheckIcon from "@mui/icons-material/Check";
import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import { dessert } from "../../theme/palette";

/** 스페셜 스테이지 체험용 단계 고르기. 다 푼 단계에는 체크를 붙입니다. */
export default function StageTabs({
  stages,
  value,
  onChange,
  done = [],
}: {
  stages: readonly string[];
  value: number;
  onChange: (stage: number) => void;
  done?: readonly boolean[];
}) {
  return (
    <ToggleButtonGroup exclusive fullWidth size="small" value={value} onChange={(_, v) => v !== null && onChange(v)} aria-label="단계">
      {stages.map((name, i) => (
        <ToggleButton key={name} value={i} aria-label={done[i] ? `${name}, 완료` : name} sx={{ fontWeight: 700, height: 40, gap: 0.5 }}>
          {done[i] && <CheckIcon aria-hidden sx={{ fontSize: 16, color: dessert.mintDeep }} />}
          {name}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
