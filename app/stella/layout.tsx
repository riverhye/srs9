import type { Metadata } from "next";

export const metadata: Metadata = {
  // 검색 노출 방지.
  title: { default: "stella", template: "%s · stella" },
  robots: { index: false, follow: false },
};

// RootHeader/Footer 없는 레이아웃
export default function StellaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <main className="flex-1">{children}</main>;
}
