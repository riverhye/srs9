import type { Metadata } from "next";
import Link from "next/link";

import { PostCard } from "@/components/feed/PostCard";
import { getPublishedPosts, parseTags } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "프론트엔드 실무에서 부딪힌 문제와 해결 과정, 읽은 것과 다녀온 곳의 기록.",
  alternates: { canonical: "/blog" },
};

// 태그 필터: ?tag=essay 등. Next 16에서 searchParams는 Promise.
export default async function BlogList({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const posts = await getPublishedPosts(tag);

  // 필터 칩은 전체 발행글의 태그 집합에서 만든다(필터 중에도 그대로 유지)
  const forTags = tag ? await getPublishedPosts() : posts;
  const tags = [...new Set(forTags.flatMap(parseTags))].sort();

  return (
    <section className="mx-auto max-w-3xl px-6 pt-24 pb-16">
      <h1 className="text-3xl font-bold tracking-tight">Blog</h1>

      {tags.length > 0 && (
        <div className="mt-8 flex flex-wrap gap-2">
          <Chip href="/blog" label="전체" active={!tag} />
          {tags.map((t) => (
            <Chip
              key={t}
              href={`/blog?tag=${encodeURIComponent(t)}`}
              label={t}
              active={tag === t}
              mono
            />
          ))}
        </div>
      )}

      <div className="mt-6">
        {posts.length ? (
          posts.map((p) => <PostCard key={p.slug} post={p} />)
        ) : (
          <p className="py-16 text-center text-muted">아직 글이 없습니다.</p>
        )}
      </div>
    </section>
  );
}

function Chip({
  href,
  label,
  active,
  mono,
}: {
  href: string;
  label: string;
  active: boolean;
  mono?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      // 조각을 배열로 두고 합친다 — 템플릿 리터럴에 클래스를 이어붙이면
      // Tailwind 정렬 플러그인이 문자열을 다듬으며 구분 공백을 없앨 수 있다.
      className={[
        "rounded-full px-4 py-1.5 text-sm",
        active
          ? "bg-accent font-medium text-accent-fg"
          : "border border-border text-muted transition-colors hover:bg-surface",
        mono ? "font-mono" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {label}
    </Link>
  );
}
