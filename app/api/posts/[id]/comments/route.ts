import { NextResponse } from "next/server";

import { createComment, listComments } from "@/lib/comments";

type Ctx = { params: Promise<{ id: string }> };

// 특정 글의 댓글 목록.
export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  return NextResponse.json(await listComments(id));
}

// 익명 댓글/답글 작성.
export async function POST(req: Request, { params }: Ctx) {
  const { id } = await params;
  const b = (await req.json().catch(() => ({}))) as {
    nickname?: string;
    password?: string;
    body?: string;
    parentId?: string | null;
  };
  if (!b.nickname?.trim() || !b.password || !b.body?.trim()) {
    return NextResponse.json(
      { error: "닉네임·비밀번호·내용을 입력하세요" },
      { status: 400 },
    );
  }
  const comment = await createComment({
    postId: id,
    parentId: b.parentId ?? null,
    nickname: b.nickname.trim(),
    password: b.password,
    body: b.body.trim(),
  });
  return NextResponse.json(comment, { status: 201 });
}
