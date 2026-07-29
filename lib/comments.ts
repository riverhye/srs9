import "server-only";

import { asc, eq } from "drizzle-orm";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getDb } from "@/lib/db";
import { type Comment, comments } from "@/lib/db/schema";

// 클라이언트로 내려보내는 공개 형태 — passwordHash는 절대 노출하지 않는다.
export type PublicComment = {
  id: string;
  parentId: string | null;
  nickname: string;
  body: string;
  createdAt: string;
};

function toPublic(c: Comment): PublicComment {
  return {
    id: c.id,
    parentId: c.parentId,
    nickname: c.nickname,
    body: c.body,
    createdAt: c.createdAt,
  };
}

export async function listComments(postId: string): Promise<PublicComment[]> {
  const rows = await getDb()
    .select()
    .from(comments)
    .where(eq(comments.postId, postId))
    .orderBy(asc(comments.createdAt));
  return rows.map(toPublic);
}

export type CommentInput = {
  postId: string;
  parentId?: string | null;
  nickname: string;
  password: string;
  body: string;
};

export async function createComment(
  input: CommentInput,
): Promise<PublicComment> {
  const [row] = await getDb()
    .insert(comments)
    .values({
      id: crypto.randomUUID(),
      postId: input.postId,
      parentId: input.parentId ?? null,
      nickname: input.nickname,
      passwordHash: await hashPassword(input.password),
      body: input.body,
      createdAt: new Date().toISOString(),
    })
    .returning();
  return toPublic(row);
}

// 비밀번호가 맞으면 삭제(대댓글도 함께).
export async function deleteCommentWithPassword(
  id: string,
  password: string,
): Promise<boolean> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, id))
    .limit(1);
  if (!row) return false;
  if (!(await verifyPassword(password, row.passwordHash))) return false;
  await removeComment(id);
  return true;
}

// 소유자 모더레이션 — 비밀번호 없이 강제 삭제(대댓글도 함께).
export async function deleteCommentAsOwner(id: string): Promise<void> {
  await removeComment(id);
}

async function removeComment(id: string): Promise<void> {
  const db = getDb();
  await db.delete(comments).where(eq(comments.id, id));
  await db.delete(comments).where(eq(comments.parentId, id));
}
