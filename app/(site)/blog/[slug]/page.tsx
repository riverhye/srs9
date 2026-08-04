import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { CommentSection } from "@/components/comment/CommentSection";
import { PostBody } from "@/components/post/PostBody";
import {
  excerptOf,
  formatDate,
  getPublishedPostBySlug,
  parseBody,
  parseTags,
} from "@/lib/posts";

// slug는 Next가 이미 퍼센트 디코딩해 넘겨준다(한글 그대로 매칭).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(
    decodeURIComponent(slug).normalize("NFC"),
  );
  if (!post) return { title: "Blog" };

  // 발췌를 공유 카드·검색 결과 설명으로 쓴다(본문 첫 문단 평문).
  const description = excerptOf(post, 160);
  const canonical = `/blog/${encodeURIComponent(post.slug)}`;
  return {
    title: post.title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: canonical,
      publishedTime: post.date,
      tags: parseTags(post),
    },
  };
}

export default async function PostDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(
    decodeURIComponent(slug).normalize("NFC"),
  );
  if (!post) notFound();
  const tags = parseTags(post);

  return (
    <article className="mx-auto max-w-3xl px-6 pt-24 pb-20">
      <header className="mb-10">
        <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-muted">
          <time dateTime={post.date}>{formatDate(post.date)}</time>
          {tags.map((t) => (
            <Link
              key={t}
              href={`/blog?tag=${encodeURIComponent(t)}`}
              className="rounded-full border border-border bg-surface px-2.5 py-0.5 font-mono text-xs transition-colors hover:border-accent hover:text-foreground"
            >
              #{t}
            </Link>
          ))}
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {post.title}
        </h1>
      </header>

      <PostBody content={parseBody(post)} />

      <CommentSection postId={post.id} />
    </article>
  );
}
