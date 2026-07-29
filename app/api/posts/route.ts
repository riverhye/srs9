import { NextResponse } from "next/server";

import { isOwner } from "@/lib/auth/session";
import { createPost, listAllPosts, type PostInput } from "@/lib/posts";

// NextResponse 본문은 1회성이라 매번 새로 만든다.
const unauthorized = () =>
  NextResponse.json({ error: "unauthorized" }, { status: 401 });

// 글 목록(관리) — 초안 포함이라 소유자 전용.
export async function GET() {
  if (!(await isOwner())) return unauthorized();
  return NextResponse.json(await listAllPosts());
}

// 글 생성 — 소유자 전용.
export async function POST(req: Request) {
  if (!(await isOwner())) return unauthorized();
  const input = (await req.json()) as Partial<PostInput>;
  const error = validate(input);
  if (error) return NextResponse.json({ error }, { status: 400 });
  const post = await createPost(input as PostInput);
  return NextResponse.json(post, { status: 201 });
}

// 본문(Tiptap JSON)·태그·상태 최소 검증. 공유용으로 export.
export function validate(input: Partial<PostInput>): string | null {
  if (!input || typeof input !== "object") return "잘못된 요청입니다";
  if (!input.title?.trim()) return "제목이 필요합니다";
  if (!input.body || typeof input.body !== "object") return "본문이 필요합니다";
  if (input.tags && !Array.isArray(input.tags))
    return "태그 형식이 잘못되었습니다";
  if (input.status !== "draft" && input.status !== "published")
    return "상태가 잘못되었습니다";
  return null;
}
