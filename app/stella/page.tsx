import type { Metadata } from "next";
import Link from "next/link";

import { DeletePostButton } from "@/components/dashboard/DeletePostButton";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { requireOwner } from "@/lib/auth/session";
import { formatDate, listAllPosts } from "@/lib/posts";

export const metadata: Metadata = { title: "대시보드" };

export default async function StellaDashboardPage() {
  await requireOwner();
  const posts = await listAllPosts();

  return (
    <section className="mx-auto max-w-3xl px-6 pt-24 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">stella</h1>
          <p className="mt-2 text-muted">글 관리</p>
        </div>
        <div className="flex items-center gap-2">
          <LogoutButton />
          <Link
            href="/stella/write"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-fg transition-opacity hover:opacity-90"
          >
            글쓰기
          </Link>
        </div>
      </div>

      <ul className="mt-10 divide-y divide-border">
        {posts.length === 0 && (
          <li className="py-8 text-muted">아직 글이 없습니다.</li>
        )}
        {posts.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between gap-4 py-4"
          >
            <div className="min-w-0">
              <Link
                href={`/stella/write?id=${p.id}`}
                className="block truncate font-medium transition-colors hover:text-accent"
              >
                {p.title || "(제목 없음)"}
              </Link>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted">
                <span className={p.status === "published" ? "text-accent" : ""}>
                  {p.status === "published" ? "발행" : "초안"}
                </span>
                <span>·</span>
                {/* 수정 시각이 아니라 발행일 — 이관 글은 원본 날짜가 기준이다 */}
                <time dateTime={p.date}>{formatDate(p.date)}</time>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Link
                href={`/stella/write?id=${p.id}`}
                className="rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-foreground"
              >
                수정
              </Link>
              <DeletePostButton id={p.id} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
