import { NextResponse } from "next/server";

import { createOwnerReply } from "@/lib/guestbook";
import { isOwner } from "@/lib/auth/session";

// 소유자 답글 — 소유자 전용.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isOwner())) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { body } = (await req.json().catch(() => ({}))) as { body?: string };
  if (!body?.trim()) {
    return NextResponse.json({ error: "내용을 입력하세요" }, { status: 400 });
  }
  const reply = await createOwnerReply(id, body.trim());
  return NextResponse.json(reply, { status: 201 });
}
