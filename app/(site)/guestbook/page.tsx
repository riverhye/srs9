import type { Metadata } from "next";
import { ComingSoon } from "@/components/placeholder/ComingSoon";

// Stage 4에서 익명 닉네임+비밀번호 방명록으로 채운다.
export const metadata: Metadata = { title: "Guestbook" };

export default function Guestbook() {
  return (
    <section className="mx-auto max-w-3xl px-6 pt-24 pb-16">
      <h1 className="text-3xl font-bold tracking-tight">Guestbook</h1>
      <div className="mt-10">
        <ComingSoon>방명록 공사중</ComingSoon>
      </div>
    </section>
  );
}
