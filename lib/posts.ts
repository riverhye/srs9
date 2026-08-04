import "server-only";

import type { JSONContent } from "@tiptap/core";
import { and, desc, eq } from "drizzle-orm";
import { cache } from "react";

import { getDb } from "@/lib/db";
import { comments, type Post, posts } from "@/lib/db/schema";

export type { Post } from "@/lib/db/schema";

// 포스트 데이터 접근 계층. 라우트 핸들러/서버 컴포넌트에서만 사용(server-only).

export type PostInput = {
  title: string;
  body: JSONContent;
  tags: string[];
  status: "draft" | "published";
  // 이관용 — 넘기면 그 값을 쓴다. 없으면 제목에서 slug를, 날짜는 오늘로.
  slug?: string;
  date?: string; // YYYY-MM-DD
};

// --- 조회 ---

// 대시보드용 — 상태 무관 전체, 발행일 내림차순(공개 목록과 같은 순서).
export async function listAllPosts(): Promise<Post[]> {
  return getDb().select().from(posts).orderBy(desc(posts.date));
}

// 공개 목록 — 발행글만, 날짜 내림차순. tag가 있으면 태그로 좁힌다.
export async function getPublishedPosts(tag?: string): Promise<Post[]> {
  const rows = await getDb()
    .select()
    .from(posts)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.date));
  // tags는 JSON 문자열이라 DB에서 거르지 않고 여기서 필터
  return tag ? rows.filter((p) => parseTags(p).includes(tag)) : rows;
}

// 한 요청 안에서 두 번 불린다(generateMetadata + 페이지 본문) — cache로 묶어
// DB를 한 번만 읽는다. 요청이 끝나면 캐시도 사라진다.
export const getPublishedPostBySlug = cache(
  async (slug: string): Promise<Post | undefined> => {
    const [row] = await getDb()
      .select()
      .from(posts)
      .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
      .limit(1);
    return row;
  },
);

// 에디터 편집 로드용 — 상태 무관.
export async function getPostById(id: string): Promise<Post | undefined> {
  const [row] = await getDb()
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);
  return row;
}

// --- 변경 ---

export async function createPost(input: PostInput): Promise<Post> {
  const db = getDb();
  const now = new Date().toISOString();
  // 넘겨받은 slug는 원본 주소를 그대로 살리려고 slugify를 거치지 않는다
  // (Velog slug엔 대문자·점이 있어 slugify가 바꿔버린다). NFC만 맞춘다.
  const slug = await uniqueSlug(
    input.slug ? input.slug.normalize("NFC") : slugify(input.title),
  );
  const [row] = await db
    .insert(posts)
    .values({
      id: crypto.randomUUID(),
      slug,
      title: input.title,
      body: JSON.stringify(input.body),
      tags: JSON.stringify(input.tags ?? []),
      date: input.date ?? now.slice(0, 10),
      status: input.status,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return row;
}

// slug는 링크 안정성을 위해 수정 시 그대로 둔다(제목이 바뀌어도).
export async function updatePost(
  id: string,
  input: PostInput,
): Promise<Post | undefined> {
  const [row] = await getDb()
    .update(posts)
    .set({
      title: input.title,
      body: JSON.stringify(input.body),
      tags: JSON.stringify(input.tags ?? []),
      status: input.status,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(posts.id, id))
    .returning();
  return row;
}

export async function deletePost(id: string): Promise<void> {
  const db = getDb();
  // 딸린 댓글 먼저 정리(로컬 D1은 FK 미강제)
  await db.delete(comments).where(eq(comments.postId, id));
  await db.delete(posts).where(eq(posts.id, id));
}

// --- 헬퍼 ---

export function parseBody(post: Post): JSONContent {
  return JSON.parse(post.body) as JSONContent;
}

export function parseTags(post: Post): string[] {
  try {
    return JSON.parse(post.tags) as string[];
  } catch {
    return [];
  }
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

// 본문 첫 문단의 평문을 잘라 피드 발췌로.
export function excerptOf(post: Post, max = 120): string {
  const doc = parseBody(post);
  const para = doc.content?.find((n) => n.type === "paragraph");
  const text = para ? plainText(para).trim() : "";
  return text.length > max ? text.slice(0, max).trimEnd() + "…" : text;
}

function plainText(node: JSONContent): string {
  return node.text ?? node.content?.map(plainText).join("") ?? "";
}

// 한글 유지, 문자/숫자 외는 -로. 비면 "post".
// NFC 정규화 — URL로 왕복할 때(조회 param과) 바이트가 어긋나지 않도록.
function slugify(title: string): string {
  const base = title
    .normalize("NFC")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base || "post";
}

async function uniqueSlug(base: string): Promise<string> {
  const db = getDb();
  let slug = base;
  let n = 2;
  // 충돌하면 -2, -3 … 붙인다
  while (
    (
      await db
        .select({ id: posts.id })
        .from(posts)
        .where(eq(posts.slug, slug))
        .limit(1)
    ).length > 0
  ) {
    slug = `${base}-${n++}`;
  }
  return slug;
}
