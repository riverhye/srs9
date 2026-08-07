import type { Metadata } from "next";

import { GuestbookBoard } from "@/components/guestbook/GuestbookBoard";
import { isOwner } from "@/lib/auth/session";
import { listEntries } from "@/lib/guestbook";

export const metadata: Metadata = {
  title: "Guestbook",
  description: "다녀간 흔적을 남겨주세요. 닉네임과 비밀번호만으로 씁니다.",
  alternates: { canonical: "/guestbook" },
};

// 방문자가 남긴 글을 매번 읽어야 하므로 정적 생성 대상이 아니다.
// 선언이 없으면 빌드가 프리렌더를 시도하다 D1 바인딩이 없어 실패한다.
export const dynamic = "force-dynamic";

export default async function GuestbookPage() {
  const [entries, owner] = await Promise.all([listEntries(), isOwner()]);

  return (
    <section className="mx-auto max-w-3xl px-6 pt-24 pb-16">
      <h1 className="text-3xl font-bold tracking-tight">Guestbook</h1>
      <p className="mt-2 text-sm text-muted">한 줄 남겨주세요.</p>
      <GuestbookBoard initialEntries={entries} isOwner={owner} />
    </section>
  );
}
