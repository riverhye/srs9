import { RootFooter } from "@/components/footer/RootFooter";
import { RootHeader } from "@/components/header/RootHeader";

// 사이트(공개) 영역 공용 레이아웃 — 헤더/푸터.
// 제목·설명·공유 정보는 루트 레이아웃 한 곳에서 관리한다(여기에 두면 두 겹이 된다).

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
