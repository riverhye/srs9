import type { Metadata } from "next";

export const metadata: Metadata = {
  // 작성 공간(소유자 전용). 검색 노출 방지.
  title: "stella",
  robots: { index: false, follow: false },
};

// dev/me와 달리 RootHeader/Footer 없이 작성에만 집중하는 최소 셸.
export default function StellaLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <main className="flex-1">{children}</main>;
}
