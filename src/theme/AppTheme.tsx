import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import type { ReactNode } from "react";
import { dessert } from "./palette";
import { radiusComponents, standardShape } from "./shape";

const theme = createTheme({
  shape: standardShape,
  palette: {
    mode: "light",
    primary: { main: dessert.strawberryDeep, light: dessert.strawberry, contrastText: "#FFFFFF" },
    secondary: { main: dessert.mintDeep, light: dessert.mint },
    background: { default: dessert.cream, paper: dessert.paper },
    text: { primary: dessert.cocoa, secondary: dessert.cocoaSoft },
    error: { main: dessert.conflict },
    divider: dessert.line,
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard", "Noto Sans KR", "Malgun Gothic", sans-serif',
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    ...radiusComponents,
    MuiButton: {
      styleOverrides: { root: { ...radiusComponents.MuiButton.styleOverrides.root, boxShadow: "none" } },
      defaultProps: { disableElevation: true },
    },
  },
});

export default function AppTheme({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
