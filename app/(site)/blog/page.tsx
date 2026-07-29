import type { Metadata } from "next";
import Link from "next/link";

import { PostCard } from "@/components/feed/PostCard";
import { getPublishedPosts, parseTags } from "@/lib/posts";

export const metadata: Metadata = { title: "Blog" };

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
      className={
        active
          ? "rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-accent-fg"
          : `rounded-full border border-border px-4 py-1.5 text-sm text-muted transition-colors hover:bg-surface${
              mono ? " font-mono" : ""
            }`
      }
    >
      {label}
    </Link>
  );
}
