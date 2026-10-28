import { Box, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import InfoCard from "../components/layout/InfoCard";
import Page from "../components/layout/Page";
import SubHeader from "../components/layout/SubHeader";
import { SUPPORT_EMAIL } from "../platform/share";

/** 이용안내. App Store '지원 URL'로 쓰는 화면입니다. 퍼즐마다의 규칙은 풀이 화면의 '?'(하는 법)에서 봅니다. */
export default function GuidePage() {
  return (
    <Page>
      <SubHeader title="이용안내" />
      <Box sx={{ px: 2, pt: 1, pb: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <InfoCard title="오늘Do퍼즐">
          스도쿠, 색깔 구역, 블록 채우기, 슬라이딩, 노노그램, 블록 탈출 여섯 가지 퍼즐을 풉니다. 답이 하나뿐인 문제만 냅니다. 인터넷이 없어도 풀 수 있습니다.
        </InfoCard>
        <InfoCard title="레벨과 난이도">
          퍼즐마다 난이도를 고르면 레벨이 이어집니다. 레벨을 깨면 별을 1~3개 받습니다. 풀던 판은 저장되어 다음에 이어서 풉니다.
        </InfoCard>
        <InfoCard title="오늘의 퍼즐">
          날마다 모두에게 같은 세 판이 나옵니다. 세 판을 다 풀면 연속 출석이 이어지고 힌트를 더 받습니다. 결과는 답 없이 공유할 수 있습니다.
        </InfoCard>
        <InfoCard title="힌트">
          힌트를 누르면 먼저 볼 곳과 이유를 보여 줍니다. 한 번 더 누르면 대신 한 수를 두고 힌트 1개를 씁니다. 틀린 칸이 있으면 그곳부터 알려 줍니다.
        </InfoCard>
        <InfoCard title="퍼즐 규칙">
          풀이 화면 위의 '?'를 누르면 그 퍼즐의 하는 법을 예시 판과 함께 다시 볼 수 있습니다.
        </InfoCard>
        <InfoCard title="기록">
          기록은 이 기기에만 저장합니다. 앱을 지우거나 기기를 바꾸면 기록이 옮겨지지 않습니다. 자세한 내용은 <Link component={RouterLink} to="/privacy">개인정보 처리방침</Link>에 있습니다.
        </InfoCard>
        <InfoCard title="문의">
          불편한 점이나 제안은 <Link href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</Link>로 보내 주세요.
        </InfoCard>
      </Box>
    </Page>
  );
}
