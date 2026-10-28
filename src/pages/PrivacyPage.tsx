import { Box, Link, Typography } from "@mui/material";
import InfoCard from "../components/layout/InfoCard";
import Page from "../components/layout/Page";
import SubHeader from "../components/layout/SubHeader";
import { SUPPORT_EMAIL } from "../platform/share";
import { dessert } from "../theme/palette";

const EFFECTIVE = "2026-10-28";

/** 개인정보 처리방침. 스토어에 적는 개인정보 처리방침 주소가 이 화면입니다(App Store·Google Play 필수). */
export default function PrivacyPage() {
  return (
    <Page>
      <SubHeader title="개인정보 처리방침" />
      <Box sx={{ px: 2, pt: 1, pb: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography sx={{ fontSize: 13, color: dessert.cocoaSoft, px: 0.5 }}>시행일 {EFFECTIVE} · 스마트인포랩</Typography>
        <InfoCard title="한눈에 보기">
          오늘Do퍼즐은 회원 가입이나 로그인이 없고, 이름·이메일·위치·연락처 같은 개인정보를 모으지 않습니다. 광고 추적이나 사용 분석 도구도 쓰지 않습니다.
        </InfoCard>
        <InfoCard title="이 기기에만 저장하는 것">
          푼 레벨, 별, 시간 기록, 연속 출석, 풀던 판, 설정(입력 방식·소리·진동 등)은 이 기기 안에만 저장합니다. 서버로 보내지 않으며, 앱을 지우면 함께 지워집니다.
        </InfoCard>
        <InfoCard title="공유하기">
          오늘의 퍼즐 결과를 공유하면 휴대폰의 공유 창으로 결과 글과 그림을 보냅니다. 무엇을 누구에게 보낼지는 직접 고르고, 앱은 그 내용을 따로 보관하지 않습니다. 결과에는 답이 들어가지 않습니다.
        </InfoCard>
        <InfoCard title="다른 앱 보기">
          '다른 앱' 화면에서 앱을 누르면 App Store나 웹 페이지가 열립니다. 이때 앱은 어떤 정보도 함께 보내지 않습니다.
        </InfoCard>
        <InfoCard title="문의">
          개인정보에 관한 문의는 <Link href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</Link>로 보내 주세요.
        </InfoCard>
        <Typography sx={{ fontSize: 12, color: dessert.cocoaSoft, px: 0.5, lineHeight: 1.7 }}>
          이 방침이 바뀌면 앱과 이 화면에 시행일을 새로 적어 알립니다.
        </Typography>
      </Box>
    </Page>
  );
}
