import type { Metadata } from "next";

import { RootFooter } from "@/components/footer/RootFooter";
import { RootHeader } from "@/components/header/RootHeader";

// 사이트(공개) 영역 공용 레이아웃 — 헤더/푸터
export const metadata: Metadata = {
  title: { default: "srs9", template: "%s · srs9" },
  description: "Stella River Spencer.",
};

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <RootHeader />
      <main className="flex-1">{children}</main>
      <RootFooter />
    </>
  );
}
