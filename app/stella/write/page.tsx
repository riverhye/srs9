import type { Metadata } from "next";

import { PostEditor } from "@/components/editor/PostEditor";
import { requireOwner } from "@/lib/auth/session";
import { getPostById, parseBody, parseTags } from "@/lib/posts";

export const metadata: Metadata = { title: "글쓰기" };

// ?id가 있으면 기존 글을 불러와 편집 모드로. 없으면 새 글.
export default async function StellaWritePage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  await requireOwner();
  const { id } = await searchParams;
  const post = id ? await getPostById(id) : undefined;
  const initialPost = post
    ? {
        id: post.id,
        title: post.title,
        body: parseBody(post),
        tags: parseTags(post),
        status: post.status,
      }
    : undefined;

  return (
    <section className="mx-auto max-w-3xl px-6 pt-24 pb-16">
      <PostEditor initialPost={initialPost} />
    </section>
  );
}
