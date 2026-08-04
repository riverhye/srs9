import "./globals.css";

import type { Metadata } from "next";
import { Geist_Mono, Noto_Sans_KR } from "next/font/google";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto-sans-kr",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const SITE_NAME = "srs9";
const SITE_DESCRIPTION =
  "Stella River Spencer. 읽고 보고 만들며 그 사이의 생각을 남깁니다.";

// 공유 카드 이미지는 절대 주소여야 다른 서비스가 읽는다 → metadataBase 필수.
// 배포 도메인이 기본값이고, 로컬·미리보기에서는 환경변수로 덮어쓴다.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://srs9.com"),
  title: {
    default: SITE_NAME,
    // 하위 페이지 제목은 "글 제목 — srs9" 형태가 된다
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "ko_KR",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    // 이미지는 app/opengraph-image.png를 프레임워크가 자동으로 붙인다
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
};

// 헤더/푸터는 (site) 레이아웃에서 렌더.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="ko"
      data-scroll-behavior="smooth"
      className={`${notoSansKr.variable} ${geistMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
