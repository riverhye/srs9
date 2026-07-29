import Link from "next/link";

import { excerptOf, formatDate, parseTags, type Post } from "@/lib/posts";

// 블로그 목록 카드 — 날짜·태그·제목·발췌. 상세로 링크.
export function PostCard({ post }: { post: Post }) {
  const tags = parseTags(post);
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block border-b border-border py-6"
    >
      <div className="mb-2 flex flex-wrap items-center gap-3 text-sm text-muted">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {tags.map((t) => (
          <span key={t} className="font-mono">
            #{t}
          </span>
        ))}
      </div>
      <h2 className="text-xl font-semibold tracking-tight transition-colors group-hover:text-accent">
        {post.title}
      </h2>
      <p className="mt-2 line-clamp-2 text-muted">{excerptOf(post)}</p>
    </Link>
  );
}
