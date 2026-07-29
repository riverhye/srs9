import "server-only";

import { asc, eq } from "drizzle-orm";

import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { getDb } from "@/lib/db";
import { guestbook, type GuestbookEntry } from "@/lib/db/schema";
import { brand } from "@/lib/site";

// passwordHash는 절대 노출하지 않는다.
export type PublicEntry = {
  id: string;
  parentId: string | null;
  nickname: string;
  body: string;
  isOwner: boolean;
  createdAt: string;
};

function toPublic(e: GuestbookEntry): PublicEntry {
  return {
    id: e.id,
    parentId: e.parentId,
    nickname: e.nickname,
    body: e.body,
    isOwner: e.isOwner,
    createdAt: e.createdAt,
  };
}

export async function listEntries(): Promise<PublicEntry[]> {
  const rows = await getDb()
    .select()
    .from(guestbook)
    .orderBy(asc(guestbook.createdAt));
  return rows.map(toPublic);
}

// 방문자 익명 방명록.
export async function createEntry(input: {
  nickname: string;
  password: string;
  body: string;
}): Promise<PublicEntry> {
  const [row] = await getDb()
    .insert(guestbook)
    .values({
      id: crypto.randomUUID(),
      parentId: null,
      nickname: input.nickname,
      passwordHash: await hashPassword(input.password),
      body: input.body,
      isOwner: false,
      createdAt: new Date().toISOString(),
    })
    .returning();
  return toPublic(row);
}

// 소유자 답글 — 비밀번호 없이(세션 인증), isOwner=true.
export async function createOwnerReply(
  parentId: string,
  body: string,
): Promise<PublicEntry> {
  const [row] = await getDb()
    .insert(guestbook)
    .values({
      id: crypto.randomUUID(),
      parentId,
      nickname: brand.name,
      passwordHash: null,
      body,
      isOwner: true,
      createdAt: new Date().toISOString(),
    })
    .returning();
  return toPublic(row);
}

// 방문자 본인 비밀번호로 삭제(달린 소유자 답글도 함께). 소유자 답글 자체는 비번 삭제 불가.
export async function deleteEntryWithPassword(
  id: string,
  password: string,
): Promise<boolean> {
  const db = getDb();
  const [row] = await db
    .select()
    .from(guestbook)
    .where(eq(guestbook.id, id))
    .limit(1);
  if (!row || !row.passwordHash) return false;
  if (!(await verifyPassword(password, row.passwordHash))) return false;
  await removeEntry(id);
  return true;
}

// 소유자 모더레이션 — 무엇이든 삭제.
export async function deleteEntryAsOwner(id: string): Promise<void> {
  await removeEntry(id);
}

async function removeEntry(id: string): Promise<void> {
  const db = getDb();
  await db.delete(guestbook).where(eq(guestbook.id, id));
  await db.delete(guestbook).where(eq(guestbook.parentId, id));
}
