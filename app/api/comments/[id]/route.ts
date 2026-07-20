import { NextResponse } from "next/server";

import {
  deleteCommentAsOwner,
  deleteCommentWithPassword,
} from "@/lib/comments";
import { isOwner } from "@/lib/auth/session";

// 댓글 삭제 — 소유자면 강제 삭제, 아니면 본인 비밀번호 일치 시.
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (await isOwner()) {
    await deleteCommentAsOwner(id);
    return new NextResponse(null, { status: 204 });
  }

  const { password } = (await req.json().catch(() => ({}))) as {
    password?: string;
  };
  if (!password) {
    return NextResponse.json({ error: "비밀번호가 필요합니다" }, { status: 400 });
  }
  const ok = await deleteCommentWithPassword(id, password);
  if (!ok) {
    return NextResponse.json(
      { error: "비밀번호가 일치하지 않습니다" },
      { status: 403 },
    );
  }
  return new NextResponse(null, { status: 204 });
}
