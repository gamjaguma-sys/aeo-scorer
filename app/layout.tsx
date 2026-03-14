import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AEO 스코어 — AI 검색 최적화 지수 분석기",
  description: "블로그 콘텐츠가 Google AI Overview에 노출되기 적합한지 0~100점으로 즉시 진단합니다.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
