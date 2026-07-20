import { NextResponse } from "next/server";

import {
  deleteEntryAsOwner,
  deleteEntryWithPassword,
} from "@/lib/guestbook";
import { isOwner } from "@/lib/auth/session";

// 방명록 삭제 — 소유자면 강제 삭제, 아니면 본인 비밀번호 일치 시.
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (await isOwner()) {
    await deleteEntryAsOwner(id);
    return new NextResponse(null, { status: 204 });
  }

  const { password } = (await req.json().catch(() => ({}))) as {
    password?: string;
  };
  if (!password) {
    return NextResponse.json({ error: "비밀번호가 필요합니다" }, { status: 400 });
  }
  const ok = await deleteEntryWithPassword(id, password);
  if (!ok) {
    return NextResponse.json(
      { error: "비밀번호가 일치하지 않습니다" },
      { status: 403 },
    );
  }
  return new NextResponse(null, { status: 204 });
}
