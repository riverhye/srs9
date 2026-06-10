import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "대시보드",
};

export default function StellaDashboardPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 pt-24 pb-16">
      <h1 className="text-2xl font-semibold text-foreground">stella</h1>
      <p className="mt-2 text-muted">글 관리</p>
      <Link
        href="/stella/write"
        className="mt-8 inline-block rounded-md px-4 py-2 font-mono text-muted transition-colors hover:text-foreground"
      >
        글쓰기
      </Link>
    </section>
  );
}
