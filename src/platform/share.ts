// 공유하기: 휴대폰 공유 창(카톡 등)을 열고, 공유 창이 없으면 글을 복사합니다.
export const APP_URL = "https://oneuldopuzzle.smartinfol.com";
/** 이용안내·개인정보 처리방침의 문의 주소(형제 앱 공통) */
export const SUPPORT_EMAIL = "support@smartinfol.com";

export type ShareOutcome = "shared" | "copied" | "cancelled" | "failed";

/** 그림이 있으면 그림과 글을 함께, 그림을 못 보내는 곳이면 글만 보냅니다. */
export async function shareResult(text: string, image?: File): Promise<ShareOutcome> {
  if (typeof navigator.share === "function") {
    const withImage: ShareData = image ? { text, files: [image] } : { text };
    const data = image && navigator.canShare?.(withImage) ? withImage : { text };
    try {
      await navigator.share(data);
      return "shared";
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return "cancelled";
    }
  }
  return copyText(text);
}

export async function copyText(text: string): Promise<ShareOutcome> {
  try {
    await navigator.clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
