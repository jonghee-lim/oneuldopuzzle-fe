import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { Box, ButtonBase, Typography } from "@mui/material";
import Page from "../components/layout/Page";
import SubHeader from "../components/layout/SubHeader";
import { storePlatform } from "../platform/native";
import { otherAppsFor } from "../platform/otherApps";
import { dessert } from "../theme/palette";
import { radius } from "../theme/shape";

/** 스마트인포랩의 다른 앱. 처음 화면 맨 아래·설정의 링크로만 들어오고, 풀이 중에는 보이지 않습니다. */
export default function OtherAppsPage() {
  const items = otherAppsFor(storePlatform());
  return (
    <Page>
      <SubHeader title="다른 앱" />
      <Box sx={{ px: 2, pt: 1, pb: 3, display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography sx={{ fontSize: 14, color: dessert.cocoaSoft, px: 0.5 }}>오늘Do퍼즐을 만든 스마트인포랩의 앱입니다.</Typography>
        {items.map(({ app, href }) => (
          <ButtonBase
            key={app.id}
            component="a"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${app.name} 보기`}
            sx={{ display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 1.5, p: 1.5, textAlign: "left", bgcolor: dessert.paper, borderRadius: radius.item, color: "inherit" }}
          >
            <Box component="img" src={app.icon} alt="" sx={{ width: 56, height: 56, borderRadius: "14px", flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: 16, fontWeight: 800 }}>{app.name}</Typography>
              <Typography sx={{ fontSize: 13, color: dessert.cocoaSoft, mt: 0.25 }}>{app.summary}</Typography>
            </Box>
            <OpenInNewIcon fontSize="small" sx={{ color: dessert.cocoaSoft, flexShrink: 0 }} />
          </ButtonBase>
        ))}
      </Box>
    </Page>
  );
}
